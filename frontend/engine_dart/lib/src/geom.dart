import 'dart:math' as math;

import 'generated/scenario.g.dart';

/// Logical canvas. Never bake device pixels into the model.
const double kCanvas = 1000;
const Vec2 kCentre = Vec2(kCanvas / 2, kCanvas / 2);

const double kLaneWidth = 60;
const double kVehicleLength = 90;
const double kVehicleWidth = 44;
const double kTramLength = 150;

/// Gap between the stop line and whatever lies immediately ahead of it.
const double kStopSetback = 10;

/// Clearance between the intersection box and the near edge of a crosswalk.
const double kCrosswalkGap = 8;

/// Depth of a crosswalk band, measured along the road.
const double kCrosswalkDepth = 60;

/// Screen convention: Y grows downward, so N is -Y and S is +Y.
class Vec2 {
  final double x;
  final double y;

  const Vec2(this.x, this.y);

  Vec2 operator +(Vec2 o) => Vec2(x + o.x, y + o.y);
  Vec2 operator -(Vec2 o) => Vec2(x - o.x, y - o.y);
  Vec2 operator *(double s) => Vec2(x * s, y * s);
  Vec2 operator -() => Vec2(-x, -y);

  double get length => math.sqrt(x * x + y * y);
  double dot(Vec2 o) => x * o.x + y * o.y;

  /// The right-hand side relative to this heading, in screen coords.
  Vec2 get perpRight => Vec2(-y, x);

  Vec2 get normalized {
    final l = length;
    return l == 0 ? const Vec2(0, 0) : Vec2(x / l, y / l);
  }

  double get heading => math.atan2(y, x);

  @override
  String toString() => '(${x.toStringAsFixed(2)}, ${y.toStringAsFixed(2)})';

  @override
  bool operator ==(Object other) => other is Vec2 && other.x == x && other.y == y;

  @override
  int get hashCode => Object.hash(x, y);
}

class Rect {
  final double left, top, right, bottom;

  const Rect(this.left, this.top, this.right, this.bottom);

  Rect.centred(Vec2 c, double halfX, double halfY)
      : left = c.x - halfX,
        top = c.y - halfY,
        right = c.x + halfX,
        bottom = c.y + halfY;

  double get width => right - left;
  double get height => bottom - top;

  List<Vec2> get corners => [
        Vec2(left, top),
        Vec2(right, top),
        Vec2(right, bottom),
        Vec2(left, bottom),
      ];
}

const double _s = math.sqrt1_2;

extension DirGeometry on Dir {
  /// Unit vector pointing from the intersection centre outward along this road.
  Vec2 get vector => switch (this) {
        Dir.n => const Vec2(0, -1),
        Dir.s => const Vec2(0, 1),
        Dir.e => const Vec2(1, 0),
        Dir.w => const Vec2(-1, 0),
        Dir.ne => const Vec2(_s, -_s),
        Dir.nw => const Vec2(-_s, -_s),
        Dir.se => const Vec2(_s, _s),
        Dir.sw => const Vec2(-_s, _s),
      };

  Dir get opposite => switch (this) {
        Dir.n => Dir.s,
        Dir.s => Dir.n,
        Dir.e => Dir.w,
        Dir.w => Dir.e,
        Dir.ne => Dir.sw,
        Dir.sw => Dir.ne,
        Dir.nw => Dir.se,
        Dir.se => Dir.nw,
      };

  bool get isCardinal => this == Dir.n || this == Dir.s || this == Dir.e || this == Dir.w;

  /// True when the road runs top-to-bottom on screen, so its width spans X.
  bool get isVertical => this == Dir.n || this == Dir.s;
}

/// Distance from the centre to the canvas edge along [dir].
double edgeDistance(Dir dir) {
  final v = dir.vector;
  var t = double.infinity;
  if (v.x != 0) {
    t = math.min(t, (v.x > 0 ? kCanvas - kCentre.x : kCentre.x) / v.x.abs());
  }
  if (v.y != 0) {
    t = math.min(t, (v.y > 0 ? kCanvas - kCentre.y : kCentre.y) / v.y.abs());
  }
  return t;
}

/// Corners of an oriented box of [length] x [width] centred at [centre],
/// with its long axis along [heading]. Returned clockwise in screen coords.
List<Vec2> orientedBox(Vec2 centre, Vec2 heading, double length, double width) {
  final f = heading.normalized * (length / 2);
  final r = heading.normalized.perpRight * (width / 2);
  return [centre - f - r, centre + f - r, centre + f + r, centre - f + r];
}

double _cross(Vec2 a, Vec2 b) => a.x * b.y - a.y * b.x;

/// Sign of the area of triangle (a, b, c): +1 left turn, -1 right turn, 0
/// collinear. The orientation primitive both segment tests are built on.
int _orientation(Vec2 a, Vec2 b, Vec2 c) {
  final v = _cross(b - a, c - a);
  if (v > 1e-9) return 1;
  if (v < -1e-9) return -1;
  return 0;
}

bool _onSegment(Vec2 a, Vec2 b, Vec2 p) =>
    p.x >= math.min(a.x, b.x) - 1e-9 &&
    p.x <= math.max(a.x, b.x) + 1e-9 &&
    p.y >= math.min(a.y, b.y) - 1e-9 &&
    p.y <= math.max(a.y, b.y) + 1e-9;

/// Whether segments `a-b` and `c-d` intersect, endpoints and collinear overlap
/// included. Used to decide whether two trajectories share space in the box.
bool segmentsIntersect(Vec2 a, Vec2 b, Vec2 c, Vec2 d) {
  final o1 = _orientation(a, b, c);
  final o2 = _orientation(a, b, d);
  final o3 = _orientation(c, d, a);
  final o4 = _orientation(c, d, b);

  if (o1 != o2 && o3 != o4) return true;

  // Collinear endpoints that fall on the other segment still count as touching.
  if (o1 == 0 && _onSegment(a, b, c)) return true;
  if (o2 == 0 && _onSegment(a, b, d)) return true;
  if (o3 == 0 && _onSegment(c, d, a)) return true;
  if (o4 == 0 && _onSegment(c, d, b)) return true;
  return false;
}

/// The point where segments `a-b` and `c-d` cross, or null when they are
/// parallel or do not meet. Used to place a [CollisionEvent] at the overlap.
Vec2? segmentIntersectionPoint(Vec2 a, Vec2 b, Vec2 c, Vec2 d) {
  final r = b - a;
  final s = d - c;
  final denom = _cross(r, s);
  if (denom.abs() < 1e-12) return null; // parallel or degenerate
  final t = _cross(c - a, s) / denom;
  final u = _cross(c - a, r) / denom;
  if (t < -1e-9 || t > 1 + 1e-9 || u < -1e-9 || u > 1 + 1e-9) return null;
  return a + r * t;
}

/// Whether two convex polygons overlap, by the separating-axis theorem.
///
/// The narrow phase of collision detection: each vehicle is an oriented box, so
/// a real overlap means the two footprints intersect. Touching edges (a gap of
/// exactly zero) do not count as overlapping, so vehicles may sit bumper to
/// bumper without registering a crash.
bool obbOverlap(List<Vec2> a, List<Vec2> b) {
  for (final poly in [a, b]) {
    for (var i = 0; i < poly.length; i++) {
      // Outward normal of one edge is a candidate separating axis.
      final edge = poly[(i + 1) % poly.length] - poly[i];
      final axis = edge.perpRight;
      if (axis.length < 1e-12) continue;

      var minA = double.infinity, maxA = double.negativeInfinity;
      var minB = double.infinity, maxB = double.negativeInfinity;
      for (final p in a) {
        final d = p.dot(axis);
        if (d < minA) minA = d;
        if (d > maxA) maxA = d;
      }
      for (final p in b) {
        final d = p.dot(axis);
        if (d < minB) minB = d;
        if (d > maxB) maxB = d;
      }
      // A gap on any axis proves the polygons are disjoint.
      if (maxA <= minB + 1e-9 || maxB <= minA + 1e-9) return false;
    }
  }
  return true;
}
