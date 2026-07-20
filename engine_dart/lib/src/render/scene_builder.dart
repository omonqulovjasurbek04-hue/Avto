import 'dart:math' as math;

import '../generated/scenario.g.dart';
import '../geom.dart';
import '../layout.dart';
import 'draw_op.dart';
import 'palette.dart';

/// Builds the display list for a scenario frozen at t = 0 (`preview` mode).
///
/// Every coordinate here is derived from the scene declaration. Nothing is
/// hand-placed, and nothing branches on a specific scenario id.
class SceneBuilder {
  final Scenario scenario;
  final IntersectionLayout layout;
  final Palette palette;

  final List<DrawOp> _ops = [];

  SceneBuilder(this.scenario)
      : layout = IntersectionLayout(scenario.scene),
        palette = Palette.forConditions(scenario.scene.conditions);

  RenderScene build() {
    _ops.clear();
    _ground();
    _roadSurfaces();
    _kerbs();
    _laneMarkings();
    _authoredMarkings();
    _tramTrack();
    _vehicles();
    _signs();
    _lights();
    return RenderScene(_ops);
  }

  // ------------------------------------------------------------------ ground

  void _ground() {
    _ops.add(FillPolygon(
      Layer.ground,
      const Rect(0, 0, kCanvas, kCanvas).corners,
      palette.ground,
    ));
  }

  void _roadSurfaces() {
    for (final rl in layout.roads.values) {
      _ops.add(FillPolygon(Layer.roadSurface, rl.surface, palette.asphalt));
    }
    // Fill the box itself so a missing arm (T-junction) leaves no notch.
    _ops.add(FillPolygon(Layer.roadSurface, layout.box.corners, palette.asphalt));
  }

  void _kerbs() {
    for (final rl in layout.roads.values) {
      final start = layout.boundaryDistance(rl.dir);
      for (final side in [-1.0, 1.0]) {
        final off = rl.right * (rl.halfWidth * side);
        _ops.add(StrokePath(
          Layer.roadSurface,
          [
            kCentre + rl.axis * start + off,
            kCentre + rl.axis * rl.length + off,
          ],
          palette.kerb,
          width: 5,
        ));
      }
    }
  }

  // ---------------------------------------------------------------- markings

  /// Centreline style is taken from an authored marking on that road when one
  /// exists, otherwise derived from the lane count.
  MarkingType _centrelineStyle(RoadLayout rl) {
    for (final m in scenario.scene.markings) {
      if (m.at != rl.dir) continue;
      if (m.type == MarkingType.solidLine ||
          m.type == MarkingType.dashedLine ||
          m.type == MarkingType.doubleSolid) {
        return m.type;
      }
    }
    final lanes = math.max(rl.road.lanesIn, rl.road.lanesOut);
    return lanes >= 2 ? MarkingType.doubleSolid : MarkingType.dashedLine;
  }

  void _laneMarkings() {
    for (final rl in layout.roads.values) {
      final from = layout.boundaryDistance(rl.dir);
      final to = rl.length;
      final a = kCentre + rl.axis * from;
      final b = kCentre + rl.axis * to;

      // Centreline, separating incoming from outgoing traffic.
      switch (_centrelineStyle(rl)) {
        case MarkingType.doubleSolid:
          for (final s in [-3.0, 3.0]) {
            final off = rl.right * s;
            _ops.add(StrokePath(Layer.markings, [a + off, b + off], palette.laneMarking, width: 3));
          }
        case MarkingType.solidLine:
          _ops.add(StrokePath(Layer.markings, [a, b], palette.laneMarking, width: 4));
        default:
          _ops.add(StrokePath(Layer.markings, [a, b], palette.laneMarking,
              width: 4, dash: const [40, 32]));
      }

      // Dividers between same-direction lanes.
      for (var i = 1; i < rl.road.lanesIn; i++) {
        final off = rl.incomingOffset(i) - rl.right * (-kLaneWidth / 2);
        _dashedAlong(rl, from, to, off);
      }
      for (var j = 1; j < rl.road.lanesOut; j++) {
        final off = rl.outgoingOffset(j) - rl.right * (kLaneWidth / 2);
        _dashedAlong(rl, from, to, off);
      }

      // Edge lines, inset from the kerb.
      for (final side in [-1.0, 1.0]) {
        final off = rl.right * ((rl.halfWidth - 6) * side);
        _ops.add(StrokePath(
          Layer.markings,
          [a + off, b + off],
          palette.laneMarking,
          width: 3,
        ));
      }
    }
  }

  void _dashedAlong(RoadLayout rl, double from, double to, Vec2 off) {
    _ops.add(StrokePath(
      Layer.markings,
      [kCentre + rl.axis * from + off, kCentre + rl.axis * to + off],
      palette.laneMarking,
      width: 3,
      dash: const [34, 34],
    ));
  }

  void _authoredMarkings() {
    for (final m in scenario.scene.markings) {
      final at = m.at;
      if (at == null || !layout.roads.containsKey(at)) continue;
      final rl = layout.road(at);
      switch (m.type) {
        case MarkingType.stopLine:
          _bandAcrossIncoming(rl, layout.stopDistance(at), 9, null);
        case MarkingType.giveWayLine:
          _bandAcrossIncoming(rl, layout.stopDistance(at), 7, const [18, 18]);
        case MarkingType.crosswalk:
          _crosswalk(rl);
        default:
          break; // centreline styles are handled in _laneMarkings
      }
    }
  }

  /// A bar spanning only the incoming lanes, perpendicular to the road.
  void _bandAcrossIncoming(RoadLayout rl, double t, double thickness, List<double>? dash) {
    final inner = kCentre + rl.axis * t;
    final near = inner; // road centreline
    final far = inner + rl.right * (-rl.road.lanesIn * kLaneWidth);
    _ops.add(StrokePath(
      Layer.markings,
      [near, far],
      palette.stopLine,
      width: thickness,
      dash: dash,
    ));
  }

  void _crosswalk(RoadLayout rl) {
    final t0 = layout.boundaryDistance(rl.dir) + kCrosswalkGap;
    final t1 = t0 + kCrosswalkDepth;
    const stripe = 16.0;
    const gap = 14.0;
    final span = rl.halfWidth - 4;

    var s = -span;
    while (s + stripe <= span) {
      final a = rl.right * s;
      final b = rl.right * (s + stripe);
      _ops.add(FillPolygon(
        Layer.markings,
        [
          kCentre + rl.axis * t0 + a,
          kCentre + rl.axis * t0 + b,
          kCentre + rl.axis * t1 + b,
          kCentre + rl.axis * t1 + a,
        ],
        palette.crosswalk,
      ));
      s += stripe + gap;
    }
  }

  void _tramTrack() {
    final track = scenario.scene.tramTrack;
    if (track == null) return;
    const gauge = 30.0;

    for (final d in Dir.values) {
      if (!track.along.wire.contains(d.wire)) continue;
      final rl = layout.roads[d];
      if (rl == null) continue;

      // Rails follow the innermost lane in each direction, which is where a
      // tram runs. Both arms of the axis line up, so the track is continuous.
      final centres = <Vec2>[
        if (rl.road.lanesIn > 0) rl.incomingOffset(0),
        if (rl.road.lanesOut > 0) rl.outgoingOffset(0),
      ];
      for (final c in centres) {
        for (final side in [-gauge / 2, gauge / 2]) {
          final off = c + rl.right * side;
          _ops.add(StrokePath(
            Layer.tramTrack,
            [kCentre + off, kCentre + rl.axis * rl.length + off],
            palette.tramRail,
            width: 4,
          ));
        }
      }
    }
  }

  // ---------------------------------------------------------------- vehicles

  void _vehicles() {
    for (final pose in stagedPoses(layout, scenario.actors)) {
      final isPlayer = pose.actor.role == ActorRole.player;
      final body = switch (pose.actor.kind) {
        ActorKind.tram => palette.tramBody,
        _ => isPlayer ? palette.playerBody : palette.vehicleBody,
      };
      final id = pose.actor.id;

      _ops.add(FillPolygon(Layer.vehicles, pose.boxCorners, body, actorId: id));
      _ops.add(StrokePath(Layer.vehicles, pose.boxCorners, palette.outline,
          width: 3, closed: true, actorId: id));

      // Windshield sits toward the nose, so heading is readable at a glance.
      final noseOffset = pose.heading.normalized * (pose.size.length * 0.22);
      _ops.add(FillPolygon(
        Layer.vehicles,
        orientedBox(pose.position + noseOffset, pose.heading,
            pose.size.length * 0.26, pose.size.width * 0.72),
        palette.windshield,
        actorId: id,
      ));
    }
  }

  // ------------------------------------------------------------- signs/lights

  void _signs() {
    for (final s in scenario.scene.signs) {
      final rl = layout.roads[s.at];
      if (rl == null) continue;
      _ops.add(SignGlyph(_roadside(rl, layout.stopDistance(s.at) + 26, 24), s.code, 44));
    }
  }

  void _lights() {
    for (final l in scenario.scene.lights) {
      if (l.state == LightState.off) continue;
      final targets = l.at == LightPlacement.all
          ? layout.roads.keys.toList()
          : [Dir.fromJson(l.at.wire)];
      for (final d in targets) {
        final rl = layout.roads[d];
        if (rl == null) continue;
        _ops.add(LightGlyph(
          _roadside(rl, layout.boundaryDistance(d) + 14, 20),
          l.state,
          34,
        ));
      }
    }
  }

  /// A point beside the road, on the right of traffic arriving on it.
  Vec2 _roadside(RoadLayout rl, double along, double clearance) {
    return kCentre + rl.axis * along + rl.right * (-(rl.halfWidth + clearance));
  }
}
