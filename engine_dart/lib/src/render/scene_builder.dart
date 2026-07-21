import 'dart:math' as math;

import '../generated/scenario.g.dart';
import '../geom.dart';
import '../layout.dart';
import 'content_warning.dart';
import 'draw_op.dart';
import 'palette.dart';

/// Scene types the layout engine knows how to derive geometry for.
/// Everything else raises [WarningCode.sceneTypeUnsupported] rather than
/// drawing something misleading.
const Set<SceneType> kSupportedSceneTypes = {
  SceneType.crossroads4way,
  SceneType.tJunction,
};

/// Marking types the renderer has artwork for. Kept next to the switch that
/// consumes it so the two cannot drift; `tools/lib/semantic.js` mirrors this
/// list to catch the problem before a render is ever attempted.
const Set<MarkingType> kRenderedMarkings = {
  MarkingType.stopLine,
  MarkingType.giveWayLine,
  MarkingType.crosswalk,
  MarkingType.solidLine,
  MarkingType.dashedLine,
  MarkingType.doubleSolid,
};

/// Sign codes with dedicated artwork. Others fall back to a shape derived from
/// the code family and raise [WarningCode.signArtworkGeneric].
const Set<String> kSignsWithArtwork = {'2.1', '2.4', '2.5'};

/// The result of building a scene: what to paint, and what could not be.
class BuiltScene {
  final RenderScene scene;
  final List<ContentWarning> warnings;

  const BuiltScene(this.scene, this.warnings);
}

/// Builds the display list for a scenario frozen at t = 0 (`preview` mode).
///
/// Every coordinate here is derived from the scene declaration. Nothing is
/// hand-placed, and nothing branches on a specific scenario id.
class SceneBuilder {
  final Scenario scenario;
  final IntersectionLayout layout;
  final Palette palette;

  final List<DrawOp> _ops = [];
  final List<ContentWarning> _warnings = [];

  SceneBuilder(this.scenario)
      : layout = IntersectionLayout(scenario.scene),
        palette = Palette.forConditions(scenario.scene.conditions);

  /// The `preview` scene, frozen at t = 0: vehicles at their staged positions.
  BuiltScene build() {
    final static_ = buildStatic();
    return BuiltScene(
      RenderScene([...static_.scene.ops, ...vehicleOps(stagedPoses(layout, scenario.actors))]),
      static_.warnings,
    );
  }

  /// Every layer except the vehicles, plus the warnings.
  ///
  /// Split out from the vehicles so playback can build the static scene once and
  /// redraw only the moving parts per frame - the whole point of keeping motion
  /// cheap on a low-end phone. Layers are sorted back-to-front at paint time
  /// (`RenderScene.ordered`), so emitting the vehicles separately, and later,
  /// changes nothing in the final image.
  BuiltScene buildStatic() {
    _ops.clear();
    _warnings.clear();

    if (!kSupportedSceneTypes.contains(scenario.scene.type)) {
      _warn(
        WarningCode.sceneTypeUnsupported,
        'scene.type',
        'no layout rule for "${scenario.scene.type.wire}"; '
            'roads are drawn generically and geometry may be wrong',
      );
    }

    _ground();
    _roadSurfaces();
    _kerbs();
    _laneMarkings();
    _authoredMarkings();
    _tramTrack();
    _signs();
    _lights();
    _atmosphere();

    return BuiltScene(RenderScene(List.of(_ops)), List.unmodifiable(_warnings));
  }

  void _warn(WarningCode code, String path, String detail) =>
      _warnings.add(ContentWarning(code, path, detail));

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

      // A one-way arm has no opposing traffic, so no centreline.
      final twoWay = rl.road.lanesIn > 0 && rl.road.lanesOut > 0;
      if (twoWay) {
        switch (_centrelineStyle(rl)) {
          case MarkingType.doubleSolid:
            for (final s in [-3.0, 3.0]) {
              final off = rl.right * s;
              _ops.add(
                  StrokePath(Layer.markings, [a + off, b + off], palette.laneMarking, width: 3));
            }
          case MarkingType.solidLine:
            _ops.add(StrokePath(Layer.markings, [a, b], palette.laneMarking, width: 4));
          default:
            _ops.add(StrokePath(Layer.markings, [a, b], palette.laneMarking,
                width: 4, dash: const [40, 32]));
        }
      }

      // Dividers between same-direction lanes.
      for (var i = 1; i < rl.road.lanesIn; i++) {
        _dashedAlong(rl, from, to, rl.incomingOffset(i) - rl.right * (-kLaneWidth / 2));
      }
      for (var j = 1; j < rl.road.lanesOut; j++) {
        _dashedAlong(rl, from, to, rl.outgoingOffset(j) - rl.right * (kLaneWidth / 2));
      }

      // Edge lines, inset from the kerb.
      for (final side in [-1.0, 1.0]) {
        final off = rl.right * ((rl.halfWidth - 6) * side);
        _ops.add(StrokePath(Layer.markings, [a + off, b + off], palette.laneMarking, width: 3));
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
    final markings = scenario.scene.markings;
    for (var i = 0; i < markings.length; i++) {
      final m = markings[i];
      final path = 'scene.markings[$i]';

      if (!kRenderedMarkings.contains(m.type)) {
        _warn(
          WarningCode.markingNotRendered,
          path,
          'marking "${m.type.wire}" is declared but the renderer has no artwork '
          'for it, so it will not appear',
        );
        continue;
      }

      final at = m.at;
      if (at == null) {
        _warn(
          WarningCode.markingMissingTarget,
          path,
          'marking "${m.type.wire}" needs an "at" road to be placed against',
        );
        continue;
      }
      if (!layout.roads.containsKey(at)) {
        _warn(
          WarningCode.attachmentUnresolved,
          path,
          'marking "${m.type.wire}" is attached to ${at.wire} but no road faces '
          'that direction',
        );
        continue;
      }

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
    if (rl.road.lanesIn == 0) {
      _warn(
        WarningCode.laneUnavailable,
        'scene.roads[${rl.dir.wire}]',
        'a stop or give-way line was requested but the road has no incoming lanes',
      );
      return;
    }
    final inner = kCentre + rl.axis * t;
    _ops.add(StrokePath(
      Layer.markings,
      [inner, inner + rl.right * (-rl.road.lanesIn * kLaneWidth)],
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
      if (rl == null) {
        _warn(
          WarningCode.attachmentUnresolved,
          'scene.tram_track',
          'track runs along ${track.along.wire} but no road faces ${d.wire}',
        );
        continue;
      }

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

  /// Draws each actor at the given pose. Playback calls this per frame with
  /// `Playback.posesAt(t)`; [build] calls it once with the staged poses. An
  /// actor that has left the scene simply is not in [poses], so it vanishes.
  List<DrawOp> vehicleOps(List<ActorPose> poses) {
    final ops = <DrawOp>[];
    for (final pose in poses) {
      final isPlayer = pose.actor.role == ActorRole.player;
      final body = switch (pose.actor.kind) {
        ActorKind.tram => palette.tramBody,
        _ => isPlayer ? palette.playerBody : palette.vehicleBody,
      };
      final id = pose.actor.id;

      ops.add(FillPolygon(Layer.vehicles, pose.boxCorners, body, actorId: id));
      ops.add(StrokePath(Layer.vehicles, pose.boxCorners, palette.outline,
          width: 3, closed: true, actorId: id));

      // Windshield sits toward the nose, so heading is readable at a glance.
      final noseOffset = pose.heading.normalized * (pose.size.length * 0.22);
      ops.add(FillPolygon(
        Layer.vehicles,
        orientedBox(pose.position + noseOffset, pose.heading, pose.size.length * 0.26,
            pose.size.width * 0.72),
        palette.windshield,
        actorId: id,
      ));
    }
    return ops;
  }

  // ------------------------------------------------------------- signs/lights

  void _signs() {
    final signs = scenario.scene.signs;
    for (var i = 0; i < signs.length; i++) {
      final s = signs[i];
      final rl = layout.roads[s.at];
      if (rl == null) {
        _warn(
          WarningCode.attachmentUnresolved,
          'scene.signs[$i]',
          'sign ${s.code} is attached to ${s.at.wire} but no road faces that direction',
        );
        continue;
      }
      if (!kSignsWithArtwork.contains(s.code)) {
        _warn(
          WarningCode.signArtworkGeneric,
          'scene.signs[$i]',
          'sign ${s.code} has no dedicated artwork; a generic shape for family '
              '"${s.code.split('.').first}" was drawn instead',
        );
      }
      _ops.add(SignGlyph(_roadside(rl, layout.stopDistance(s.at) + 26, 24), s.code, 44));
    }
  }

  void _lights() {
    final lights = scenario.scene.lights;
    for (var i = 0; i < lights.length; i++) {
      final l = lights[i];
      if (l.state == LightState.off) continue;
      final targets =
          l.at == LightPlacement.all ? layout.roads.keys.toList() : [Dir.fromJson(l.at.wire)];
      for (final d in targets) {
        final rl = layout.roads[d];
        if (rl == null) {
          _warn(
            WarningCode.attachmentUnresolved,
            'scene.lights[$i]',
            'light is attached to ${d.wire} but no road faces that direction',
          );
          continue;
        }
        _ops.add(LightGlyph(
          _roadside(rl, layout.boundaryDistance(d) + 14, 20),
          l.state,
          34,
        ));
      }
    }
  }

  /// Weather veil, above the scene but below the HUD.
  void _atmosphere() {
    if (palette.atmosphere == 0) return;
    _ops.add(FillPolygon(
      Layer.overlays,
      const Rect(0, 0, kCanvas, kCanvas).corners,
      palette.atmosphere,
    ));
  }

  /// A point beside the road, on the right of traffic arriving on it.
  Vec2 _roadside(RoadLayout rl, double along, double clearance) =>
      kCentre + rl.axis * along + rl.right * (-(rl.halfWidth + clearance));
}
