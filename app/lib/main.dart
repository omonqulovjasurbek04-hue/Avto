import 'dart:convert';

import 'package:engine_dart/engine_dart.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show AssetManifest, rootBundle;

import 'scene_painter.dart';

/// Phase 1 shell: browse the bundled scenarios and see each rendered at t = 0.
/// Auth, sync and the real question flow arrive in Phase 7.
void main() => runApp(const PreviewApp());

const _contentRoot = 'assets/content/';

/// Discovers bundled scenarios from the asset manifest rather than a hardcoded
/// list - the bank grows to ~1200 entries, and a list would rot immediately.
Future<List<String>> _contentAssets() async {
  final manifest = await AssetManifest.loadFromAssetBundle(rootBundle);
  return manifest
      .listAssets()
      .where((a) => a.startsWith(_contentRoot) && a.endsWith('.json'))
      .toList()
    ..sort();
}

class PreviewApp extends StatelessWidget {
  const PreviewApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Scenario Preview',
      theme: ThemeData(colorSchemeSeed: const Color(0xFF3E7BD1)),
      home: const ScenarioListScreen(),
    );
  }
}

class ScenarioListScreen extends StatefulWidget {
  const ScenarioListScreen({super.key});

  @override
  State<ScenarioListScreen> createState() => _ScenarioListScreenState();
}

class _ScenarioListScreenState extends State<ScenarioListScreen> {
  late final Future<List<Scenario>> _scenarios = _load();

  Future<List<Scenario>> _load() async {
    final list = <Scenario>[];
    for (final asset in await _contentAssets()) {
      final raw = await rootBundle.loadString(asset);
      list.add(Scenario.fromJson(jsonDecode(raw) as Map<String, dynamic>));
    }
    return list;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Scenarios')),
      body: FutureBuilder<List<Scenario>>(
        future: _scenarios,
        builder: (context, snap) {
          if (snap.hasError) {
            return Center(child: Text('failed to load: ${snap.error}'));
          }
          if (!snap.hasData) {
            return const Center(child: CircularProgressIndicator());
          }
          final items = snap.data!;
          return ListView.builder(
            itemCount: items.length,
            itemBuilder: (context, i) => ListTile(
              title: Text(items[i].id),
              subtitle: Text(items[i].scene.type.wire),
              onTap: () => Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => ScenarioScreen(scenario: items[i]),
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

class ScenarioScreen extends StatelessWidget {
  final Scenario scenario;

  const ScenarioScreen({super.key, required this.scenario});

  @override
  Widget build(BuildContext context) {
    // Locale selection is the platform's; never hardcode a fallback chain.
    final locale = Localizations.maybeLocaleOf(context)?.languageCode;
    final text = locale == null ? null : scenario.question.text[locale];

    return Scaffold(
      appBar: AppBar(title: Text(scenario.id)),
      body: Column(
        children: [
          ScenarioPreview(scenario: scenario),
          if (text != null)
            Padding(
              padding: const EdgeInsets.all(16),
              child: Text(text, style: Theme.of(context).textTheme.titleMedium),
            ),
        ],
      ),
    );
  }
}
