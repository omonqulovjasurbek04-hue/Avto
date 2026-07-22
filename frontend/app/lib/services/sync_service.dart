import 'dart:convert';

import 'package:http/http.dart' as http;

import '../database/daos/exam_dao.dart';
import '../database/daos/progress_dao.dart';
import '../database/tables/answer_table.dart';
import '../database/tables/exam_table.dart';

class SyncService {
  final String _baseUrl;
  final ProgressDao _progressDao;
  final ExamDao _examDao;

  SyncService({
    required String baseUrl,
    required ProgressDao progressDao,
    required ExamDao examDao,
  })  : _baseUrl = baseUrl,
        _progressDao = progressDao,
        _examDao = examDao;

  Future<void> syncAnswers(String userId) async {
    final local = await _progressDao.recentAnswers(userId, limit: 50);
    for (final answer in local) {
      try {
        await http.post(
          Uri.parse('$_baseUrl/api/progress/$userId/answer'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'scenarioId': answer.scenarioId,
            'optionId': answer.optionId,
          }),
        );
      } catch (_) {}
    }
  }

  Future<void> syncExams(String userId) async {
    final local = await _examDao.userExams(userId, limit: 20);
    for (final exam in local) {
      try {
        await http.post(
          Uri.parse('$_baseUrl/api/exams/$userId/submit'),
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode({
            'score': exam.score,
            'total': exam.total,
            'passed': exam.passed,
            'durationSeconds': exam.durationSeconds,
          }),
        );
      } catch (_) {}
    }
  }
}
