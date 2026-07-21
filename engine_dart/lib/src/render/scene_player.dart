import '../generated/scenario.g.dart';
import '../motion/playback.dart';
import '../motion/simulation.dart';
import 'content_warning.dart';
import 'draw_op.dart';
import 'scene_builder.dart';

/// An animatable scene: the static layers built once, the vehicles redrawn per
/// frame from a [Playback].
///
/// This is the render-side counterpart to [Playback]. Construct it once (the
/// static scene, the choreography and the collision sweep all happen here) and
/// call [frameAt] each tick; a frame then costs only the vehicle ops. Every
/// backend - the Flutter painter, the headless rasteriser, the browser canvas -
/// drives it the same way, so they cannot animate a scene differently.
class ScenePlayer {
  final Playback playback;
  final SceneBuilder _builder;
  final List<DrawOp> _staticOps;

  /// Static content warnings plus any raised about the playback itself.
  final List<ContentWarning> warnings;

  ScenePlayer._(this._builder, this.playback, this._staticOps, this.warnings);

  /// Plays the scenario's correct answer (`resolution.order`).
  factory ScenePlayer.of(Scenario scenario) =>
      ScenePlayer.forPlayback(scenario, Playback.of(scenario));

  /// Plays a specific [playback] - e.g. the one the outcome classifier built
  /// for a wrong answer, so the app can show the student their own choice.
  factory ScenePlayer.forPlayback(Scenario scenario, Playback playback) {
    final builder = SceneBuilder(scenario);
    final static_ = builder.buildStatic();
    final warnings = [
      ...static_.warnings,
      ..._playbackWarnings(playback),
    ];
    return ScenePlayer._(builder, playback, static_.scene.ops, warnings);
  }

  double get duration => playback.duration;
  CollisionEvent? get collision => playback.collision;

  /// The display list at time [t], static layers plus the vehicles where they
  /// are now.
  BuiltScene frameAt(double t) => BuiltScene(
        RenderScene([..._staticOps, ..._builder.vehicleOps(playback.posesAt(t))]),
        warnings,
      );
}

/// The spec wants a scene's playback to land between 4 and 9 seconds. A crash
/// legitimately ends early, so only a clean run is measured.
List<ContentWarning> _playbackWarnings(Playback playback) {
  if (playback.collided) return const [];
  final d = playback.duration;
  if (d >= 4 && d <= 9) return const [];
  return [
    ContentWarning(
      WarningCode.playbackDurationOutOfRange,
      'resolution.order',
      'choreographed playback runs ${d.toStringAsFixed(1)}s, outside the 4-9s window',
    ),
  ];
}
