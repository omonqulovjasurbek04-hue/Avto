import 'dart:math' as math;

import '../generated/scenario.g.dart';
import '../geom.dart';
import 'draw_op.dart';

/// Turns semantic sign and light glyphs into primitives.
///
/// Kept out of [SceneBuilder] so every backend - the headless rasteriser, the
/// Flutter painter, the editor preview - draws the same artwork from the same
/// code. The shape family is derived from the YHQ code prefix, so a new sign
/// costs nothing until it needs bespoke artwork.
List<DrawOp> expandSign(SignGlyph g) {
  final r = g.size / 2;
  final family = g.code.split('.').first;

  List<Vec2> ngon(int n, double radius, double phase) => [
        for (var i = 0; i < n; i++)
          Vec2(
            g.centre.x + radius * math.cos(phase + i * 2 * math.pi / n),
            g.centre.y + radius * math.sin(phase + i * 2 * math.pi / n),
          ),
      ];

  const white = 0xFFF7F8F9;
  const red = 0xFFCC2B2B;
  const blue = 0xFF1F5FA8;
  const yellow = 0xFFF2C230;
  const dark = 0xFF23282E;

  switch (g.code) {
    // Priority road: yellow diamond in a white surround.
    case '2.1':
      return [
        FillPolygon(Layer.signs, ngon(4, r, -math.pi / 2), white),
        FillPolygon(Layer.signs, ngon(4, r * 0.62, -math.pi / 2), yellow),
        StrokePath(Layer.signs, ngon(4, r, -math.pi / 2), dark, width: 2, closed: true),
      ];
    // Give way: white triangle, point down, red border.
    case '2.4':
      final t = ngon(3, r, math.pi / 2);
      return [
        FillPolygon(Layer.signs, t, red),
        FillPolygon(Layer.signs, ngon(3, r * 0.7, math.pi / 2), white),
        StrokePath(Layer.signs, t, dark, width: 2, closed: true),
      ];
    // Stop: red octagon.
    case '2.5':
      final o = ngon(8, r, math.pi / 8);
      return [
        FillPolygon(Layer.signs, o, red),
        StrokePath(Layer.signs, ngon(8, r * 0.78, math.pi / 8), white, width: 3, closed: true),
        StrokePath(Layer.signs, o, dark, width: 2, closed: true),
      ];
  }

  return switch (family) {
    // Warning: white triangle, point up, red border.
    '1' => [
        FillPolygon(Layer.signs, ngon(3, r, -math.pi / 2), red),
        FillPolygon(Layer.signs, ngon(3, r * 0.7, -math.pi / 2), white),
        StrokePath(Layer.signs, ngon(3, r, -math.pi / 2), dark, width: 2, closed: true),
      ],
    // Prohibitory: white disc, red ring.
    '3' => [
        FillCircle(Layer.signs, g.centre, r, red),
        FillCircle(Layer.signs, g.centre, r * 0.72, white),
      ],
    // Mandatory: blue disc.
    '4' => [
        FillCircle(Layer.signs, g.centre, r, white),
        FillCircle(Layer.signs, g.centre, r * 0.88, blue),
      ],
    // Informational: blue square.
    '5' || '6' => [
        FillPolygon(Layer.signs, Rect.centred(g.centre, r, r).corners, white),
        FillPolygon(Layer.signs, Rect.centred(g.centre, r * 0.86, r * 0.86).corners, blue),
      ],
    _ => [
        FillCircle(Layer.signs, g.centre, r, white),
        StrokePath(Layer.signs, ngon(24, r, 0), dark, width: 2, closed: true),
      ],
  };
}

List<DrawOp> expandLight(LightGlyph g) {
  const housing = 0xFF23282E;
  const dim = 0xFF3C4249;
  final w = g.size * 0.42;
  final h = g.size * 1.05;
  final ops = <DrawOp>[
    FillPolygon(Layer.lights, Rect.centred(g.centre, w / 2, h / 2).corners, housing),
  ];

  const on = {
    LightState.red: 0,
    LightState.yellow: 1,
    LightState.yellowBlink: 1,
    LightState.green: 2,
    LightState.greenBlink: 2,
  };
  const lit = [0xFFE23B3B, 0xFFF2C230, 0xFF3FB55C];
  final active = on[g.state];
  final r = w * 0.32;

  for (var i = 0; i < 3; i++) {
    final c = Vec2(g.centre.x, g.centre.y - h / 2 + h * (i + 0.5) / 3);
    ops.add(FillCircle(Layer.lights, c, r, i == active ? lit[i] : dim));
  }
  return ops;
}

/// Replaces every glyph in [scene] with its primitives, leaving other ops
/// untouched. Backends that have their own sign artwork can skip this.
RenderScene expandGlyphs(RenderScene scene) {
  final out = <DrawOp>[];
  for (final op in scene.ordered) {
    switch (op) {
      case SignGlyph g:
        out.addAll(expandSign(g));
      case LightGlyph g:
        out.addAll(expandLight(g));
      default:
        out.add(op);
    }
  }
  return RenderScene(out);
}
