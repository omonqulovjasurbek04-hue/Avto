import '../generated/scenario.g.dart';
import '../geom.dart';

/// Back-to-front paint order. The renderer sorts by this and nothing else.
enum Layer {
  ground,
  roadSurface,
  markings,
  tramTrack,
  vehicles,
  signs,
  lights,
  overlays,
  hud,
}

/// A single primitive the engine asks the renderer to paint.
///
/// The engine emits a display list; the Flutter `CustomPainter`, the headless
/// rasteriser and any future backend all replay the same list. That is what
/// keeps `engine_dart` free of Flutter and keeps snapshot tests honest.
sealed class DrawOp {
  final Layer layer;

  /// Actor this op belongs to, when it belongs to one. Highlighting in later
  /// phases keys off this rather than re-deriving geometry.
  final String? actorId;

  const DrawOp(this.layer, {this.actorId});

  /// Serialises the op so a non-Dart backend can replay it.
  ///
  /// The editor's Canvas 2D preview consumes this. It exists so there is one
  /// engine rather than a Dart engine plus a drifting TypeScript copy.
  Map<String, dynamic> toJson();

  Map<String, dynamic> _base(String op) => <String, dynamic>{
        'op': op,
        'layer': layer.name,
        if (actorId != null) 'actorId': actorId,
      };
}

List<double> _flat(List<Vec2> points) => [
      for (final p in points) ...[p.x, p.y]
    ];

class FillPolygon extends DrawOp {
  final List<Vec2> points;
  final int colour;

  const FillPolygon(super.layer, this.points, this.colour, {super.actorId});

  @override
  Map<String, dynamic> toJson() =>
      _base('fillPolygon')..addAll({'points': _flat(points), 'colour': colour});
}

class StrokePath extends DrawOp {
  final List<Vec2> points;
  final int colour;
  final double width;
  final bool closed;

  /// `[on, off]` in logical units, or null for a solid stroke.
  final List<double>? dash;

  const StrokePath(
    super.layer,
    this.points,
    this.colour, {
    this.width = 2,
    this.closed = false,
    this.dash,
    super.actorId,
  });

  @override
  Map<String, dynamic> toJson() => _base('strokePath')
    ..addAll({
      'points': _flat(points),
      'colour': colour,
      'width': width,
      'closed': closed,
      if (dash != null) 'dash': dash,
    });
}

class FillCircle extends DrawOp {
  final Vec2 centre;
  final double radius;
  final int colour;

  const FillCircle(super.layer, this.centre, this.radius, this.colour, {super.actorId});

  @override
  Map<String, dynamic> toJson() => _base('fillCircle')
    ..addAll({
      'centre': [centre.x, centre.y],
      'radius': radius,
      'colour': colour
    });
}

/// A road sign, identified by code. The renderer owns the artwork; the engine
/// only says which sign goes where and how big.
class SignGlyph extends DrawOp {
  final Vec2 centre;
  final String code;
  final double size;

  const SignGlyph(this.centre, this.code, this.size) : super(Layer.signs);

  @override
  Map<String, dynamic> toJson() => _base('signGlyph')
    ..addAll({
      'centre': [centre.x, centre.y],
      'code': code,
      'size': size
    });
}

/// A traffic light head.
class LightGlyph extends DrawOp {
  final Vec2 centre;
  final LightState state;
  final double size;

  const LightGlyph(this.centre, this.state, this.size) : super(Layer.lights);

  @override
  Map<String, dynamic> toJson() => _base('lightGlyph')
    ..addAll({
      'centre': [centre.x, centre.y],
      'state': state.wire,
      'size': size
    });
}

/// The complete painting instruction for one frame.
class RenderScene {
  final List<DrawOp> ops;

  const RenderScene(this.ops);

  /// Ops in paint order. Stable sort keeps emission order within a layer, which
  /// is what makes snapshots byte-identical run to run.
  List<DrawOp> get ordered {
    final indexed = [for (var i = 0; i < ops.length; i++) (i, ops[i])];
    indexed.sort((a, b) {
      final c = a.$2.layer.index.compareTo(b.$2.layer.index);
      return c != 0 ? c : a.$1.compareTo(b.$1);
    });
    return [for (final e in indexed) e.$2];
  }
}
