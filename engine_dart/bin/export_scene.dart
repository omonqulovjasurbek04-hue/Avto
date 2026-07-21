// Exports animation-frame display lists as JSON, for backends that are not
// Dart.
//
//   dart run bin/export_scene.dart ../content ../build/scenes
//
// One file per scenario, each holding the display list at several points along
// its playback. The JS build produces the same frames from the same source;
// tools/verify_js.js compares the two so a compiled-to-JS engine cannot quietly
// diverge - now across the whole animation, not just the first frame.
import 'dart:convert';
import 'dart:io';

import 'package:engine_dart/engine_dart.dart';

/// Sample times, in seconds. Kept in sync with tools/verify_js.js and the motion
/// goldens: all inside the shortest scene's playback so a vehicle is on screen.
const List<double> kSampleTimes = [0.0, 0.5, 1.0, 2.0, 3.0];

void main(List<String> args) {
  if (args.length < 2) {
    stderr.writeln('usage: dart run bin/export_scene.dart <content-dir> <out-dir>');
    exit(2);
  }
  final outDir = Directory(args[1])..createSync(recursive: true);

  final files = Directory(args[0])
      .listSync()
      .whereType<File>()
      .where((f) => f.path.endsWith('.json'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));

  for (final f in files) {
    final sc = Scenario.fromJson(jsonDecode(f.readAsStringSync()) as Map<String, dynamic>);
    // Build the player once and step it, matching how a real client animates.
    final player = ScenePlayer.of(sc);
    final out = {
      'id': sc.id,
      'frames': [for (final t in kSampleTimes) playerFrameToJson(player, sc.id, t)],
    };
    final json = const JsonEncoder.withIndent('  ').convert(out);
    File('${outDir.path}/${sc.id}.json').writeAsStringSync(json);
    stdout.writeln('exported ${sc.id} (${kSampleTimes.length} frames)');
  }
}
