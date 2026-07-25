import 'dart:convert';
import 'dart:io';

import 'package:engine_dart/engine_dart.dart';
import 'package:test/test.dart';

List<Scenario> _content() {
  final files = Directory('../content')
      .listSync()
      .whereType<File>()
      .where((f) => f.path.endsWith('.json'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));
  return [
    for (final f in files)
      Scenario.fromJson(jsonDecode(f.readAsStringSync()) as Map<String, dynamic>),
  ];
}

void main() {
  final scenarios = _content();

  group('classifyOptions on the real content', () {
    for (final sc in scenarios) {
      test('${sc.id}: exactly one option is clean', () {
        final results = classifyOptions(sc);
        final clean = results.values.where((r) => r.isClean).toList();
        expect(clean.length, 1, reason: 'a question must have exactly one right answer');
      });

      test('${sc.id}: the clean option is the authored correct one', () {
        final results = classifyOptions(sc);
        final clean = results.values.firstWhere((r) => r.isClean);
        expect(clean.optionId, sc.question.correct,
            reason: 'simulation disagrees with the authored "correct" field');
      });

      test('${sc.id}: every wrong option is a violation, not clean', () {
        final results = classifyOptions(sc);
        for (final o in sc.question.options) {
          if (o.id == sc.question.correct) continue;
          expect(results[o.id]!.isClean, isFalse,
              reason: 'option ${o.id} is not the correct answer, so it must break some rule');
        }
      });

      // The authored hints are exemplary, so they should already agree with the
      // simulation - but the simulation, never the hint, is authoritative.
      test('${sc.id}: authored hints agree with the simulation (no stale hints)', () {
        expect(outcomeHintWarnings(sc), isEmpty,
            reason: outcomeHintWarnings(sc).map((w) => w.detail).join('; '));
      });
    }
  });

  group('classifyOption mechanics', () {
    final sc = scenarios.first; // order [a1, ego]; o1->a1 correct, o2->ego collides.

    test('choosing the yielding actor is clean and does not crash', () {
      final correctOption = sc.question.options.firstWhere((o) => o.id == sc.question.correct);
      final r = classifyOption(sc, correctOption);
      expect(r.isClean, isTrue);
      expect(r.playback.collided, isFalse);
    });

    test('asserting the ego out of turn collides with the priority actor', () {
      final wrong = sc.question.options.firstWhere((o) => o.id != sc.question.correct);
      final r = classifyOption(sc, wrong);
      expect(r.violation, OutcomeType.collision);
      expect(r.collision, isNotNull);
      expect(r.counterparty, isNotNull);
      // The wrong choice's playback is the one the app would show the student.
      expect(r.playback.collided, isTrue);
      expect(r.playback.duration, closeTo(r.collision!.time, 1e-9));
    });

    test('the result serialises the facts an explanation would need', () {
      final wrong = sc.question.options.firstWhere((o) => o.id != sc.question.correct);
      final json = classifyOption(sc, wrong).toJson();
      expect(json['clean'], isFalse);
      expect(json['type'], OutcomeType.collision.wire);
      expect(json['collision'], isNotNull);
    });
  });

  group('outcomeHintWarnings', () {
    final sc = _content().first;

    test('a stale hint is reported, and the simulation is not overridden', () {
      // Author claims the correct answer causes a collision - a wrong hint.
      final withBadHint = Scenario(
        id: sc.id,
        schemaVersion: sc.schemaVersion,
        questionId: sc.questionId,
        topic: sc.topic,
        scene: sc.scene,
        actors: sc.actors,
        question: sc.question,
        resolution: Resolution(
          order: sc.resolution.order,
          rule: sc.resolution.rule,
          wrongOutcomes: {sc.question.correct: const Outcome(type: OutcomeType.collision)},
        ),
      );

      final warnings = outcomeHintWarnings(withBadHint);
      expect(warnings.map((w) => w.code), contains(WarningCode.outcomeHintMismatch));
      // The outcome itself is unchanged: the correct option is still clean.
      expect(
          classifyOption(
                  withBadHint, sc.question.options.firstWhere((o) => o.id == sc.question.correct))
              .isClean,
          isTrue);
    });
  });
}
