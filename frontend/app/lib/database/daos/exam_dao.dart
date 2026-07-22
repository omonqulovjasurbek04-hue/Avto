import '../database.dart';
import '../tables/exam_table.dart';

class ExamDao {
  final AppDatabase _db;

  ExamDao(this._db);

  Future<int> recordExam(ExamAttemptsCompanion data) async {
    return _db.into(_db.examAttempt).insert(data);
  }

  Future<List<ExamAttemptData>> userExams(String userId, {int limit = 20}) async {
    return _db.select(_db.examAttempt)
        .where((t) => t.userId.equals(userId))
        .orderBy([(t) => OrderingTerm.desc(t.createdAt)])
        .limit(limit)
        .get();
  }

  Future<({int total, int passed})> examStats(String userId) async {
    final all = await _db.select(_db.examAttempt)
        .where((t) => t.userId.equals(userId))
        .get();
    return (
      total: all.length,
      passed: all.where((e) => e.passed).length,
    );
  }
}
