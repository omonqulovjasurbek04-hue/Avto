import 'dart:convert';
import 'dart:io';

import 'package:engine_dart/engine_dart.dart';
import 'package:engine_dart/raster.dart';
import 'package:test/test.dart';

/// Golden-file snapshot tests (Phase 1 DoD) plus the determinism guarantee.
///
/// Goldens live in test/goldens. Regenerate deliberately with:
///   dart test --run-skipped -N "regenerate goldens"
/// or delete the folder and run the suite once.
const _goldenDir = 'test/goldens';
const _size = 300; // small keeps goldens light; layout bugs still show

List<int> _render(Scenario sc) {
  final canvas = RasterCanvas(_size, _size, ss: 2);
  final scale = _size / kCanvas;
  final scene = SceneBuilder(sc).build();
  final scaled = RenderScene([
    for (final op in scene.ordered)
      switch (op) {
        FillPolygon o => FillPolygon(
            o.layer, [for (final p in o.points) p * scale], o.colour,
            actorId: o.actorId),
        StrokePath o => StrokePath(
            o.layer, [for (final p in o.points) p * scale], o.colour,
            width: o.width * scale,
            closed: o.closed,
            dash: o.dash == null ? null : [for (final d in o.dash!) d * scale],
            actorId: o.actorId),
        FillCircle o =>
          FillCircle(o.layer, o.centre * scale, o.radius * scale, o.colour, actorId: o.actorId),
        SignGlyph o => SignGlyph(o.centre * scale, o.code, o.size * scale),
        LightGlyph o => LightGlyph(o.centre * scale, o.state, o.size * scale),
      }
  ]);
  canvas.drawScene(scaled);
  return canvas.toPng();
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
        final a = _render(sc);
        final b = _render(sc);
        expect(a, b);
      });
    }

    test('display list order is stable', () {
      final a = SceneBuilder(scenarios.first).build().ordered;
      final b = SceneBuilder(scenarios.first).build().ordered;
      expect(a.length, b.length);
      for (var i = 0; i < a.length; i++) {
        expect(a[i].runtimeType, b[i].runtimeType);
        expect(a[i].layer, b[i].layer);
      }
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
        expect(actual, golden.readAsBytesSync(),
            reason: 'rendered output diverged from ${golden.path}; '
                'delete the golden and rerun if the change is intentional');
      });
    }
  });

  group('display list invariants', () {
    for (final sc in scenarios) {
      test('${sc.id}: every actor appears in the vehicles layer', () {
        final ops = SceneBuilder(sc).build().ops;
        final painted = ops
            .where((o) => o.layer == Layer.vehicles)
            .map((o) => o.actorId)
            .whereType<String>()
            .toSet();
        expect(painted, sc.actors.map((a) => a.id).toSet());
      });

      test('${sc.id}: layers come out back-to-front', () {
        final ordered = SceneBuilder(sc).build().ordered;
        for (var i = 1; i < ordered.length; i++) {
          expect(ordered[i].layer.index, greaterThanOrEqualTo(ordered[i - 1].layer.index));
        }
      });
    }
  });
}
