import 'package:drift/drift.dart';

class UserProgress extends Table {
  TextColumn get id => text()();
  IntColumn get correctAnswers => integer().withDefault(const Constant(0))();
  IntColumn get wrongAnswers => integer().withDefault(const Constant(0))();
  TextColumn get lastSyncAt => text().nullable()();

  @override
  Set<Column> get primaryKey => {id};
}
