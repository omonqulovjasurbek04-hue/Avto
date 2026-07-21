import 'dart:convert';
import 'dart:io';

import 'package:engine_dart/engine_dart.dart';
import 'package:test/test.dart';

Scene _cross({int lanes = 1}) => Scene(
      type: SceneType.crossroads4way,
      roads: [
        for (final d in Dir.values.where((d) => d.isCardinal))
          Road(dir: d, lanesIn: lanes, lanesOut: lanes, priority: Priority.equal),
      ],
    );

Actor _actor(String id, Dir from, Dir to) => Actor(id: id, kind: ActorKind.car, from: from, to: to);

void main() {
  group('Choreography.solve', () {
    final layout = IntersectionLayout(_cross());

    test('the first actor in the order is released immediately', () {
      final actors = [_actor('a', Dir.e, Dir.w), _actor('ego', Dir.s, Dir.n)];
      final ch = Choreography.solve(layout, actors, ['a', 'ego']);
      expect(ch.profile('a').releaseTime, 0);
    });

    test('a conflicting follower waits for the leader to clear plus the safety gap', () {
      // Two straight-through paths crossing at the centre: they conflict.
      final actors = [_actor('a', Dir.e, Dir.w), _actor('ego', Dir.s, Dir.n)];
      final ch = Choreography.solve(layout, actors, ['a', 'ego']);

      final leaderClears = ch.profile('a').timeToReach(
            ch.trajectories['a']!.conflictExit + sizeOf(ActorKind.car).length / 2,
          );
      expect(ch.profile('ego').releaseTime, closeTo(leaderClears + kSafetyGap, 1e-6));
      expect(ch.profile('ego').releaseTime, greaterThan(0));
    });

    test('non-conflicting actors move in parallel', () {
      // Two tight right turns hugging opposite corners (N->W top-left,
      // S->E bottom-right): their conflict zones never touch.
      final actors = [_actor('a', Dir.n, Dir.w), _actor('b', Dir.s, Dir.e)];
      expect(manoeuvreFor(Dir.n, Dir.w), Manoeuvre.right);
      expect(manoeuvreFor(Dir.s, Dir.e), Manoeuvre.right);
      final ch = Choreography.solve(layout, actors, ['a', 'b']);
      expect(ch.profile('a').releaseTime, 0);
      expect(ch.profile('b').releaseTime, 0, reason: 'no shared conflict zone -> no wait');
    });

    test('reversing the order reverses who waits', () {
      final actors = [_actor('a', Dir.e, Dir.w), _actor('ego', Dir.s, Dir.n)];
      final first = Choreography.solve(layout, actors, ['a', 'ego']);
      final second = Choreography.solve(layout, actors, ['ego', 'a']);
      expect(first.profile('a').releaseTime, 0);
      expect(first.profile('ego').releaseTime, greaterThan(0));
      expect(second.profile('ego').releaseTime, 0);
      expect(second.profile('a').releaseTime, greaterThan(0));
    });

    test('an actor missing from the order is still placed, after the named ones', () {
      final actors = [_actor('a', Dir.e, Dir.w), _actor('ego', Dir.s, Dir.n)];
      final ch = Choreography.solve(layout, actors, ['a']); // ego omitted
      expect(ch.profiles.keys, containsAll(['a', 'ego']));
      expect(ch.profile('ego').releaseTime, greaterThan(0));
    });

    test('is deterministic', () {
      final actors = [_actor('a', Dir.e, Dir.w), _actor('ego', Dir.s, Dir.n)];
      final a = Choreography.solve(layout, actors, ['a', 'ego']);
      final b = Choreography.solve(layout, actors, ['a', 'ego']);
      for (final id in ['a', 'ego']) {
        expect(a.profile(id).releaseTime, b.profile(id).releaseTime);
      }
      expect(a.duration, b.duration);
    });
  });

  group('duration on the real content', () {
    final files = Directory('../content')
        .listSync()
        .whereType<File>()
        .where((f) => f.path.endsWith('.json'))
        .toList()
      ..sort((a, b) => a.path.compareTo(b.path));

    for (final f in files) {
      final sc = Scenario.fromJson(jsonDecode(f.readAsStringSync()) as Map<String, dynamic>);
      test('${sc.id} plays back within the 4-9s window', () {
        final layout = IntersectionLayout(sc.scene);
        final ch = Choreography.solve(layout, sc.actors, sc.resolution.order);
        expect(ch.duration, inInclusiveRange(4.0, 9.0),
            reason: 'playback was ${ch.duration.toStringAsFixed(2)}s');
      });
    }
  });
}
