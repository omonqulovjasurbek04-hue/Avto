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

void main() {
  final layout = IntersectionLayout(_cross());

  // Two straight-through paths that cross at the centre.
  final crossing = [_actor('a', Dir.e, Dir.w), _actor('b', Dir.s, Dir.n)];

  group('Simulation.run', () {
    test('the correct, gapped order never collides', () {
      final ch = Choreography.solve(layout, crossing, ['a', 'b']);
      expect(Simulation.run(ch, crossing).collided, isFalse);
    });

    test('two actors released together on crossing paths collide', () {
      // Bypass the yielding rule: both assert at t=0.
      final ch = Choreography.fromReleaseTimes(layout, crossing, {'a': 0, 'b': 0});
      final result = Simulation.run(ch, crossing);
      expect(result.collided, isTrue);
      expect({result.collision!.actorA, result.collision!.actorB}, {'a', 'b'});
    });

    test('the collision is reported near the centre, where the paths cross', () {
      final ch = Choreography.fromReleaseTimes(layout, crossing, {'a': 0, 'b': 0});
      final point = Simulation.run(ch, crossing).collision!.point;
      expect((point - kCentre).length, lessThan(120),
          reason: 'straight-through paths cross at the intersection centre');
    });

    test('endTime freezes at the collision, before full duration', () {
      final ch = Choreography.fromReleaseTimes(layout, crossing, {'a': 0, 'b': 0});
      final result = Simulation.run(ch, crossing);
      expect(result.endTime, lessThan(ch.duration));
      expect(result.endTime, closeTo(result.collision!.time, 1e-9));
    });

    test('actors on non-crossing paths never collide even released together', () {
      // Opposite-corner right turns.
      final apart = [_actor('a', Dir.n, Dir.w), _actor('b', Dir.s, Dir.e)];
      final ch = Choreography.fromReleaseTimes(layout, apart, {'a': 0, 'b': 0});
      expect(Simulation.run(ch, apart).collided, isFalse);
    });

    test('an actor that has exited does not collide with a follower in its lane', () {
      // Both leave via the south lane; the leader exits well before the
      // follower arrives, so the follower must not hit a parked ghost.
      final sameExit = [_actor('lead', Dir.n, Dir.s), _actor('follow', Dir.w, Dir.s)];
      final ch = Choreography.solve(layout, sameExit, ['lead', 'follow']);
      expect(Simulation.run(ch, sameExit).collided, isFalse);
    });

    test('is deterministic: same choreography, same collision tick', () {
      final ch = Choreography.fromReleaseTimes(layout, crossing, {'a': 0, 'b': 0});
      final first = Simulation.run(ch, crossing).collision!;
      final second = Simulation.run(ch, crossing).collision!;
      expect(first.tick, second.tick);
      expect(first.point, second.point);
    });
  });

  group('the real content never collides on its correct order', () {
    final files = Directory('../content')
        .listSync()
        .whereType<File>()
        .where((f) => f.path.endsWith('.json'))
        .toList()
      ..sort((a, b) => a.path.compareTo(b.path));

    for (final f in files) {
      final sc = Scenario.fromJson(jsonDecode(f.readAsStringSync()) as Map<String, dynamic>);
      test('${sc.id}', () {
        final l = IntersectionLayout(sc.scene);
        final ch = Choreography.solve(l, sc.actors, sc.resolution.order);
        final result = Simulation.run(ch, sc.actors);
        expect(result.collided, isFalse,
            reason: result.collided
                ? 'collision between ${result.collision!.actorA} and '
                    '${result.collision!.actorB} at tick ${result.collision!.tick}'
                : '');
      });
    }
  });
}
