import 'package:drift/drift.dart';

class Answer extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get scenarioId => text()();
  TextColumn get optionId => text()();
  BoolColumn get isCorrect => boolean()();
  TextColumn get outcomeType => text().nullable()();
  IntColumn get answeredAt => integer()();
  TextColumn get userId => text()();

  @override
  Set<Column> get primaryKey => {id};
}
