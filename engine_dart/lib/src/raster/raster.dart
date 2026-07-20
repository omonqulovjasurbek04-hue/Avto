import 'dart:io';
import 'dart:math' as math;
import 'dart:typed_data';

import '../geom.dart';
import '../render/draw_op.dart';
import '../render/sign_art.dart';

/// Headless software rasteriser.
///
/// Exists so Phase 1 golden-file tests can run in CI without Flutter, and so a
/// scene can be eyeballed as a PNG during authoring. The app does not use it -
/// Flutter replays the same display list on a real canvas.
class RasterCanvas {
  final int width;
  final int height;

  /// Supersampling factor. Fixed, never adaptive - determinism first.
  final int ss;

  late final int _w = width * ss;
  late final int _h = height * ss;
  late final Uint8List _px = Uint8List(_w * _h * 4);

  RasterCanvas(this.width, this.height, {this.ss = 3}) {
    for (var i = 0; i < _px.length; i += 4) {
      _px[i] = 255;
      _px[i + 1] = 255;
      _px[i + 2] = 255;
      _px[i + 3] = 255;
    }
  }

  // ------------------------------------------------------------------ pixels

  void _blend(int x, int y, int a, int r, int g, int b) {
    if (x < 0 || y < 0 || x >= _w || y >= _h || a == 0) return;
    final i = (y * _w + x) * 4;
    if (a == 255) {
      _px[i] = r;
      _px[i + 1] = g;
      _px[i + 2] = b;
      return;
    }
    final ia = 255 - a;
    _px[i] = (r * a + _px[i] * ia) ~/ 255;
    _px[i + 1] = (g * a + _px[i + 1] * ia) ~/ 255;
    _px[i + 2] = (b * a + _px[i + 2] * ia) ~/ 255;
  }

  // --------------------------------------------------------------- polygons

  /// Nonzero-winding scanline fill. Points are in logical units.
  void fillPolygon(List<Vec2> pts, int colour) {
    if (pts.length < 3) return;
    final a = (colour >> 24) & 0xFF;
    final r = (colour >> 16) & 0xFF;
    final g = (colour >> 8) & 0xFF;
    final b = colour & 0xFF;
    if (a == 0) return;

    final xs = [for (final p in pts) p.x * ss];
    final ys = [for (final p in pts) p.y * ss];

    var minY = ys.reduce(math.min).floor();
    var maxY = ys.reduce(math.max).ceil();
    minY = math.max(0, minY);
    maxY = math.min(_h - 1, maxY);

    final crossings = <(double, int)>[];
    for (var py = minY; py <= maxY; py++) {
      final sy = py + 0.5;
      crossings.clear();
      for (var i = 0; i < pts.length; i++) {
        final j = (i + 1) % pts.length;
        final y0 = ys[i], y1 = ys[j];
        if (y0 == y1) continue;
        if ((y0 <= sy && y1 > sy) || (y1 <= sy && y0 > sy)) {
          final t = (sy - y0) / (y1 - y0);
          crossings.add((xs[i] + t * (xs[j] - xs[i]), y1 > y0 ? 1 : -1));
        }
      }
      if (crossings.isEmpty) continue;
      crossings.sort((p, q) => p.$1.compareTo(q.$1));

      var winding = 0;
      for (var k = 0; k < crossings.length - 1; k++) {
        winding += crossings[k].$2;
        if (winding == 0) continue;
        final x0 = math.max(0, crossings[k].$1.round());
        final x1 = math.min(_w, crossings[k + 1].$1.round());
        for (var px = x0; px < x1; px++) {
          _blend(px, py, a, r, g, b);
        }
      }
    }
  }

  void fillCircle(Vec2 centre, double radius, int colour) {
    const segments = 48;
    fillPolygon([
      for (var i = 0; i < segments; i++)
        Vec2(
          centre.x + radius * math.cos(i * 2 * math.pi / segments),
          centre.y + radius * math.sin(i * 2 * math.pi / segments),
        ),
    ], colour);
  }

  // ---------------------------------------------------------------- strokes

  /// Strokes are filled quads plus square joins - good enough for road paint
  /// and free of any dependency on a path library.
  void strokePath(List<Vec2> pts, int colour,
      {double width = 2, bool closed = false, List<double>? dash}) {
    if (pts.length < 2) return;
    final segments = <(Vec2, Vec2)>[];
    final n = closed ? pts.length : pts.length - 1;
    for (var i = 0; i < n; i++) {
      segments.add((pts[i], pts[(i + 1) % pts.length]));
    }

    final drawn = dash == null ? segments : _applyDash(segments, dash);
    final half = width / 2;
    for (final (a, b) in drawn) {
      final d = (b - a);
      if (d.length == 0) continue;
      final off = d.normalized.perpRight * half;
      fillPolygon([a + off, b + off, b - off, a - off], colour);
    }
    // Square off the joins so corners do not show notches.
    if (dash == null && width > 3) {
      final joints = closed ? pts : pts.sublist(1, pts.length - 1);
      for (final p in joints) {
        fillPolygon(Rect.centred(p, half, half).corners, colour);
      }
    }
  }

  /// Walks the polyline by arc length, emitting the "on" runs.
  List<(Vec2, Vec2)> _applyDash(List<(Vec2, Vec2)> segments, List<double> dash) {
    final on = dash[0];
    final off = dash.length > 1 ? dash[1] : dash[0];
    final out = <(Vec2, Vec2)>[];
    var phase = 0.0; // distance into the current on/off cycle
    var drawing = true;

    for (final (a, b) in segments) {
      final total = (b - a).length;
      if (total == 0) continue;
      final dir = (b - a).normalized;
      var travelled = 0.0;
      while (travelled < total) {
        final span = (drawing ? on : off) - phase;
        final step = math.min(span, total - travelled);
        if (drawing && step > 0) {
          out.add((a + dir * travelled, a + dir * (travelled + step)));
        }
        travelled += step;
        phase += step;
        if (phase >= (drawing ? on : off) - 1e-9) {
          drawing = !drawing;
          phase = 0;
        }
      }
    }
    return out;
  }

  // ------------------------------------------------------------------ replay

  void drawScene(RenderScene scene) {
    for (final op in expandGlyphs(scene).ops) {
      switch (op) {
        case FillPolygon o:
          fillPolygon(o.points, o.colour);
        case StrokePath o:
          strokePath(o.points, o.colour, width: o.width, closed: o.closed, dash: o.dash);
        case FillCircle o:
          fillCircle(o.centre, o.radius, o.colour);
        case SignGlyph _:
        case LightGlyph _:
          throw StateError('glyphs should have been expanded');
      }
    }
  }

  // ------------------------------------------------------------------ output

  /// Box-downsamples the supersampled buffer to the output resolution.
  Uint8List resolve() {
    if (ss == 1) return _px;
    final out = Uint8List(width * height * 4);
    final area = ss * ss;
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        var r = 0, g = 0, b = 0;
        for (var sy = 0; sy < ss; sy++) {
          var i = ((y * ss + sy) * _w + x * ss) * 4;
          for (var sx = 0; sx < ss; sx++) {
            r += _px[i];
            g += _px[i + 1];
            b += _px[i + 2];
            i += 4;
          }
        }
        final o = (y * width + x) * 4;
        out[o] = r ~/ area;
        out[o + 1] = g ~/ area;
        out[o + 2] = b ~/ area;
        out[o + 3] = 255;
      }
    }
    return out;
  }

  Uint8List toPng() => encodePng(resolve(), width, height);
}

// -------------------------------------------------------------------- PNG

final List<int> _crcTable = List<int>.generate(256, (n) {
  var c = n;
  for (var k = 0; k < 8; k++) {
    c = (c & 1) != 0 ? 0xEDB88320 ^ (c >> 1) : c >> 1;
  }
  return c;
});

int _crc32(List<int> bytes) {
  var c = 0xFFFFFFFF;
  for (final b in bytes) {
    c = _crcTable[(c ^ b) & 0xFF] ^ (c >> 8);
  }
  return (c ^ 0xFFFFFFFF) & 0xFFFFFFFF;
}

List<int> _chunk(String type, List<int> data) {
  final body = <int>[...type.codeUnits, ...data];
  final crc = _crc32(body);
  return [
    (data.length >> 24) & 0xFF, (data.length >> 16) & 0xFF,
    (data.length >> 8) & 0xFF, data.length & 0xFF,
    ...body,
    (crc >> 24) & 0xFF, (crc >> 16) & 0xFF, (crc >> 8) & 0xFF, crc & 0xFF,
  ];
}

/// Minimal RGBA PNG writer. Filter type 0 on every scanline keeps this simple
/// and, more importantly, byte-deterministic.
Uint8List encodePng(Uint8List rgba, int width, int height) {
  final raw = Uint8List(height * (width * 4 + 1));
  var o = 0;
  for (var y = 0; y < height; y++) {
    raw[o++] = 0;
    raw.setRange(o, o + width * 4, rgba, y * width * 4);
    o += width * 4;
  }

  final ihdr = <int>[
    (width >> 24) & 0xFF, (width >> 16) & 0xFF, (width >> 8) & 0xFF, width & 0xFF,
    (height >> 24) & 0xFF, (height >> 16) & 0xFF, (height >> 8) & 0xFF, height & 0xFF,
    8, 6, 0, 0, 0,
  ];

  return Uint8List.fromList([
    137, 80, 78, 71, 13, 10, 26, 10,
    ..._chunk('IHDR', ihdr),
    ..._chunk('IDAT', ZLibCodec(level: 6).encode(raw)),
    ..._chunk('IEND', const []),
  ]);
}
