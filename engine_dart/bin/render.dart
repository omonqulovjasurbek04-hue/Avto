// Renders scenarios to PNG.
//
//   dart run bin/render.dart ../content ../build/preview
//
// Used for eyeballing scenes during authoring and as the producer for the
// golden-file snapshot tests. Content warnings are printed, never swallowed.
import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:engine_dart/engine_dart.dart';
import 'package:engine_dart/raster.dart';

const int kOutputSize = 900;

/// Renders one scenario, returning the PNG and anything the engine could not
/// draw.
({Uint8List png, List<ContentWarning> warnings}) renderScenario(Scenario sc) {
  final canvas = RasterCanvas(kOutputSize, kOutputSize, ss: 3);
  final built = SceneBuilder(sc).build();
  canvas.drawScene(Viewport(scale: kOutputSize / kCanvas).apply(built.scene));
  return (png: canvas.toPng(), warnings: built.warnings);
}

void main(List<String> args) {
  if (args.length < 2) {
    stderr.writeln('usage: dart run bin/render.dart <content-dir> <out-dir>');
    exit(2);
  }
  final inDir = Directory(args[0]);
  final outDir = Directory(args[1])..createSync(recursive: true);

  final files = inDir.listSync().whereType<File>().where((f) => f.path.endsWith('.json')).toList()
    ..sort((a, b) => a.path.compareTo(b.path));

  var warningCount = 0;
  for (final f in files) {
    final sc = Scenario.fromJson(jsonDecode(f.readAsStringSync()) as Map<String, dynamic>);
    final result = renderScenario(sc);
    final out = File('${outDir.path}/${sc.id}.png')..writeAsBytesSync(result.png);
    stdout.writeln('rendered ${sc.id}  ->  ${out.path}  (${result.png.length} bytes)');
    for (final w in result.warnings) {
      warningCount++;
      stdout.writeln('  warning: $w');
    }
  }

  stdout.writeln('\n${files.length} scenario(s), $warningCount content warning(s)');
}
