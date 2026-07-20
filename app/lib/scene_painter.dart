import 'dart:ui' as ui;

import 'package:engine_dart/engine_dart.dart' as engine;
import 'package:flutter/widgets.dart';

/// Replays the engine's display list onto a Flutter canvas.
///
/// This class contains no scene knowledge. It scales the logical 1000x1000
/// canvas to fit the widget and paints ops in the order the engine emitted
/// them. All geometry, layering and colour decisions were already made in
/// engine_dart - which is what keeps the two renderers (this and the headless
/// rasteriser) in agreement.
class ScenePainter extends CustomPainter {
  final engine.RenderScene scene;

  ScenePainter(this.scene);

  @override
  void paint(Canvas canvas, Size size) {
    final scale = size.shortestSide / engine.kCanvas;
    canvas.save();
    // Centre the square viewport in the widget.
    canvas.translate(
      (size.width - engine.kCanvas * scale) / 2,
      (size.height - engine.kCanvas * scale) / 2,
    );
    canvas.scale(scale);

    for (final op in engine.expandGlyphs(scene).ops) {
      switch (op) {
        case engine.FillPolygon o:
          canvas.drawPath(_polygon(o.points, close: true), _fill(o.colour));
        case engine.StrokePath o:
          final paint = _stroke(o.colour, o.width);
          if (o.dash == null) {
            canvas.drawPath(_polygon(o.points, close: o.closed), paint);
          } else {
            canvas.drawPath(
              _dashed(_polygon(o.points, close: o.closed), o.dash!),
              paint,
            );
          }
        case engine.FillCircle o:
          canvas.drawCircle(Offset(o.centre.x, o.centre.y), o.radius, _fill(o.colour));
        case engine.SignGlyph _:
        case engine.LightGlyph _:
          // expandGlyphs already lowered these to primitives.
          break;
      }
    }
    canvas.restore();
  }

  Path _polygon(List<engine.Vec2> pts, {required bool close}) {
    final path = Path()..moveTo(pts.first.x, pts.first.y);
    for (final p in pts.skip(1)) {
      path.lineTo(p.x, p.y);
    }
    if (close) path.close();
    return path;
  }

  /// Same on/off walk the headless rasteriser uses, so both backends dash
  /// identically without a path-effects dependency.
  Path _dashed(Path source, List<double> dash) {
    final on = dash[0];
    final off = dash.length > 1 ? dash[1] : dash[0];
    final out = Path();
    for (final ui.PathMetric metric in source.computeMetrics()) {
      var distance = 0.0;
      var drawing = true;
      while (distance < metric.length) {
        final len = drawing ? on : off;
        if (drawing) {
          out.addPath(
            metric.extractPath(distance, (distance + len).clamp(0, metric.length)),
            Offset.zero,
          );
        }
        distance += len;
        drawing = !drawing;
      }
    }
    return out;
  }

  Paint _fill(int argb) => Paint()
    ..style = PaintingStyle.fill
    ..isAntiAlias = true
    ..color = Color(argb);

  Paint _stroke(int argb, double width) => Paint()
    ..style = PaintingStyle.stroke
    ..strokeWidth = width
    ..isAntiAlias = true
    ..color = Color(argb);

  @override
  bool shouldRepaint(ScenePainter oldDelegate) => oldDelegate.scene != scene;
}

/// Static scene view (`preview` mode - frozen at t = 0).
class ScenarioPreview extends StatelessWidget {
  final engine.Scenario scenario;

  /// Called with anything the engine could not draw. The editor shows these;
  /// the student-facing app should report them rather than ship a scene that
  /// silently omits a declared sign or marking.
  final void Function(List<engine.ContentWarning>)? onWarnings;

  const ScenarioPreview({super.key, required this.scenario, this.onWarnings});

  @override
  Widget build(BuildContext context) {
    final built = engine.SceneBuilder(scenario).build();
    if (built.warnings.isNotEmpty && onWarnings != null) {
      WidgetsBinding.instance.addPostFrameCallback((_) => onWarnings!(built.warnings));
    }
    return AspectRatio(
      aspectRatio: 1,
      child: CustomPaint(
        painter: ScenePainter(built.scene),
        size: Size.infinite,
      ),
    );
  }
}
