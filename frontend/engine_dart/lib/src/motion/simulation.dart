import '../generated/scenario.g.dart';
import '../geom.dart';
import '../layout.dart';
import 'choreography.dart';

/// Fixed simulation rate. 60 ticks a second, matching the spec: physics never
/// depends on the display frame rate, so the same scenario yields the same
/// collision tick on every machine.
const int kTicksPerSecond = 60;
const double kTickDt = 1 / kTicksPerSecond;

/// The moment two actors' footprints first overlap.
class CollisionEvent {
  final int tick;
  final String actorA;
  final String actorB;

  /// Point of overlap, in logical canvas coordinates, for the crash marker.
  final Vec2 point;

  const CollisionEvent(this.tick, this.actorA, this.actorB, this.point);

  double get time => tick * kTickDt;

  Map<String, dynamic> toJson() => {
        'tick': tick,
        'actorA': actorA,
        'actorB': actorB,
        'point': [point.x, point.y],
      };
}

/// The outcome of running a choreography forward: whether anyone crashed, and
/// how long the motion lasts (up to the crash, if there was one).
class SimResult {
  final CollisionEvent? collision;

  /// End of motion: the collision time if one occurred, else the choreography's
  /// full duration.
  final double endTime;

  const SimResult(this.collision, this.endTime);

  bool get collided => collision != null;
}

/// Runs a choreography at the fixed tick rate and reports the first collision.
///
/// This does not *place* anyone - all positions come from [Choreography.poseAt],
/// the same function playback uses. It only samples that motion at 60 Hz and
/// asks, each tick, whether any two footprints overlap (circle broad-phase, then
/// OBB narrow-phase). The first overlap freezes the run.
class Simulation {
  static SimResult run(Choreography ch, List<Actor> actors) {
    final ticks = (ch.duration * kTicksPerSecond).ceil();
    // Bounding radius per actor: half the box diagonal.
    final radius = {
      for (final a in actors) a.id: _boundingRadius(sizeOf(a.kind).length, sizeOf(a.kind).width),
    };

    for (var k = 0; k <= ticks; k++) {
      final t = k * kTickDt;
      // An actor that has reached its exit has driven off the canvas and is
      // gone. It must not sit parked at the edge - otherwise a follower that
      // shares its exit lane would "collide" with a car that has already left.
      final present = [
        for (final a in actors)
          if (!ch.hasExited(a.id, t)) ch.poseAt(a, t),
      ];

      for (var i = 0; i < present.length; i++) {
        for (var j = i + 1; j < present.length; j++) {
          final a = present[i];
          final b = present[j];

          // Broad phase: skip the OBB test unless the bounding circles touch.
          final gap = (a.position - b.position).length;
          if (gap > radius[a.actor.id]! + radius[b.actor.id]!) continue;

          if (obbOverlap(a.boxCorners, b.boxCorners)) {
            final mid = (a.position + b.position) * 0.5;
            return SimResult(CollisionEvent(k, a.actor.id, b.actor.id, mid), t);
          }
        }
      }
    }
    return SimResult(null, ch.duration);
  }
}

/// Half the diagonal of the footprint - the circle that just contains the box.
double _boundingRadius(double length, double width) => Vec2(length, width).length / 2;
