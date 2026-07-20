import 'dart:convert';
import 'dart:io';

import 'package:engine_dart/engine_dart.dart';
import 'package:test/test.dart';

/// Principle 6: every scene must round-trip with no loss.
///
/// toJson() normalises (defaults become explicit), so the invariant is
/// fixpoint stability: decode -> encode -> decode -> encode gives identical
/// JSON, and the second decode sees every authored value.
void main() {
  final files = Directory('../content')
      .listSync()
      .whereType<File>()
      .where((f) => f.path.endsWith('.json'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));

  test('content directory is not empty', () {
    expect(files, isNotEmpty);
  });

  for (final f in files) {
    test('round-trip ${f.uri.pathSegments.last}', () {
      final original = jsonDecode(f.readAsStringSync()) as Map<String, dynamic>;

      final once = Scenario.fromJson(original).toJson();
      final twice = Scenario.fromJson(jsonDecode(jsonEncode(once)) as Map<String, dynamic>).toJson();

      expect(jsonEncode(twice), jsonEncode(once), reason: 'encode/decode must be a fixpoint');

      // No authored value may be lost: everything in the source file must
      // survive into the normalised form.
      _expectSubset(original, once, 'scenario');
    });
  }
}

void _expectSubset(dynamic authored, dynamic kept, String path) {
  if (authored is Map) {
    expect(kept, isA<Map>(), reason: '$path changed shape');
    for (final k in authored.keys) {
      expect((kept as Map).containsKey(k), isTrue, reason: '$path.$k was dropped');
      _expectSubset(authored[k], kept[k], '$path.$k');
    }
  } else if (authored is List) {
    expect(kept, isA<List>(), reason: '$path changed shape');
    expect((kept as List).length, authored.length, reason: '$path changed length');
    for (var i = 0; i < authored.length; i++) {
      _expectSubset(authored[i], kept[i], '$path[$i]');
    }
  } else {
    expect(kept, authored, reason: '$path changed value');
  }
}
