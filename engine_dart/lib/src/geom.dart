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

  bool get isCardinal =>
      this == Dir.n || this == Dir.s || this == Dir.e || this == Dir.w;

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
