import 'dart:convert';
import 'dart:io';

import 'package:engine_dart/engine_dart.dart';
import 'package:test/test.dart';

Scene _cross() => Scene(
      type: SceneType.crossroads4way,
      roads: [
        for (final d in Dir.values.where((d) => d.isCardinal))
          Road(dir: d, lanesIn: 1, lanesOut: 1, priority: Priority.equal),
      ],
    );

Actor _actor(String id, Dir from, Dir to) => Actor(id: id, kind: ActorKind.car, from: from, to: to);

Scenario _firstScenario() {
  final f = (Directory('../content').listSync().whereType<File>().toList()
        ..sort((a, b) => a.path.compareTo(b.path)))
      .firstWhere((f) => f.path.endsWith('.json'));
  return Scenario.fromJson(jsonDecode(f.readAsStringSync()) as Map<String, dynamic>);
}

void main() {
  final layout = IntersectionLayout(_cross());

  group('Playback', () {
    test('at t=0 the poses match the static preview staging', () {
      final sc = _firstScenario();
      final pb = Playback.of(sc);
      final staged = stagedPoses(IntersectionLayout(sc.scene), sc.actors);

      final frame = pb.posesAt(0);
      expect(frame.length, staged.length);
      for (var i = 0; i < frame.length; i++) {
        expect((frame[i].position - staged[i].position).length, lessThan(1e-6),
            reason: 'motion at t=0 must equal the frozen preview');
        expect((frame[i].heading - staged[i].heading).length, lessThan(1e-6));
      }
    });

    test('posesAt is a pure function of time', () {
      final pb = Playback.of(_firstScenario());
      for (final t in [0.0, 0.37, 1.0, 2.5]) {
        final a = pb.posesAt(t);
        final b = pb.posesAt(t);
        expect(a.length, b.length);
        for (var i = 0; i < a.length; i++) {
          expect(a[i].position, b[i].position);
          expect(a[i].heading, b[i].heading);
        }
      }
    });

    test('a released actor moves forward over time', () {
      final sc = _firstScenario();
      final pb = Playback.of(sc);
      // The first actor in the resolution order is released at t=0.
      final leader = sc.resolution.order.first;
      expect(pb.choreography.profile(leader).releaseTime, 0);
      Vec2 posOf(double t) => pb.posesAt(t).firstWhere((p) => p.actor.id == leader).position;
      expect((posOf(1.0) - posOf(0.0)).length, greaterThan(50));
    });

    test('everyone has left the canvas by the end', () {
      final pb = Playback.of(_firstScenario());
      expect(pb.posesAt(pb.duration), isEmpty,
          reason: 'at the end of a clean playback all actors have exited');
    });

    group('on a colliding order', () {
      // Two straight-through paths, both asserting at t=0 -> they crash.
      final crossing = [_actor('a', Dir.e, Dir.w), _actor('b', Dir.s, Dir.n)];
      final ch = Choreography.fromReleaseTimes(layout, crossing, {'a': 0, 'b': 0});
      final pb = Playback.fromChoreography(ch, crossing);

      test('reports the collision and ends at it', () {
        expect(pb.collided, isTrue);
        expect(pb.duration, closeTo(pb.collision!.time, 1e-9));
      });

      test('freezes: poses past the crash equal the poses at the crash', () {
        final atCrash = pb.posesAt(pb.collision!.time);
        for (final t in [pb.collision!.time + 0.5, pb.collision!.time + 5]) {
          final later = pb.posesAt(t);
          expect(later.length, atCrash.length);
          for (var i = 0; i < later.length; i++) {
            expect(later[i].position, atCrash[i].position);
          }
        }
      });
    });
  });
}
