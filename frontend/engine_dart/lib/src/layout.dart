import 'dart:math' as math;

import 'generated/scenario.g.dart';
import 'geom.dart';

/// Derived geometry for one road arm. Nothing here is authored - it all falls
/// out of `lanes_in`, `lanes_out` and `dir`.
class RoadLayout {
  final Road road;

  /// Unit vector from the intersection centre outward along the road.
  final Vec2 axis;

  /// Right-hand side relative to [axis] (i.e. relative to outgoing traffic).
  final Vec2 right;

  final double halfWidth;

  /// Centre to canvas edge.
  final double length;

  RoadLayout._(this.road, this.axis, this.right, this.halfWidth, this.length);

  factory RoadLayout(Road road) {
    final axis = road.dir.vector;
    // Spec formula, widened when lanes_in != lanes_out so every lane still fits.
    final half = math.max(
      (road.lanesIn + road.lanesOut) * kLaneWidth / 2,
      math.max(road.lanesIn, road.lanesOut) * kLaneWidth,
    );
    return RoadLayout._(road, axis, axis.perpRight, half, edgeDistance(road.dir));
  }

  Dir get dir => road.dir;

  /// Centre of the road's far end, at the canvas edge.
  Vec2 get farCentre => kCentre + axis * length;

  /// The road rectangle, centre to canvas edge, as a polygon.
  List<Vec2> get surface {
    final w = right * halfWidth;
    return [kCentre - w, kCentre + w, farCentre + w, farCentre - w];
  }

  /// Lateral offset of incoming lane [i] from the road centreline.
  /// Incoming traffic heads toward the centre, so its right-hand side is the
  /// side opposite [right].
  Vec2 incomingOffset(int i) => right * (-(i + 0.5) * kLaneWidth);

  /// Lateral offset of outgoing lane [j] from the road centreline.
  Vec2 outgoingOffset(int j) => right * ((j + 0.5) * kLaneWidth);

  /// A point on incoming lane [i], [t] units from the centre along the road.
  Vec2 incomingPoint(int i, double t) => kCentre + axis * t + incomingOffset(i);

  /// A point on outgoing lane [j], [t] units from the centre along the road.
  Vec2 outgoingPoint(int j, double t) => kCentre + axis * t + outgoingOffset(j);

  /// Where an actor entering on lane [i] first appears, at the canvas edge.
  Vec2 entryPoint(int i) => incomingPoint(i, length);

  /// Where an actor leaving on lane [j] disappears, at the canvas edge.
  Vec2 exitPoint(int j) => outgoingPoint(j, length);

  /// Heading of traffic arriving on this road (toward the centre).
  Vec2 get incomingHeading => -axis;

  /// Heading of traffic departing on this road.
  Vec2 get outgoingHeading => axis;
}

/// The whole derived scene geometry.
class IntersectionLayout {
  final Scene scene;
  final Map<Dir, RoadLayout> roads;

  /// Union of the road rectangles near the centre.
  final Rect box;

  IntersectionLayout._(this.scene, this.roads, this.box);

  factory IntersectionLayout(Scene scene) {
    final roads = <Dir, RoadLayout>{
      for (final r in scene.roads) r.dir: RoadLayout(r),
    };

    // Vertical arms set the box's X extent; horizontal arms set its Y extent.
    double halfX = 0, halfY = 0;
    for (final rl in roads.values) {
      if (rl.dir.isVertical) {
        halfX = math.max(halfX, rl.halfWidth);
      } else {
        halfY = math.max(halfY, rl.halfWidth);
      }
    }
    // A junction missing an axis (T-junction) still needs a box on that axis.
    if (halfX == 0) halfX = halfY;
    if (halfY == 0) halfY = halfX;

    return IntersectionLayout._(scene, roads, Rect.centred(kCentre, halfX, halfY));
  }

  RoadLayout road(Dir d) {
    final r = roads[d];
    if (r == null) throw StateError('scene has no road facing $d');
    return r;
  }

  /// Distance from the centre at which road [d] meets the intersection box.
  double boundaryDistance(Dir d) => d.isVertical ? box.height / 2 : box.width / 2;

  bool hasCrosswalk(Dir d) =>
      scene.markings.any((m) => m.type == MarkingType.crosswalk && m.at == d);

  /// Distance from the centre at which traffic arriving on [d] must stop.
  /// A crosswalk pushes the stop line back behind it - derived, never authored.
  double stopDistance(Dir d) =>
      boundaryDistance(d) +
      (hasCrosswalk(d) ? kCrosswalkGap + kCrosswalkDepth + kStopSetback : kStopSetback);
}

/// Physical footprint of an actor kind. Length runs along the heading.
class ActorSize {
  final double length;
  final double width;

  const ActorSize(this.length, this.width);
}

ActorSize sizeOf(ActorKind kind) => switch (kind) {
      ActorKind.car => const ActorSize(kVehicleLength, kVehicleWidth),
      ActorKind.emergency => const ActorSize(kVehicleLength, kVehicleWidth),
      ActorKind.truck => const ActorSize(130, 50),
      ActorKind.bus => const ActorSize(150, 50),
      ActorKind.tram => const ActorSize(kTramLength, 48),
      ActorKind.motorcycle => const ActorSize(60, 26),
      ActorKind.bicycle => const ActorSize(55, 24),
      ActorKind.pedestrian => const ActorSize(30, 30),
    };

/// Pose of an actor at a moment in time.
class ActorPose {
  final Actor actor;
  final Vec2 position;
  final Vec2 heading;
  final ActorSize size;

  const ActorPose(this.actor, this.position, this.heading, this.size);

  List<Vec2> get boxCorners => orientedBox(position, heading, size.length, size.width);
}

/// Where every actor sits before anyone is released: nose at the stop line.
///
/// This is the `preview` state (t = 0). Choreography step 1 says actors advance
/// from their entry point to their stop position, so the pre-release state is
/// the stop position - not the canvas edge.
List<ActorPose> stagedPoses(IntersectionLayout layout, List<Actor> actors) {
  return [
    for (final a in actors) stagedPose(layout, a),
  ];
}

/// Gap between a resting vehicle's nose and the stop line, so the line stays
/// visible under the vehicles layer.
const double kRestGap = 14;

ActorPose stagedPose(IntersectionLayout layout, Actor a) {
  final rl = layout.road(a.from);
  final size = sizeOf(a.kind);
  // Nose rests kRestGap short of the stop line; centre sits half a body back.
  final t = layout.stopDistance(a.from) + kRestGap + size.length / 2;
  return ActorPose(a, rl.incomingPoint(a.laneIn, t), rl.incomingHeading, size);
}
