import 'dart:math' as math;

import '../generated/scenario.g.dart';
import '../layout.dart';
import 'choreography.dart';
import 'simulation.dart';

/// A ready-to-scrub animation of one scenario, playing a given order of actors.
///
/// Built once and reused for every frame (choreography and the collision check
/// are the expensive parts, and both are done here, up front). Each frame then
/// costs only a table lookup per actor - which is what keeps playback within the
/// per-frame budget on a cheap phone.
///
/// [posesAt] is a pure function of time: the same [Playback] returns the same
/// poses for the same `t`, so the display is deterministic and the caller (a
/// Flutter `Ticker`, the browser clock, or a test) owns the clock.
class Playback {
  final Choreography choreography;
  final List<Actor> actors;

  /// The crash this order produces, if any. Playback freezes here.
  final CollisionEvent? collision;

  /// Length of the animation in seconds: the collision time if the order
  /// crashes, otherwise the point at which the last actor has left the canvas.
  final double duration;

  Playback._(this.choreography, this.actors, this.collision, this.duration);

  /// Plays the scenario's authored resolution - the correct answer.
  factory Playback.of(Scenario scenario) => Playback.forOrder(
        IntersectionLayout(scenario.scene),
        scenario.actors,
        scenario.resolution.order,
      );

  /// Plays [actors] released in [order]. Used directly by the outcome
  /// classifier, which feeds candidate orders.
  factory Playback.forOrder(
    IntersectionLayout layout,
    List<Actor> actors,
    List<String> order,
  ) {
    final ch = Choreography.solve(layout, actors, order);
    return Playback.fromChoreography(ch, actors);
  }

  /// Plays an already-solved choreography. The classifier uses this with a
  /// hand-built choreography where the chosen actor asserts itself.
  factory Playback.fromChoreography(Choreography ch, List<Actor> actors) {
    final sim = Simulation.run(ch, actors);
    return Playback._(ch, actors, sim.collision, sim.endTime);
  }

  bool get collided => collision != null;

  /// Poses of every actor still on screen at time [t].
  ///
  /// Two things are folded in here so every renderer behaves identically:
  /// motion freezes at the collision (time is clamped to it), and an actor that
  /// has driven off the canvas is dropped rather than parked at the edge.
  List<ActorPose> posesAt(double t) {
    final clamped = math.min(t, duration);
    return [
      for (final a in actors)
        if (!choreography.hasExited(a.id, clamped)) choreography.poseAt(a, clamped),
    ];
  }
}
