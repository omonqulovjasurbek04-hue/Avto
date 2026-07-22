import 'dart:io';

import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path/path.dart' as p;
import 'package:path_provider/path_provider.dart';

import 'tables/answer_table.dart';
import 'tables/exam_table.dart';
import 'tables/user_progress_table.dart';

part 'database.g.dart';

@DriftDatabase(
  tables: [
    UserProgress,
    Answer,
    ExamAttempt,
  ],
)
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;
}

LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dir = await getApplicationDocumentsDirectory();
    final file = File(p.join(dir.path, 'yhq.db'));
    return NativeDatabase(file);
  });
}
