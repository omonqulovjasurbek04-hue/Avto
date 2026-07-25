import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:engine_dart/engine_dart.dart';
import 'package:engine_dart/raster.dart';
import 'package:test/test.dart';

/// Golden snapshots of the animation itself (Phase 2 DoD): a static golden at
/// t = 0 cannot catch a motion regression, so each scenario is captured at five
/// points along its playback.
///
/// To re-baseline after an intentional change to motion, delete the affected
/// files in test/goldens/motion and run the suite once.
const _goldenDir = 'test/goldens/motion';
const _diffDir = '../build/golden-diff';
const _size = 300;
const _channelTolerance = 4;
const _maxChangedFraction = 0.001;

/// Absolute sample times, all inside the shortest scene's ~4.4s playback so a
/// vehicle is on screen in every frame. Chosen over fractions of duration so
/// the JS/Dart cross-check (tools/verify_js.js) can use the very same numbers.
const _sampleTimes = [0.0, 0.5, 1.0, 2.0, 3.0];

Uint8List _renderFrame(ScenePlayer player, double t) {
  final canvas = RasterCanvas(_size, _size, ss: 2);
  canvas.drawScene(Viewport(scale: _size / kCanvas).apply(player.frameAt(t).scene));
  return canvas.toPng();
}

double _compare(String id, Uint8List actual, Uint8List golden) {
  expect(actual.length, golden.length, reason: 'image dimensions changed');
  var changed = 0;
  final diff = Uint8List(actual.length);
  for (var i = 0; i < actual.length; i += 4) {
    var worst = 0;
    for (var c = 0; c < 3; c++) {
      final d = (actual[i + c] - golden[i + c]).abs();
      if (d > worst) worst = d;
    }
    final isChanged = worst > _channelTolerance;
    if (isChanged) changed++;
    diff[i] = isChanged ? 255 : actual[i] ~/ 3 + 170;
    diff[i + 1] = isChanged ? 0 : actual[i + 1] ~/ 3 + 170;
    diff[i + 2] = isChanged ? 0 : actual[i + 2] ~/ 3 + 170;
    diff[i + 3] = 255;
  }
  if (changed > 0) {
    Directory(_diffDir).createSync(recursive: true);
    File('$_diffDir/$id.png').writeAsBytesSync(encodePng(diff, _size, _size));
  }
  return changed / (actual.length ~/ 4);
}

void main() {
  final files = Directory('../content')
      .listSync()
      .whereType<File>()
      .where((f) => f.path.endsWith('.json'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));
  final scenarios = [
    for (final f in files)
      Scenario.fromJson(jsonDecode(f.readAsStringSync()) as Map<String, dynamic>),
  ];

  group('motion goldens', () {
    for (final sc in scenarios) {
      final player = ScenePlayer.of(sc);
      for (final t in _sampleTimes) {
        final label = '${sc.id}@t${t.toStringAsFixed(1)}';
        test(label, () {
          final golden = File('$_goldenDir/$label.png');
          final actual = _renderFrame(player, t);
          if (!golden.existsSync()) {
            golden
              ..createSync(recursive: true)
              ..writeAsBytesSync(actual);
            markTestSkipped('golden created; rerun to compare');
            return;
          }
          final fraction = _compare(
            label,
            decodePng(actual).rgba,
            decodePng(golden.readAsBytesSync()).rgba,
          );
          expect(fraction, lessThanOrEqualTo(_maxChangedFraction),
              reason: '${(fraction * 100).toStringAsFixed(3)}% of pixels diverged from '
                  '${golden.path}. If intentional, delete the golden and rerun.');
        });
      }
    }
  });

  group('motion determinism', () {
    for (final sc in scenarios) {
      test('${sc.id} renders each frame byte-identically twice', () {
        final a = ScenePlayer.of(sc);
        final b = ScenePlayer.of(sc);
        for (final t in _sampleTimes) {
          expect(_renderFrame(a, t), _renderFrame(b, t));
        }
      });
    }
  });

  group('the scene actually moves', () {
    for (final sc in scenarios) {
      test('${sc.id}: the frame at t=0 differs from a mid-playback frame', () {
        final player = ScenePlayer.of(sc);
        final start = _renderFrame(player, 0.0);
        final mid = _renderFrame(player, 2.0);
        expect(start, isNot(equals(mid)), reason: 'nothing moved between t=0 and t=2');
      });
    }
  });
}
