import 'dart:io';

import 'package:test/test.dart';

/// Guards the first non-negotiable principle: `engine_dart` is pure Dart.
///
/// Nothing else enforces this. Without it, one `import 'package:flutter/...'`
/// silently makes the engine unbuildable in CI and untestable headlessly, and
/// the failure surfaces days later somewhere unrelated.
void main() {
  final dartFiles = Directory('lib')
      .listSync(recursive: true)
      .whereType<File>()
      .where((f) => f.path.endsWith('.dart'))
      .toList()
    ..sort((a, b) => a.path.compareTo(b.path));

  String rel(File f) => f.path.replaceAll(r'\', '/');

  test('lib is not empty', () => expect(dartFiles, isNotEmpty));

  group('no Flutter anywhere in the engine', () {
    for (final f in dartFiles) {
      test(rel(f), () {
        final offending = _imports(f).where((i) => i.startsWith('package:flutter'));
        expect(
          offending,
          isEmpty,
          reason: '${rel(f)} imports Flutter. The engine must stay pure Dart so '
              'it runs headlessly in CI; move UI concerns into /app.',
        );
      });
    }
  });

  group('the core engine is platform-independent', () {
    // The rasteriser legitimately needs dart:io for zlib. Everything reachable
    // from the main entrypoint must not, so the engine can also run on web.
    final coreOnly = dartFiles.where((f) => !rel(f).contains('/src/raster/'));

    for (final f in coreOnly) {
      test(rel(f), () {
        final offending = _imports(f).where(
          (i) => i == 'dart:io' || i == 'dart:ui' || i == 'dart:html',
        );
        expect(
          offending,
          isEmpty,
          reason: '${rel(f)} imports ${offending.join(', ')}. Only lib/src/raster '
              'may depend on the host platform.',
        );
      });
    }
  });

  test('the public entrypoint does not leak the rasteriser', () {
    // raster.dart is a separate entrypoint on purpose: the app never needs it.
    final exports = _imports(File('lib/engine_dart.dart'));
    expect(exports.where((e) => e.contains('raster')), isEmpty);
  });
}

/// Import and export targets in a Dart source file, ignoring comments.
Iterable<String> _imports(File f) sync* {
  final pattern = RegExp(r'''^\s*(?:import|export)\s+['"]([^'"]+)['"]''');
  for (final line in f.readAsLinesSync()) {
    final m = pattern.firstMatch(line);
    if (m != null) yield m.group(1)!;
  }
}
