// Renders scenarios to PNG.
//
//   dart run bin/render.dart ../content ../build/preview
//
// Used for eyeballing scenes during authoring and as the producer for the
// golden-file snapshot tests.
import 'dart:convert';
import 'dart:io';

import 'package:engine_dart/engine_dart.dart';
import 'package:engine_dart/raster.dart';

const int kOutputSize = 900;

Uint8ListLike renderScenario(Scenario sc) {
  final canvas = RasterCanvas(kOutputSize, kOutputSize, ss: 3);
  // Logical 1000x1000 -> output pixels. The viewport scales; the model does not.
  final scale = kOutputSize / kCanvas;
  canvas.drawScene(_scaled(SceneBuilder(sc).build(), scale));
  return canvas.toPng();
}

typedef Uint8ListLike = List<int>;

/// Viewport transform applied at paint time, never baked into the model.
RenderScene _scaled(RenderScene scene, double s) {
  Vec2 f(Vec2 p) => Vec2(p.x * s, p.y * s);
  List<Vec2> fs(List<Vec2> ps) => [for (final p in ps) f(p)];

  return RenderScene([
    for (final op in scene.ordered)
      switch (op) {
        FillPolygon o => FillPolygon(o.layer, fs(o.points), o.colour, actorId: o.actorId),
        StrokePath o => StrokePath(o.layer, fs(o.points), o.colour,
            width: o.width * s, closed: o.closed,
            dash: o.dash == null ? null : [for (final d in o.dash!) d * s],
            actorId: o.actorId),
        FillCircle o => FillCircle(o.layer, f(o.centre), o.radius * s, o.colour, actorId: o.actorId),
        SignGlyph o => SignGlyph(f(o.centre), o.code, o.size * s),
        LightGlyph o => LightGlyph(f(o.centre), o.state, o.size * s),
      }
  ]);
}

void main(List<String> args) {
  if (args.length < 2) {
    stderr.writeln('usage: dart run bin/render.dart <content-dir> <out-dir>');
    exit(2);
  }
  final inDir = Directory(args[0]);
  final outDir = Directory(args[1])..createSync(recursive: true);

  final files = inDir
      .listSync()
      .whereType<File>()
      .where((f) => f.path.endsWith('.json'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));

  for (final f in files) {
    final sc = Scenario.fromJson(jsonDecode(f.readAsStringSync()) as Map<String, dynamic>);
    final png = renderScenario(sc);
    final out = File('${outDir.path}/${sc.id}.png')..writeAsBytesSync(png);
    stdout.writeln('rendered ${sc.id}  ->  ${out.path}  (${png.length} bytes)');
  }
}
