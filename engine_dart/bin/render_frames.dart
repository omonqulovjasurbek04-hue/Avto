// Renders a scenario's correct-answer playback to a numbered PNG sequence, so a
// *deterministic* MP4 can be encoded from the engine (see tools/make_videos.js,
// which stitches these with ffmpeg). No engine logic lives here: it drives the
// same ScenePlayer.frameAt the app and browser use, so the video cannot diverge
// from the interactive playback. lib/ is untouched.
//
//   dart run bin/render_frames.dart <scenario.json> <out-dir> [fps] [size]
import 'dart:convert';
import 'dart:io';

import 'package:engine_dart/engine_dart.dart';
import 'package:engine_dart/raster.dart';

void main(List<String> args) {
  if (args.length < 2) {
    stderr.writeln('usage: dart run bin/render_frames.dart <scenario.json> <out-dir> [fps] [size]');
    exit(2);
  }
  final scFile = File(args[0]);
  final outDir = Directory(args[1])..createSync(recursive: true);
  final fps = args.length > 2 ? int.parse(args[2]) : 30;
  final size = args.length > 3 ? int.parse(args[3]) : 720;

  final sc = Scenario.fromJson(jsonDecode(scFile.readAsStringSync()) as Map<String, dynamic>);
  final player = ScenePlayer.of(sc); // the correct answer (resolution.order)
  final duration = player.duration;
  const double endHold = 1.2; // hold on the final frame so the outcome is readable
  final total = ((duration + endHold) * fps).ceil();
  final viewport = Viewport(scale: size / kCanvas);

  for (var i = 0; i < total; i++) {
    final t = i / fps;
    final canvas = RasterCanvas(size, size, ss: 2);
    final built = player.frameAt(t < duration ? t : duration);
    canvas.drawScene(viewport.apply(built.scene));
    final name = '${outDir.path}/frame_${i.toString().padLeft(5, '0')}.png';
    File(name).writeAsBytesSync(canvas.toPng());
  }

  stdout.writeln(
    '${sc.id}: $total frames @ ${fps}fps '
    '(${duration.toStringAsFixed(2)}s + ${endHold}s hold), ${size}px',
  );
}
