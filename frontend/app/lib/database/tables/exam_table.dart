import 'package:drift/drift.dart';

class ExamAttempt extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get score => integer()();
  IntColumn get total => integer()();
  BoolColumn get passed => boolean()();
  IntColumn get durationSeconds => integer()();
  IntColumn get createdAt => integer()();
  TextColumn get userId => text()();

  @override
  Set<Column> get primaryKey => {id};
}
