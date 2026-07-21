/// Cruising speed of a released actor, in logical units per second.
///
/// A full trajectory is roughly a canvas-width long (~1000 units). At this
/// speed the simplest two-actor sequence lands mid-window (~4.5-5.5s) while a
/// busier three-to-four-actor scene still stays under the 9s ceiling the spec
/// wants (see [Choreography]). Tunable, but changing it re-baselines the motion
/// goldens.
const double kCruiseSpeed = 290;

/// Time an actor takes to reach [kCruiseSpeed] from rest. The acceleration is
/// eased (see [MotionProfile.distanceAt]) so there is no visible jerk at the
/// moment of release.
const double kRampTime = 0.9;

/// Gap the spec requires between one actor clearing the conflict zone and the
/// next being released (`SAFETY_GAP`).
const double kSafetyGap = 0.4;

/// Smootherstep: 6t^5 - 15t^4 + 10t^3. Zero first *and* second derivative at
/// both ends, so a velocity ramp built on it has no acceleration step - which
/// is what "jerk-limited" buys us visually.
double _smootherstep(double t) {
  if (t <= 0) return 0;
  if (t >= 1) return 1;
  return t * t * t * (t * (t * 6 - 15) + 10);
}

/// Distance covered over the eased ramp from rest to [kCruiseSpeed], evaluated
/// in closed form so playback stays a pure function of time.
///
/// Speed follows `kCruiseSpeed * smootherstep(u)` with `u = elapsed / kRampTime`.
/// The integral of that over the ramp has no elementary antiderivative worth
/// carrying, so distance is accumulated once with a fixed number of Simpson
/// panels. Fixed count -> identical result on every run and platform.
class _Ramp {
  static const int _panels = 64;

  /// `_dist[i]` is the distance covered by fraction `i / _panels` of the ramp.
  final List<double> _dist;

  /// Total distance covered during the whole ramp.
  final double length;

  _Ramp._(this._dist, this.length);

  factory _Ramp() {
    final speedAt = (double u) => kCruiseSpeed * _smootherstep(u);
    final dist = <double>[0];
    final h = 1.0 / _panels;
    var acc = 0.0;
    for (var i = 1; i <= _panels; i++) {
      final u0 = (i - 1) * h;
      final u1 = i * h;
      // Simpson's rule on one panel, times kRampTime to turn du into dt.
      acc += (u1 - u0) / 6 * (speedAt(u0) + 4 * speedAt((u0 + u1) / 2) + speedAt(u1)) * kRampTime;
      dist.add(acc);
    }
    return _Ramp._(dist, acc);
  }

  double distanceAt(double elapsed) {
    if (elapsed <= 0) return 0;
    if (elapsed >= kRampTime) return length + (elapsed - kRampTime) * kCruiseSpeed;
    final f = elapsed / kRampTime * _panels;
    final i = f.floor();
    return _dist[i] + (_dist[i + 1] - _dist[i]) * (f - i);
  }
}

final _Ramp _ramp = _Ramp();

/// How far along its trajectory one actor is at any moment.
///
/// Two parameters set it apart from every other actor: [restDistance] (where it
/// waits before being released) and [releaseTime] (when it starts moving). The
/// speed curve itself is shared, which is why choreography only has to solve for
/// release times.
class MotionProfile {
  /// Distance along the trajectory the actor sits at before release, i.e. its
  /// resting position just behind the stop line.
  final double restDistance;

  /// Time at which the actor is released from [restDistance].
  final double releaseTime;

  const MotionProfile({required this.restDistance, required this.releaseTime});

  /// Distance travelled along the trajectory at absolute time [t]. Never less
  /// than [restDistance]: before release the actor waits.
  double distanceAt(double t) {
    final elapsed = t - releaseTime;
    if (elapsed <= 0) return restDistance;
    return restDistance + _ramp.distanceAt(elapsed);
  }

  /// Absolute time at which the actor has travelled [distance] along the path.
  /// The inverse of [distanceAt], used to work out when an actor clears a point
  /// (e.g. the far edge of the conflict zone).
  double timeToReach(double distance) {
    final d = distance - restDistance;
    if (d <= 0) return releaseTime;
    if (d <= _ramp.length) {
      // Invert the ramp by scanning its precomputed table, then interpolate.
      for (var i = 1; i < _ramp._dist.length; i++) {
        if (_ramp._dist[i] >= d) {
          final f = (d - _ramp._dist[i - 1]) / (_ramp._dist[i] - _ramp._dist[i - 1]);
          return releaseTime + (i - 1 + f) / _Ramp._panels * kRampTime;
        }
      }
    }
    return releaseTime + kRampTime + (d - _ramp.length) / kCruiseSpeed;
  }
}

/// Distance the eased ramp covers before reaching cruising speed. Exposed for
/// tests and for choreography's timing estimates.
double get rampLength => _ramp.length;
