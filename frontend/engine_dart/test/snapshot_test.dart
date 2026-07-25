import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:engine_dart/engine_dart.dart';
import 'package:engine_dart/raster.dart';
import 'package:test/test.dart';

/// Golden-file snapshot tests (Phase 1 DoD) plus the determinism guarantee.
///
/// Goldens are compared as decoded pixels, never as file bytes: a different
/// zlib build would change the compressed stream without changing the image,
/// and `cos`/`sin` can differ by an ULP between platforms, nudging an edge
/// pixel. Both are noise. A real layout bug moves thousands of pixels, so the
/// tolerance below separates the two cleanly.
///
/// To re-baseline after an intentional visual change, delete the affected file
/// in test/goldens and run the suite once.
const _goldenDir = 'test/goldens';
const _diffDir = '../build/golden-diff';
const _size = 300;

/// A pixel counts as changed when any channel moves more than this.
const _channelTolerance = 4;

/// ...and the test fails only when more than this fraction of pixels changed.
const _maxChangedFraction = 0.001; // 0.1%, i.e. 90 pixels at 300x300

Uint8List _render(Scenario sc) {
  final canvas = RasterCanvas(_size, _size, ss: 2);
  final built = SceneBuilder(sc).build();
  canvas.drawScene(Viewport(scale: _size / kCanvas).apply(built.scene));
  return canvas.toPng();
}

/// Returns the fraction of pixels differing by more than [_channelTolerance],
/// and writes a diff image when anything differs at all.
double _compare(String id, Uint8List actual, Uint8List golden) {
  expect(actual.length, golden.length, reason: 'image dimensions changed');

  var changed = 0;
  final pixels = actual.length ~/ 4;
  final diff = Uint8List(actual.length);

  for (var i = 0; i < actual.length; i += 4) {
    var worst = 0;
    for (var c = 0; c < 3; c++) {
      final d = (actual[i + c] - golden[i + c]).abs();
      if (d > worst) worst = d;
    }
    final isChanged = worst > _channelTolerance;
    if (isChanged) changed++;
    // Changed pixels glow red; unchanged ones fade to grey.
    diff[i] = isChanged ? 255 : actual[i] ~/ 3 + 170;
    diff[i + 1] = isChanged ? 0 : actual[i + 1] ~/ 3 + 170;
    diff[i + 2] = isChanged ? 0 : actual[i + 2] ~/ 3 + 170;
    diff[i + 3] = 255;
  }

  if (changed > 0) {
    Directory(_diffDir).createSync(recursive: true);
    File('$_diffDir/$id.png').writeAsBytesSync(encodePng(diff, _size, _size));
  }
  return changed / pixels;
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

  group('determinism', () {
    for (final sc in scenarios) {
      test('${sc.id} renders byte-identically twice', () {
        expect(_render(sc), _render(sc));
      });
    }

    test('display list order is stable', () {
      final a = SceneBuilder(scenarios.first).build().scene.ordered;
      final b = SceneBuilder(scenarios.first).build().scene.ordered;
      expect(a.length, b.length);
      for (var i = 0; i < a.length; i++) {
        expect(a[i].runtimeType, b[i].runtimeType);
        expect(a[i].layer, b[i].layer);
      }
    });
  });

  group('png round-trip', () {
    test('decodePng inverts encodePng', () {
      final decoded = decodePng(_render(scenarios.first));
      expect(decoded.width, _size);
      expect(decoded.height, _size);

      final canvas = RasterCanvas(_size, _size, ss: 2);
      canvas.drawScene(
        Viewport(scale: _size / kCanvas).apply(SceneBuilder(scenarios.first).build().scene),
      );
      expect(decoded.rgba, canvas.resolve());
    });
  });

  group('goldens', () {
    for (final sc in scenarios) {
      test(sc.id, () {
        final golden = File('$_goldenDir/${sc.id}.png');
        final actual = _render(sc);

        if (!golden.existsSync()) {
          golden
            ..createSync(recursive: true)
            ..writeAsBytesSync(actual);
          markTestSkipped('golden created; rerun to compare');
          return;
        }

        final fraction = _compare(
          sc.id,
          decodePng(actual).rgba,
          decodePng(golden.readAsBytesSync()).rgba,
        );

        expect(
          fraction,
          lessThanOrEqualTo(_maxChangedFraction),
          reason: '${(fraction * 100).toStringAsFixed(3)}% of pixels diverged from '
              '${golden.path}. See $_diffDir/${sc.id}.png. '
              'If the change is intentional, delete the golden and rerun.',
        );
      });
    }
  });

  group('content warnings', () {
    for (final sc in scenarios) {
      test('${sc.id} builds without content warnings', () {
        expect(SceneBuilder(sc).build().warnings, isEmpty);
      });
    }

    test('an unrenderable marking is reported, not swallowed', () {
      final sc = _withMarkings(scenarios.first, const [
        Marking(type: MarkingType.noStopping, at: Dir.n),
      ]);
      final warnings = SceneBuilder(sc).build().warnings;
      expect(warnings.map((w) => w.code), contains(WarningCode.markingNotRendered));
      expect(warnings.single.path, 'scene.markings[0]');
    });

    test('a marking with no target road is reported', () {
      final sc = _withMarkings(scenarios.first, const [
        Marking(type: MarkingType.stopLine),
      ]);
      expect(
        SceneBuilder(sc).build().warnings.map((w) => w.code),
        contains(WarningCode.markingMissingTarget),
      );
    });

    test('a sign without dedicated artwork is reported', () {
      final base = scenarios.first;
      final sc = Scenario(
        id: base.id,
        schemaVersion: base.schemaVersion,
        questionId: base.questionId,
        topic: base.topic,
        scene: Scene(
          type: base.scene.type,
          roads: base.scene.roads,
          signs: const [Sign(at: Dir.n, code: '3.24')],
        ),
        actors: base.actors,
        question: base.question,
        resolution: base.resolution,
      );
      expect(
        SceneBuilder(sc).build().warnings.map((w) => w.code),
        contains(WarningCode.signArtworkGeneric),
      );
    });
  });

  group('display list invariants', () {
    for (final sc in scenarios) {
      test('${sc.id}: every actor appears in the vehicles layer', () {
        final painted = SceneBuilder(sc)
            .build()
            .scene
            .ops
            .where((o) => o.layer == Layer.vehicles)
            .map((o) => o.actorId)
            .whereType<String>()
            .toSet();
        expect(painted, sc.actors.map((a) => a.id).toSet());
      });

      test('${sc.id}: layers come out back-to-front', () {
        final ordered = SceneBuilder(sc).build().scene.ordered;
        for (var i = 1; i < ordered.length; i++) {
          expect(ordered[i].layer.index, greaterThanOrEqualTo(ordered[i - 1].layer.index));
        }
      });
    }
  });
}

Scenario _withMarkings(Scenario base, List<Marking> markings) => Scenario(
      id: base.id,
      schemaVersion: base.schemaVersion,
      questionId: base.questionId,
      topic: base.topic,
      scene: Scene(
        type: base.scene.type,
        roads: base.scene.roads,
        markings: markings,
      ),
      actors: base.actors,
      question: base.question,
      resolution: base.resolution,
    );
