import 'dart:math' as math;

import 'package:engine_dart/engine_dart.dart';
import 'package:test/test.dart';

Scene _scene({int lanes = 1, List<Marking> markings = const []}) => Scene(
      type: SceneType.crossroads4way,
      roads: [
        for (final d in Dir.values.where((d) => d.isCardinal))
          Road(dir: d, lanesIn: lanes, lanesOut: lanes, priority: Priority.equal),
      ],
      markings: markings,
    );

Actor _actor(Dir from, Dir to, {int laneIn = 0, int laneOut = 0}) => Actor(
      id: 'a',
      kind: ActorKind.car,
      from: from,
      to: to,
      laneIn: laneIn,
      laneOut: laneOut,
    );

/// Angle between two unit vectors, in degrees.
double _angleBetween(Vec2 a, Vec2 b) {
  final d = a.normalized.dot(b.normalized).clamp(-1.0, 1.0);
  return math.acos(d) * 180 / math.pi;
}

void main() {
  group('manoeuvre classification', () {
    test('opposite roads are a straight-through', () {
      expect(manoeuvreFor(Dir.n, Dir.s), Manoeuvre.straight);
      expect(manoeuvreFor(Dir.e, Dir.w), Manoeuvre.straight);
    });

    test('same road is a U-turn', () {
      expect(manoeuvreFor(Dir.n, Dir.n), Manoeuvre.uTurn);
    });

    test('right-hand traffic: arriving from the north, west is a right turn', () {
      // Entering from the north means heading south; the driver's right is west.
      expect(manoeuvreFor(Dir.n, Dir.w), Manoeuvre.right);
      expect(manoeuvreFor(Dir.n, Dir.e), Manoeuvre.left);
    });

    test('turn handedness is consistent all the way round', () {
      // Rotating the approach one quarter-turn must rotate the outcome with it.
      const clockwise = [Dir.n, Dir.e, Dir.s, Dir.w];
      for (var i = 0; i < 4; i++) {
        final from = clockwise[i];
        expect(manoeuvreFor(from, clockwise[(i + 3) % 4]), Manoeuvre.right, reason: 'from $from');
        expect(manoeuvreFor(from, clockwise[(i + 1) % 4]), Manoeuvre.left, reason: 'from $from');
      }
    });
  });

  group('ArcLengthPath', () {
    test('a straight line measures its geometric length', () {
      final p = ArcLengthPath([const Line(Vec2(0, 0), Vec2(300, 400))]);
      expect(p.length, closeTo(500, 1e-9));
    });

    test('travel is uniform: equal distance steps cover equal ground', () {
      // A quarter-circle-ish bend, where Bezier `t` is most badly non-uniform.
      final p = ArcLengthPath([
        const Quadratic(Vec2(0, 0), Vec2(200, 0), Vec2(200, 200)),
      ]);
      const steps = 40;
      final gaps = <double>[
        for (var i = 0; i < steps; i++)
          (p.pointAt(p.length * (i + 1) / steps) - p.pointAt(p.length * i / steps)).length,
      ];
      final expected = p.length / steps;
      for (final g in gaps) {
        expect(g, closeTo(expected, expected * 0.01),
            reason: 'step lengths must not vary with curvature');
      }
    });

    test('unparameterised Bezier `t` really is non-uniform (the bug guarded above)', () {
      const c = Quadratic(Vec2(0, 0), Vec2(200, 0), Vec2(200, 200));
      final first = (c.at(0.05) - c.at(0.0)).length;
      final middle = (c.at(0.55) - c.at(0.5)).length;
      // Which way it skews depends on the control point; all that matters is
      // that raw `t` is not proportional to distance. If this ever came out
      // uniform, the arc-length step above would be passing for free.
      expect((first / middle - 1).abs(), greaterThan(0.2));
    });

    test('endpoints are exact and lookups clamp', () {
      final p =
          ArcLengthPath([const Cubic(Vec2(10, 10), Vec2(50, 0), Vec2(90, 80), Vec2(120, 40))]);
      expect(p.pointAt(-100), p.start);
      expect(p.pointAt(p.length + 100), p.end);
      expect(p.pointAt(0), const Vec2(10, 10));
    });

    test('segments join without a duplicate sample', () {
      final p = ArcLengthPath([
        const Line(Vec2(0, 0), Vec2(100, 0)),
        const Line(Vec2(100, 0), Vec2(100, 100)),
      ]);
      expect(p.length, closeTo(200, 1e-9));
      expect(p.pointAt(100), const Vec2(100, 0));
    });

    test('heading follows the direction of travel', () {
      final p = ArcLengthPath([const Line(Vec2(0, 0), Vec2(0, 100))]);
      expect(p.headingAt(50).x, closeTo(0, 1e-9));
      expect(p.headingAt(50).y, closeTo(1, 1e-9));
    });
  });

  group('trajectoryFor', () {
    final layout = IntersectionLayout(_scene());

    test('starts at the entry point and ends at the exit point', () {
      final t = trajectoryFor(layout, _actor(Dir.n, Dir.s));
      final from = layout.road(Dir.n);
      final to = layout.road(Dir.s);
      expect(t.path.start, from.entryPoint(0));
      expect(t.path.end, to.exitPoint(0));
    });

    test('a straight-through in matching lanes is a straight line', () {
      final t = trajectoryFor(layout, _actor(Dir.n, Dir.s));
      final direct = (t.path.end - t.path.start).length;
      expect(t.length, closeTo(direct, 1e-6));
    });

    test('a right turn is shorter than the left turn from the same approach', () {
      final right = trajectoryFor(layout, _actor(Dir.n, Dir.w));
      final left = trajectoryFor(layout, _actor(Dir.n, Dir.e));
      expect(right.manoeuvre, Manoeuvre.right);
      expect(left.manoeuvre, Manoeuvre.left);
      expect(right.length, lessThan(left.length),
          reason: 'the tight radius must actually be tighter');
    });

    test('the junction curve meets the approach and departure without a kink', () {
      for (final to in [Dir.n, Dir.e, Dir.s, Dir.w]) {
        final t = trajectoryFor(layout, _actor(Dir.n, to));
        final inHeading = layout.road(Dir.n).incomingHeading;
        final outHeading = layout.road(to).outgoingHeading;

        // Just inside the conflict zone the actor must still face the way it
        // arrived; just after leaving it must face down the exit road.
        expect(_angleBetween(t.path.headingAt(t.conflictEntry + 1), inHeading), lessThan(3),
            reason: 'entering the junction toward $to');
        expect(_angleBetween(t.path.headingAt(t.conflictExit - 1), outHeading), lessThan(3),
            reason: 'leaving the junction toward $to');
      }
    });

    test('heading turns smoothly - no sample jumps more than a few degrees', () {
      final t = trajectoryFor(layout, _actor(Dir.n, Dir.e));
      const steps = 400;
      for (var i = 1; i < steps; i++) {
        final a = t.path.headingAt(t.length * (i - 1) / steps);
        final b = t.path.headingAt(t.length * i / steps);
        expect(_angleBetween(a, b), lessThan(5),
            reason: 'a kink here would look like the car snapping round');
      }
    });

    test('a U-turn leaves on the opposite side of the same road', () {
      final t = trajectoryFor(layout, _actor(Dir.n, Dir.n));
      expect(t.manoeuvre, Manoeuvre.uTurn);
      expect(t.path.end, layout.road(Dir.n).exitPoint(0));
      // It must actually loop, not cut straight across between the two lanes.
      expect(t.length, greaterThan((t.path.end - t.path.start).length * 1.5));
    });

    test('a lane change while going straight curves instead of jumping', () {
      final wide = IntersectionLayout(_scene(lanes: 2));
      final t = trajectoryFor(wide, _actor(Dir.n, Dir.s, laneIn: 1, laneOut: 1));
      const steps = 200;
      for (var i = 1; i < steps; i++) {
        final a = t.path.headingAt(t.length * (i - 1) / steps);
        final b = t.path.headingAt(t.length * i / steps);
        expect(_angleBetween(a, b), lessThan(5));
      }
    });

    test('the actor stops before it enters the conflict zone', () {
      final t = trajectoryFor(layout, _actor(Dir.n, Dir.s));
      expect(t.stopDistance, lessThan(t.conflictEntry));
      expect(t.stopDistance, greaterThan(0));
    });

    test('a crosswalk pushes the stop point further back', () {
      final plain = trajectoryFor(layout, _actor(Dir.n, Dir.s));
      final withWalk = IntersectionLayout(
        _scene(markings: [const Marking(type: MarkingType.crosswalk, at: Dir.n)]),
      );
      final stopped = trajectoryFor(withWalk, _actor(Dir.n, Dir.s));
      expect(stopped.stopDistance, lessThan(plain.stopDistance),
          reason: 'stopping earlier means a smaller distance travelled');
    });

    test('conflict span covers the junction and nothing else', () {
      final t = trajectoryFor(layout, _actor(Dir.n, Dir.e));
      expect(t.conflictEntry, greaterThan(0));
      expect(t.conflictExit, greaterThan(t.conflictEntry));
      expect(t.conflictExit, lessThan(t.length));
    });
  });

  group('determinism', () {
    test('rebuilding a trajectory gives bit-identical samples', () {
      final layout = IntersectionLayout(_scene());
      final a = trajectoryFor(layout, _actor(Dir.w, Dir.n));
      final b = trajectoryFor(layout, _actor(Dir.w, Dir.n));
      expect(a.length, b.length);
      for (var i = 0; i <= 500; i++) {
        final d = a.length * i / 500;
        expect(a.path.pointAt(d), b.path.pointAt(d));
        expect(a.path.headingAt(d), b.path.headingAt(d));
      }
    });
  });
}
