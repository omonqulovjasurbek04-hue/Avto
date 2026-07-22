import 'package:riverpod/riverpod.dart';

import '../database/daos/exam_dao.dart';
import '../database/daos/progress_dao.dart';
import '../database/database.dart';

final databaseProvider = Provider<AppDatabase>((ref) {
  final db = AppDatabase();
  ref.onDispose(() => db.close());
  return db;
});

final progressDaoProvider = Provider<ProgressDao>((ref) {
  return ProgressDao(ref.read(databaseProvider));
});

final examDaoProvider = Provider<ExamDao>((ref) {
  return ExamDao(ref.read(databaseProvider));
});
