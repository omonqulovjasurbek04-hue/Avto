import 'package:engine_dart/engine_dart.dart';
import 'package:test/test.dart';

void main() {
  group('MotionProfile', () {
    test('an actor waits at its rest position until released', () {
      const p = MotionProfile(restDistance: 200, releaseTime: 1.5);
      expect(p.distanceAt(0), 200);
      expect(p.distanceAt(1.5), 200);
      expect(p.distanceAt(1.4999), 200);
    });

    test('distance never goes backwards', () {
      const p = MotionProfile(restDistance: 100, releaseTime: 0);
      var last = -1.0;
      for (var t = 0.0; t <= 5; t += 0.05) {
        final d = p.distanceAt(t);
        expect(d, greaterThanOrEqualTo(last));
        last = d;
      }
    });

    test('starts from rest: the first step is far smaller than a cruising step', () {
      const p = MotionProfile(restDistance: 0, releaseTime: 0);
      final firstStep = p.distanceAt(0.1) - p.distanceAt(0.0);
      // Well after the ramp, motion is at cruise speed.
      final cruiseStep = p.distanceAt(3.1) - p.distanceAt(3.0);
      expect(firstStep, lessThan(cruiseStep * 0.5),
          reason: 'releasing from rest must ease in, not jump to full speed');
    });

    test('reaches cruising speed after the ramp', () {
      const p = MotionProfile(restDistance: 0, releaseTime: 0);
      final step = p.distanceAt(2.1) - p.distanceAt(2.0);
      expect(step, closeTo(kCruiseSpeed * 0.1, kCruiseSpeed * 0.1 * 0.02));
    });

    test('timeToReach inverts distanceAt', () {
      const p = MotionProfile(restDistance: 50, releaseTime: 0.7);
      for (final d in [60.0, 120.0, rampLength + 50, 400.0, 900.0]) {
        final t = p.timeToReach(d);
        expect(p.distanceAt(t), closeTo(d, 0.5), reason: 'round-trip at d=$d');
      }
    });

    test('timeToReach clamps at or before the rest distance to the release time', () {
      const p = MotionProfile(restDistance: 300, releaseTime: 2.0);
      expect(p.timeToReach(300), 2.0);
      expect(p.timeToReach(100), 2.0);
    });

    test('is deterministic across constructions', () {
      const a = MotionProfile(restDistance: 0, releaseTime: 0);
      const b = MotionProfile(restDistance: 0, releaseTime: 0);
      for (var t = 0.0; t <= 4; t += 0.017) {
        expect(a.distanceAt(t), b.distanceAt(t));
      }
    });
  });
}
