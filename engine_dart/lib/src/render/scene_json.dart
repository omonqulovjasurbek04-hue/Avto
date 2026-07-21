import '../generated/scenario.g.dart';
import '../geom.dart';
import '../motion/outcome.dart';
import '../motion/playback.dart';
import 'scene_builder.dart';
import 'scene_player.dart';
import 'sign_art.dart';

/// Serialises a built scene for a non-Dart backend.
///
/// Shared by the JS entry point (`web/engine_web.dart`) and the VM exporter
/// (`bin/export_scene.dart`) so the two cannot disagree - which is what makes
/// the cross-compilation test meaningful.
///
/// Glyphs are expanded, so a consumer only implements three primitives:
/// fill a polygon, stroke a path, fill a circle.
Map<String, dynamic> sceneToJson(Scenario scenario) {
  final built = SceneBuilder(scenario).build();
  final expanded = expandGlyphs(built.scene);

  return <String, dynamic>{
    'id': scenario.id,
    'canvas': kCanvas,
    'ops': [for (final op in expanded.ops) op.toJson()],
    'warnings': [for (final w in built.warnings) w.toJson()],
  };
}

/// One animation frame's display list, at time [t], for a non-Dart backend.
///
/// The player is passed in rather than rebuilt, so a caller stepping through a
/// playback pays the static-scene cost once. [sceneFrameToJson] is the
/// convenience that builds the correct-answer player for a single frame.
Map<String, dynamic> playerFrameToJson(ScenePlayer player, String id, double t) {
  final expanded = expandGlyphs(player.frameAt(t).scene);
  return <String, dynamic>{
    'id': id,
    'canvas': kCanvas,
    't': t,
    'ops': [for (final op in expanded.ops) op.toJson()],
    'warnings': [for (final w in player.warnings) w.toJson()],
  };
}

Map<String, dynamic> sceneFrameToJson(Scenario scenario, double t) =>
    playerFrameToJson(ScenePlayer.of(scenario), scenario.id, t);

/// Playback metadata a browser needs to drive the animation: how long it runs,
/// whether and when it crashes, and the computed outcome of every option (so
/// the viewer can replay a wrong answer). Text-free: pure timing and ids.
Map<String, dynamic> scenePlaybackInfo(Scenario scenario) {
  final correct = Playback.of(scenario);
  final outcomes = classifyOptions(scenario);
  return <String, dynamic>{
    'id': scenario.id,
    'duration': correct.duration,
    if (correct.collision != null) 'collision': correct.collision!.toJson(),
    'options': {
      for (final entry in outcomes.entries)
        entry.key: {
          ...entry.value.toJson(),
          'duration': entry.value.playback.duration,
        },
    },
  };
}
