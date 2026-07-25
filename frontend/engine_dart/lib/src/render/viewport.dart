import 'dart:math' as math;

import '../geom.dart';
import 'draw_op.dart';

/// Maps the logical 1000x1000 model space onto an output surface.
///
/// Every backend goes through this rather than scaling by hand, so the headless
/// rasteriser, the golden tests and the app cannot drift apart. Device pixels
/// never enter the model - they only ever enter here.
class Viewport {
  final double scale;
  final Vec2 offset;

  const Viewport({required this.scale, this.offset = const Vec2(0, 0)});

  /// Fits the square logical canvas inside [width] x [height] and centres it.
  factory Viewport.fit(double width, double height) {
    final s = math.min(width, height) / kCanvas;
    return Viewport(
      scale: s,
      offset: Vec2((width - kCanvas * s) / 2, (height - kCanvas * s) / 2),
    );
  }

  Vec2 map(Vec2 p) => Vec2(p.x * scale + offset.x, p.y * scale + offset.y);

  List<Vec2> mapAll(List<Vec2> ps) => [for (final p in ps) map(p)];

  /// Returns a copy of [scene] with every coordinate and width in output units.
  ///
  /// Backends with a native transform stack (Flutter) should scale the canvas
  /// instead; this exists for backends that have none.
  RenderScene apply(RenderScene scene) {
    return RenderScene([
      for (final op in scene.ordered)
        switch (op) {
          FillPolygon o => FillPolygon(o.layer, mapAll(o.points), o.colour, actorId: o.actorId),
          StrokePath o => StrokePath(
              o.layer,
              mapAll(o.points),
              o.colour,
              width: o.width * scale,
              closed: o.closed,
              dash: o.dash == null ? null : [for (final d in o.dash!) d * scale],
              actorId: o.actorId,
            ),
          FillCircle o =>
            FillCircle(o.layer, map(o.centre), o.radius * scale, o.colour, actorId: o.actorId),
          SignGlyph o => SignGlyph(map(o.centre), o.code, o.size * scale),
          LightGlyph o => LightGlyph(map(o.centre), o.state, o.size * scale),
        }
    ]);
  }
}
