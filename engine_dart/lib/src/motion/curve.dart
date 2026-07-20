import '../geom.dart';

/// A parametric curve in logical canvas space, evaluated over `t` in [0, 1].
///
/// `t` is *not* distance: a Bezier's `t` bunches up where the curve bends. Use
/// [ArcLengthPath] to travel along one at a uniform speed.
sealed class Curve {
  const Curve();

  Vec2 at(double t);

  /// Number of samples [ArcLengthPath] takes when measuring this curve. Fixed
  /// per curve type rather than adaptive, so the tables - and therefore every
  /// frame derived from them - are identical on every run and platform.
  int get sampleCount;
}

class Line extends Curve {
  final Vec2 a;
  final Vec2 b;

  const Line(this.a, this.b);

  @override
  Vec2 at(double t) => a + (b - a) * t;

  /// A straight line is exact at its endpoints; no subdivision buys anything.
  @override
  int get sampleCount => 1;
}

class Quadratic extends Curve {
  final Vec2 a;
  final Vec2 control;
  final Vec2 b;

  const Quadratic(this.a, this.control, this.b);

  @override
  Vec2 at(double t) {
    final u = 1 - t;
    return a * (u * u) + control * (2 * u * t) + b * (t * t);
  }

  @override
  int get sampleCount => kCurveSamples;
}

class Cubic extends Curve {
  final Vec2 a;
  final Vec2 c1;
  final Vec2 c2;
  final Vec2 b;

  const Cubic(this.a, this.c1, this.c2, this.b);

  @override
  Vec2 at(double t) {
    final u = 1 - t;
    return a * (u * u * u) + c1 * (3 * u * u * t) + c2 * (3 * u * t * t) + b * (t * t * t);
  }

  @override
  int get sampleCount => kCurveSamples;
}

/// Subdivisions used to measure a curved segment. High enough that the
/// polyline error is far below a pixel at canvas scale.
const int kCurveSamples = 96;

/// A chain of curves travelled end to end, re-parameterised by arc length.
///
/// The point of this class: an actor moving at a constant speed must cover
/// equal distance per tick regardless of whether it is on a straight, a tight
/// right turn or a wide left one. Sampling Bezier `t` uniformly would make
/// vehicles visibly speed up through the bend.
///
/// Construction samples every segment into a cumulative-distance table; lookups
/// binary-search it and interpolate. Everything is derived from the curve list,
/// so two runs with the same input produce the same table bit for bit.
class ArcLengthPath {
  /// Sampled points, in travel order.
  final List<Vec2> _points;

  /// `_cumulative[i]` is the distance from the start to `_points[i]`.
  final List<double> _cumulative;

  ArcLengthPath._(this._points, this._cumulative);

  factory ArcLengthPath(List<Curve> segments) {
    if (segments.isEmpty) {
      throw ArgumentError('an ArcLengthPath needs at least one segment');
    }
    final points = <Vec2>[];
    for (final seg in segments) {
      final n = seg.sampleCount;
      // Skip each segment's first sample: it duplicates the previous
      // segment's last point, and a zero-length step would leave the heading
      // at that index undefined.
      for (var i = points.isEmpty ? 0 : 1; i <= n; i++) {
        points.add(seg.at(i / n));
      }
    }

    final cumulative = <double>[0];
    for (var i = 1; i < points.length; i++) {
      cumulative.add(cumulative[i - 1] + (points[i] - points[i - 1]).length);
    }
    return ArcLengthPath._(points, cumulative);
  }

  /// Total distance from start to end, in logical units.
  double get length => _cumulative.last;

  Vec2 get start => _points.first;
  Vec2 get end => _points.last;

  /// Index of the last sample at or before [distance].
  int _segmentFor(double distance) {
    var lo = 0;
    var hi = _cumulative.length - 1;
    while (lo < hi) {
      final mid = (lo + hi + 1) >> 1;
      if (_cumulative[mid] <= distance) {
        lo = mid;
      } else {
        hi = mid - 1;
      }
    }
    return lo;
  }

  /// Position [distance] units along the path. Clamped at both ends, so an
  /// actor that has finished sits at the exit point rather than extrapolating
  /// off the canvas.
  Vec2 pointAt(double distance) {
    if (distance <= 0) return start;
    if (distance >= length) return end;

    final i = _segmentFor(distance);
    final span = _cumulative[i + 1] - _cumulative[i];
    if (span == 0) return _points[i];
    final f = (distance - _cumulative[i]) / span;
    return _points[i] + (_points[i + 1] - _points[i]) * f;
  }

  /// Unit direction of travel at [distance].
  ///
  /// Taken from the sample either side rather than from the curve's derivative:
  /// the vehicle is drawn along the polyline the path actually samples, so the
  /// heading has to match that polyline, not the ideal curve.
  Vec2 headingAt(double distance) {
    final i = _segmentFor(distance.clamp(0, length));
    final j = i < _points.length - 1 ? i + 1 : i;
    final k = j == i ? i - 1 : i;
    return (_points[j] - _points[k]).normalized;
  }
}
