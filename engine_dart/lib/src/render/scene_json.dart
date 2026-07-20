import '../generated/scenario.g.dart';
import '../geom.dart';
import 'scene_builder.dart';
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
