import 'dart:math' as math;
import 'dart:ui' as ui;

import 'package:engine_dart/engine_dart.dart' as engine;
import 'package:flutter/material.dart';
import 'package:flutter/scheduler.dart' show Ticker;
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

/// Plays a scenario: the correct answer, or - once the student taps an option -
/// their own choice, freezing at the crash for a wrong one.
///
/// The engine does all the work. This widget only owns the clock (a [Ticker]
/// with a fixed 60Hz accumulator, so the animation is frame-rate independent)
/// and asks [engine.ScenePlayer.frameAt] for a display list to paint. It is the
/// Flutter twin of editor/public/viewer.html; both drive the identical engine.
class ScenarioPlayer extends StatefulWidget {
  final engine.Scenario scenario;

  const ScenarioPlayer({super.key, required this.scenario});

  @override
  State<ScenarioPlayer> createState() => _ScenarioPlayerState();
}

class _ScenarioPlayerState extends State<ScenarioPlayer> with SingleTickerProviderStateMixin {
  static const _dt = 1 / 60;
  static const _speeds = [0.25, 0.5, 1.0, 2.0];

  late final Ticker _ticker;
  late engine.ScenePlayer _player;
  late Map<String, engine.OutcomeResult> _outcomes;

  /// The option being played, or null for the correct answer.
  String? _selected;
  double _time = 0;
  double _speed = 1;
  bool _playing = false;
  double _acc = 0;
  Duration _last = Duration.zero;

  @override
  void initState() {
    super.initState();
    _outcomes = engine.classifyOptions(widget.scenario);
    _player = engine.ScenePlayer.of(widget.scenario);
    _ticker = createTicker(_onTick);
    _play();
  }

  @override
  void dispose() {
    _ticker.dispose();
    super.dispose();
  }

  void _onTick(Duration elapsed) {
    final delta = ((elapsed - _last).inMicroseconds / 1e6).clamp(0.0, 0.25);
    _last = elapsed;
    _acc += delta * _speed;
    final dur = _player.duration;
    while (_acc >= _dt) {
      _time = math.min(_time + _dt, dur);
      _acc -= _dt;
    }
    if (_time >= dur) _pause();
    setState(() {});
  }

  void _play() {
    if (_playing) return;
    if (_time >= _player.duration) _time = 0; // replay from the top
    _playing = true;
    _acc = 0;
    _last = Duration.zero;
    _ticker.start();
    setState(() {});
  }

  void _pause() {
    _playing = false;
    if (_ticker.isActive) _ticker.stop();
    setState(() {});
  }

  void _select(String? optionId) {
    _pause();
    _selected = optionId;
    _player = optionId == null
        ? engine.ScenePlayer.of(widget.scenario)
        : engine.ScenePlayer.forPlayback(widget.scenario, _outcomes[optionId]!.playback);
    _time = 0;
    _play();
  }

  @override
  Widget build(BuildContext context) {
    final locale = Localizations.maybeLocaleOf(context)?.languageCode;
    final options = widget.scenario.question.options;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        AspectRatio(
          aspectRatio: 1,
          child: CustomPaint(painter: ScenePainter(_player.frameAt(_time).scene)),
        ),
        _transport(),
        const SizedBox(height: 8),
        for (final o in options) _optionTile(o, locale),
      ],
    );
  }

  Widget _transport() {
    final dur = _player.duration;
    return Row(
      children: [
        IconButton(
          icon: Icon(_playing ? Icons.pause : Icons.play_arrow),
          onPressed: () => _playing ? _pause() : _play(),
        ),
        Expanded(
          child: Slider(
            value: _time.clamp(0, dur),
            max: dur,
            onChanged: (v) {
              _pause();
              setState(() => _time = v);
            },
          ),
        ),
        Text('${_time.toStringAsFixed(1)}s'),
        const SizedBox(width: 8),
        for (final s in _speeds)
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 2),
            child: ChoiceChip(
              label: Text('${s}x'),
              selected: _speed == s,
              onSelected: (_) => setState(() => _speed = s),
            ),
          ),
      ],
    );
  }

  Widget _optionTile(engine.Option o, String? locale) {
    final outcome = _outcomes[o.id]!;
    final label = locale == null ? o.id : (o.label[locale] ?? o.id);
    final verdict = outcome.isClean ? 'correct' : (outcome.violation?.wire ?? 'wrong');
    return Card(
      color: o.id == _selected ? Theme.of(context).colorScheme.primaryContainer : null,
      child: ListTile(
        title: Text(label),
        trailing: Text(
          verdict,
          style: TextStyle(color: outcome.isClean ? Colors.green : Colors.red),
        ),
        onTap: () => _select(o.id),
      ),
    );
  }
}
