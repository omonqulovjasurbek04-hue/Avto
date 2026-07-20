// Exports display lists as JSON, for backends that are not Dart.
//
//   dart run bin/export_scene.dart ../content ../build/scenes
//
// The JS build produces the same output from the same source; tools/verify_js.js
// compares the two so a compiled-to-JS engine cannot quietly diverge.
import 'dart:convert';
import 'dart:io';

import 'package:engine_dart/engine_dart.dart';

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
    final json = const JsonEncoder.withIndent('  ').convert(sceneToJson(sc));
    File('${outDir.path}/${sc.id}.json').writeAsStringSync(json);
    stdout.writeln('exported ${sc.id}');
  }
}
