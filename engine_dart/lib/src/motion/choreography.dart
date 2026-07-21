import '../generated/scenario.g.dart';
import '../geom.dart';
import '../layout.dart';
import 'motion_profile.dart';
import 'trajectory.dart';

/// How many points to sample each trajectory's conflict-zone portion into when
/// testing whether two paths cross. Enough that a real crossing is never missed
/// at canvas scale; fixed so the test is deterministic.
const int _conflictSamples = 24;

/// The solved timing for a whole scene: when each actor is released, and how
/// long the resulting playback lasts.
class Choreography {
  /// Motion profile per actor id, in the order they were given.
  final Map<String, MotionProfile> profiles;

  /// Trajectory per actor id (kept so simulation and playback share one copy).
  final Map<String, Trajectory> trajectories;

  /// Time, in seconds, at which the last actor has fully left the canvas.
  final double duration;

  const Choreography(this.profiles, this.trajectories, this.duration);

  MotionProfile profile(String actorId) {
    final p = profiles[actorId];
    if (p == null) throw StateError('no motion profile for actor "$actorId"');
    return p;
  }

  /// Solves release times for [order] - the sequence in which actors clear the
  /// conflict zone (`resolution.order`, or a candidate order for outcome
  /// classification).
  ///
  /// Rule (spec 5.4): the first actor is released at t=0; every later actor is
  /// released once all *earlier* actors it shares the conflict zone with have
  /// cleared it, plus [kSafetyGap]. An actor that conflicts with no earlier one
  /// moves in parallel, released at t=0.
  factory Choreography.solve(
    IntersectionLayout layout,
    List<Actor> actors,
    List<String> order,
  ) {
    final byId = {for (final a in actors) a.id: a};
    final trajectories = {
      for (final a in actors) a.id: trajectoryFor(layout, a),
    };
    final restDistances = {
      for (final a in actors) a.id: _restDistance(trajectories[a.id]!, a),
    };

    // Anyone not named in `order` still has to be placed; treat them as if they
    // were appended, so a malformed order degrades to "everyone waits their
    // turn" rather than throwing.
    final sequence = [
      ...order.where(byId.containsKey),
      ...actors.map((a) => a.id).where((id) => !order.contains(id)),
    ];

    final releaseTimes = <String, double>{};
    for (var i = 0; i < sequence.length; i++) {
      final id = sequence[i];
      var release = 0.0;
      for (var j = 0; j < i; j++) {
        final earlier = sequence[j];
        if (!_conflict(trajectories[id]!, trajectories[earlier]!)) continue;
        final clearAt = _clearTime(
          trajectories[earlier]!,
          MotionProfile(restDistance: restDistances[earlier]!, releaseTime: releaseTimes[earlier]!),
          byId[earlier]!,
        );
        if (clearAt + kSafetyGap > release) release = clearAt + kSafetyGap;
      }
      releaseTimes[id] = release;
    }

    final profiles = {
      for (final a in actors)
        a.id: MotionProfile(restDistance: restDistances[a.id]!, releaseTime: releaseTimes[a.id]!),
    };

    // Playback ends when the last actor has driven its tail off the canvas.
    var duration = 0.0;
    for (final a in actors) {
      final end = profiles[a.id]!.timeToReach(
        trajectories[a.id]!.length + sizeOf(a.kind).length / 2,
      );
      if (end > duration) duration = end;
    }

    return Choreography(profiles, trajectories, duration);
  }

  /// Absolute time at which every actor has come to rest again (none moving).
  /// Same as [duration]; named for the reader at the call site.
  double get endTime => duration;
}

/// Distance along the path at which an actor rests before release: its centre
/// sits half a body-length plus the resting gap behind the stop line. Because
/// the approach is straight, this path distance is exact.
double _restDistance(Trajectory t, Actor a) {
  final rest = t.stopDistance - kRestGap - sizeOf(a.kind).length / 2;
  return rest < 0 ? 0 : rest;
}

/// Time at which [actor]'s tail has passed the far edge of the conflict zone -
/// i.e. it has fully cleared the junction and the next actor may follow.
double _clearTime(Trajectory t, MotionProfile p, Actor actor) =>
    p.timeToReach(t.conflictExit + sizeOf(actor.kind).length / 2);

/// Whether two trajectories share space inside the intersection box. Only the
/// conflict-zone portion of each path matters; the straight approaches and
/// departures run down separate lanes and never touch.
bool _conflict(Trajectory a, Trajectory b) {
  final pa = _conflictPolyline(a);
  final pb = _conflictPolyline(b);
  for (var i = 0; i < pa.length - 1; i++) {
    for (var j = 0; j < pb.length - 1; j++) {
      if (segmentsIntersect(pa[i], pa[i + 1], pb[j], pb[j + 1])) return true;
    }
  }
  return false;
}

List<Vec2> _conflictPolyline(Trajectory t) => [
      for (var i = 0; i <= _conflictSamples; i++)
        t.path.pointAt(
          t.conflictEntry + (t.conflictExit - t.conflictEntry) * i / _conflictSamples,
        ),
    ];
