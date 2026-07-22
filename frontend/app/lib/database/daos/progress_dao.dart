import 'package:drift/drift.dart';

import '../database.dart';
import '../tables/answer_table.dart';
import '../tables/user_progress_table.dart';

class ProgressDao {
  final AppDatabase _db;

  ProgressDao(this._db);

  Future<UserProgressData?> getProgress(String userId) async {
    return _db.select(_db.userProgress)
        .where((t) => t.id.equals(userId))
        .getSingleOrNull();
  }

  Future<void> upsertProgress(UserProgressCompanion data) async {
    await _db.into(_db.userProgress).insertOnConflictUpdate(data);
  }

  Future<int> recordAnswer(AnswersCompanion data) async {
    final id = await _db.into(_db.answer).insert(data);
    final answer = AnswerData(
      id: id,
      scenarioId: data.scenarioId.value,
      optionId: data.optionId.value,
      isCorrect: data.isCorrect.value,
      outcomeType: data.outcomeType.value,
      answeredAt: data.answeredAt.value,
      userId: data.userId.value,
    );
    await _updateCounts(answer.userId, answer.isCorrect);
    return id;
  }

  Future<List<AnswerData>> recentAnswers(String userId, {int limit = 20}) async {
    return _db.select(_db.answer)
        .where((t) => t.userId.equals(userId))
        .orderBy([(t) => OrderingTerm.desc(t.answeredAt)])
        .limit(limit)
        .get();
  }

  Future<void> _updateCounts(String userId, bool correct) async {
    final existing = await getProgress(userId);
    if (existing != null) {
      await upsertProgress(UserProgressCompanion(
        id: Value(userId),
        correctAnswers: Value(existing.correctAnswers + (correct ? 1 : 0)),
        wrongAnswers: Value(existing.wrongAnswers + (correct ? 0 : 1)),
      ));
    } else {
      await upsertProgress(UserProgressCompanion(
        id: Value(userId),
        correctAnswers: Value(correct ? 1 : 0),
        wrongAnswers: Value(correct ? 0 : 1),
      ));
    }
  }
}
