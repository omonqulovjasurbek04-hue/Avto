import '../generated/scenario.g.dart';
import '../geom.dart';
import '../layout.dart';
import 'curve.dart';

/// The shape of an actor's route through the junction, derived from `from`,
/// `to` and the two lane indices. Never authored.
enum Manoeuvre { straight, left, right, uTurn }

/// How wide a left turn swings. 1.0 would send the curve out to the point
/// where the two lane centrelines meet - a hard corner. Pulling the control
/// points in gives the sweeping arc a left-turning driver actually takes.
const double kLeftTurnSlack = 0.75;

/// Reach of the control points on a U-turn loop, as a multiple of the lateral
/// distance between the entry and exit lanes. Large enough that the curve
/// passes the centre, per the spec's "tight loop past the centre".
const double kUTurnReach = 1.6;

/// Classifies the manoeuvre for an actor travelling `from` -> `to`.
Manoeuvre manoeuvreFor(Dir from, Dir to) {
  if (from == to) return Manoeuvre.uTurn;
  if (to == from.opposite) return Manoeuvre.straight;

  // Right-hand traffic, screen coords with Y down: the right-hand side of a
  // heading (x, y) is (-y, x), so a positive cross product means the exit lies
  // to the driver's right.
  final heading = -from.vector;
  final exit = to.vector;
  final cross = heading.x * exit.y - heading.y * exit.x;
  return cross > 0 ? Manoeuvre.right : Manoeuvre.left;
}

/// An actor's complete route: canvas edge, through the junction, canvas edge.
class Trajectory {
  final Actor actor;
  final Manoeuvre manoeuvre;
  final ArcLengthPath path;

  /// Distance along [path] at which the actor reaches its stop line. Before
  /// release it waits here; choreography measures everything from this point.
  final double stopDistance;

  /// Distance along [path] at which the actor enters and leaves the
  /// intersection box - the span where it can conflict with anyone else.
  final double conflictEntry;
  final double conflictExit;

  const Trajectory({
    required this.actor,
    required this.manoeuvre,
    required this.path,
    required this.stopDistance,
    required this.conflictEntry,
    required this.conflictExit,
  });

  double get length => path.length;
}

/// Where two rays meet, or null when they are parallel.
Vec2? _rayIntersection(Vec2 p, Vec2 dp, Vec2 q, Vec2 dq) {
  final denom = dp.x * dq.y - dp.y * dq.x;
  // Parallel within floating-point noise: a U-turn, or a straight-through
  // move where both tangents share an axis.
  if (denom.abs() < 1e-9) return null;
  final t = ((q.x - p.x) * dq.y - (q.y - p.y) * dq.x) / denom;
  return p + dp * t;
}

/// Builds the curve that carries an actor from the edge of the intersection
/// box on its incoming lane to the edge on its outgoing lane.
///
/// Tangents are pinned to the two lane headings at both ends, so the junction
/// curve always meets the straight approach and departure without a kink.
Curve _junctionCurve(
  Manoeuvre manoeuvre,
  Vec2 enter,
  Vec2 inHeading,
  Vec2 leave,
  Vec2 outHeading,
) {
  final corner = _rayIntersection(enter, inHeading, leave, -outHeading);

  switch (manoeuvre) {
    case Manoeuvre.straight:
      final lateral = (leave - enter) - inHeading * (leave - enter).dot(inHeading);
      // Lanes line up: nothing to do but go straight through.
      if (lateral.length < 1e-9) return Line(enter, leave);
      // `lane_in` and `lane_out` differ, so the actor must change lanes while
      // crossing. An S-curve with both tangents along the road does that
      // without the sideways jump a straight line would produce.
      final reach = (leave - enter).dot(inHeading) / 2;
      return Cubic(enter, enter + inHeading * reach, leave - outHeading * reach, leave);

    case Manoeuvre.right:
      // Tight radius: the control point sits right at the inner corner.
      return corner == null ? Line(enter, leave) : Quadratic(enter, corner, leave);

    case Manoeuvre.left:
      if (corner == null) return Line(enter, leave);
      // Wide radius: same corner, but the control points stop short of it so
      // the curve sweeps out past the centre instead of clipping the apex.
      return Cubic(
        enter,
        enter + inHeading * ((corner - enter).length * kLeftTurnSlack),
        leave - outHeading * ((corner - leave).length * kLeftTurnSlack),
        leave,
      );

    case Manoeuvre.uTurn:
      // The tangents are antiparallel, so there is no corner to aim at. Reach
      // forward from both ends by a multiple of the lane separation; the two
      // control points straddle the centre and pull the curve into a loop.
      final separation = (leave - enter).length;
      final reach = separation * kUTurnReach;
      return Cubic(enter, enter + inHeading * reach, leave - outHeading * reach, leave);
  }
}

/// Derives the full trajectory for one actor.
Trajectory trajectoryFor(IntersectionLayout layout, Actor actor) {
  final fromRoad = layout.road(actor.from);
  final toRoad = layout.road(actor.to);
  final manoeuvre = manoeuvreFor(actor.from, actor.to);

  final enterAt = layout.boundaryDistance(actor.from);
  final leaveAt = layout.boundaryDistance(actor.to);

  final entry = fromRoad.entryPoint(actor.laneIn);
  final enter = fromRoad.incomingPoint(actor.laneIn, enterAt);
  final leave = toRoad.outgoingPoint(actor.laneOut, leaveAt);
  final exit = toRoad.exitPoint(actor.laneOut);

  final approach = Line(entry, enter);
  final junction = _junctionCurve(
    manoeuvre,
    enter,
    fromRoad.incomingHeading,
    leave,
    toRoad.outgoingHeading,
  );
  final departure = Line(leave, exit);

  final path = ArcLengthPath([approach, junction, departure]);

  // The approach is straight, so its arc length is just its geometric length -
  // which makes these three distances exact rather than table lookups.
  final approachLength = (enter - entry).length;
  final junctionLength = path.length - approachLength - (exit - leave).length;

  return Trajectory(
    actor: actor,
    manoeuvre: manoeuvre,
    path: path,
    // The stop line sits further back than the box, so the actor stops before
    // it has entered the conflict zone. stopDistance() folds in any crosswalk.
    stopDistance: approachLength - (layout.stopDistance(actor.from) - enterAt),
    conflictEntry: approachLength,
    conflictExit: approachLength + junctionLength,
  );
}
