/// Deterministic scenario engine.
///
/// Pure Dart. No Flutter, no randomness, no wall-clock time. Give it the same
/// scenario and it produces the same display list, every run, on every host.
library;

export 'src/generated/scenario.g.dart';
export 'src/geom.dart';
export 'src/layout.dart';
export 'src/motion/choreography.dart';
export 'src/motion/curve.dart';
export 'src/motion/motion_profile.dart';
export 'src/motion/outcome.dart';
export 'src/motion/playback.dart';
export 'src/motion/simulation.dart';
export 'src/motion/trajectory.dart';
export 'src/render/content_warning.dart';
export 'src/render/draw_op.dart';
export 'src/render/palette.dart';
export 'src/render/scene_builder.dart';
export 'src/render/scene_json.dart';
export 'src/render/sign_art.dart';
export 'src/render/viewport.dart';
