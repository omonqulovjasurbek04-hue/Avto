import 'package:riverpod/riverpod.dart';

import '../database/daos/progress_dao.dart';
import '../database/tables/answer_table.dart';
import 'database_provider.dart';

final userProgressProvider = FutureProvider.family<UserProgressData?, String>((ref, userId) {
  return ref.read(progressDaoProvider).getProgress(userId);
});

final recentAnswersProvider = FutureProvider.family<List<AnswerData>, ({String userId, int limit})>((ref, params) {
  return ref.read(progressDaoProvider).recentAnswers(params.userId, limit: params.limit);
});
