import 'dart:convert';

import 'package:engine_dart/engine_dart.dart';
import 'package:flutter/services.dart';
import 'package:riverpod/riverpod.dart';

final scenarioListProvider = FutureProvider<List<Scenario>>((ref) async {
  final manifest = await AssetManifest.loadFromAssetBundle(rootBundle);
  final assets = manifest
      .listAssets()
      .where((a) => a.startsWith('assets/content/') && a.endsWith('.json'))
      .toList()
    ..sort();

  final list = <Scenario>[];
  for (final asset in assets) {
    final raw = await rootBundle.loadString(asset);
    list.add(Scenario.fromJson(jsonDecode(raw) as Map<String, dynamic>));
  }
  return list;
});
