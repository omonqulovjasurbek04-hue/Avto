import '../generated/scenario.g.dart';
import '../layout.dart';
import '../render/content_warning.dart';
import 'choreography.dart';
import 'motion_profile.dart';
import 'playback.dart';
import 'simulation.dart';

/// What actually happens when the student picks one option, computed by
/// simulation - never read from the authored `wrong_outcomes` hint.
///
/// [violation] is null for the correct answer. The [playback] plays exactly this
/// outcome, so the app can show the student's own choice unfolding (and, for a
/// wrong one, freezing at the crash).
class OutcomeResult {
  final String optionId;

  /// The rule broken, or null when the choice was correct (`clean`).
  final OutcomeType? violation;

  /// Present when [violation] is [OutcomeType.collision].
  final CollisionEvent? collision;

  /// The other actor implicated - who was hit, or who was made to wait.
  final String? counterparty;

  /// A ready-to-play animation of this exact choice.
  final Playback playback;

  const OutcomeResult({
    required this.optionId,
    required this.violation,
    required this.collision,
    required this.counterparty,
    required this.playback,
  });

  bool get isClean => violation == null;

  Map<String, dynamic> toJson() => {
        'option': optionId,
        'clean': isClean,
        if (violation != null) 'type': violation!.wire,
        if (counterparty != null) 'with': counterparty,
        if (collision != null) 'collision': collision!.toJson(),
      };
}

const double _releaseEps = 1e-6;

/// Classifies every option of [scenario] by simulating the choice it represents.
Map<String, OutcomeResult> classifyOptions(Scenario scenario) => {
      for (final o in scenario.question.options) o.id: classifyOption(scenario, o),
    };

/// Content warnings from comparing the computed outcomes against the authored
/// `wrong_outcomes` hints. The simulation is the source of truth (invariant:
/// outcomes are computed, not authored); a disagreement means the hint is stale
/// and the editor should show it - the outcome itself never changes.
///
/// Two disagreements are reported: a hint whose type differs from what the
/// simulation found, and a hint on an option the simulation rules clean.
List<ContentWarning> outcomeHintWarnings(Scenario scenario) {
  final results = classifyOptions(scenario);
  final warnings = <ContentWarning>[];

  scenario.resolution.wrongOutcomes.forEach((optionId, hint) {
    final computed = results[optionId];
    if (computed == null) return; // an unknown option id is a schema concern
    final actual = computed.violation?.wire ?? 'clean';
    if (computed.isClean) {
      warnings.add(ContentWarning(
        WarningCode.outcomeHintMismatch,
        'resolution.wrong_outcomes.$optionId',
        'hinted "${hint.type.wire}", but simulation finds this option is correct',
      ));
    } else if (computed.violation != hint.type) {
      warnings.add(ContentWarning(
        WarningCode.outcomeHintMismatch,
        'resolution.wrong_outcomes.$optionId',
        'hinted "${hint.type.wire}", but simulation computed "$actual"',
      ));
    }
  });

  return warnings;
}

/// Classifies one option.
///
/// The student controls the player (ego) actor and nothing else. An option
/// naming the ego asserts "I go"; any other option asserts "I yield to them".
/// The other actors always behave correctly - they follow `resolution.order`
/// and do not give way to an ego that jumped the queue, which is exactly why a
/// wrong "I go" produces a real collision rather than a polite pause.
OutcomeResult classifyOption(Scenario scenario, Option option) {
  final layout = IntersectionLayout(scenario.scene);
  final actors = scenario.actors;
  final ego = actors.firstWhere(
    (a) => a.role == ActorRole.player,
    orElse: () => throw StateError('scenario ${scenario.id} has no player actor to classify'),
  );

  final correct = Choreography.solve(layout, actors, scenario.resolution.order);
  final correctEgoRelease = correct.profile(ego.id).releaseTime;

  // What release does the ego get if it follows this option?
  final double egoRelease;
  if (option.refersTo == ego.id) {
    egoRelease = 0; // "I go first."
  } else if (option.refersTo != null) {
    egoRelease = _yieldTime(correct, ego, option.refersTo!); // "I yield to them."
  } else {
    // "Nobody proceeds" - the ego yields to whoever it could conflict with.
    egoRelease = _yieldToAll(correct, ego, actors);
  }

  // Everyone keeps their correct timing; only the ego deviates.
  final releases = {
    for (final a in actors) a.id: a.id == ego.id ? egoRelease : correct.profile(a.id).releaseTime,
  };
  final playback = Playback.fromChoreography(
    Choreography.fromReleaseTimes(layout, actors, releases),
    actors,
  );

  if (playback.collided) {
    final c = playback.collision!;
    final other = c.actorA == ego.id ? c.actorB : c.actorA;
    return OutcomeResult(
      optionId: option.id,
      violation: OutcomeType.collision,
      collision: c,
      counterparty: other,
      playback: playback,
    );
  }

  // No crash: the choice is judged by whether the ego moved at the right time.
  if (egoRelease < correctEgoRelease - _releaseEps) {
    // Went before its turn but got away with it - a priority violation.
    return OutcomeResult(
      optionId: option.id,
      violation: OutcomeType.priorityViolation,
      collision: null,
      counterparty: _priorityHolder(correct, scenario.resolution.order, ego),
      playback: playback,
    );
  }
  if (egoRelease > correctEgoRelease + _releaseEps) {
    // Waited when it did not have to.
    return OutcomeResult(
      optionId: option.id,
      violation: OutcomeType.unnecessaryWait,
      collision: null,
      counterparty: option.refersTo,
      playback: playback,
    );
  }

  return OutcomeResult(
    optionId: option.id,
    violation: null,
    collision: null,
    counterparty: null,
    playback: playback,
  );
}

/// Time the ego must wait to let [otherId] clear the conflict zone first.
double _yieldTime(Choreography correct, Actor ego, String otherId) {
  if (!trajectoriesConflict(correct.trajectory(ego.id), correct.trajectory(otherId))) return 0;
  final other = correct.trajectory(otherId);
  final tail = sizeOf(other.actor.kind).length / 2;
  final clears = correct.profile(otherId).timeToReach(other.conflictExit + tail);
  return clears + kSafetyGap;
}

double _yieldToAll(Choreography correct, Actor ego, List<Actor> actors) {
  var release = 0.0;
  for (final a in actors) {
    if (a.id == ego.id) continue;
    final t = _yieldTime(correct, ego, a.id);
    if (t > release) release = t;
  }
  return release;
}

/// The higher-priority actor the ego should have yielded to: the first one
/// ahead of the ego in the order that shares its conflict zone.
String? _priorityHolder(Choreography correct, List<String> order, Actor ego) {
  for (final id in order) {
    if (id == ego.id) break;
    if (trajectoriesConflict(correct.trajectory(ego.id), correct.trajectory(id))) return id;
  }
  return null;
}
