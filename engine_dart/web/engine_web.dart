// JavaScript entry point for the engine.
//
// Compiled with:
//   dart compile js -O2 -o ../editor/public/engine.js web/engine_web.dart
//
// This is the payoff for keeping engine_dart pure. Because nothing in lib/
// imports Flutter or dart:io, the whole layout engine compiles to JavaScript
// and the editor's Canvas 2D preview runs the *same* engine as the app - not a
// TypeScript reimplementation that drifts out of sync question by question.
//
// Lives outside lib/ so the purity test keeps guarding lib/ against
// dart:js_interop.
import 'dart:convert';
import 'dart:js_interop';

import 'package:engine_dart/engine_dart.dart';

/// The host must define `globalThis.__engineRegister` *before* loading this
/// script; it receives the entry points and publishes them.
///
/// The obvious spelling - assigning to a global via `globalContext` or an
/// `external set` - does not survive `dart compile js -O1` or higher: dart2js
/// treats the interop property write as side-effect-free and eliminates it,
/// leaving a bundle that loads cleanly and exports nothing. A call into a
/// host-supplied function cannot be proven pure, so it is kept. Verified by
/// tools/verify_js.js, which fails loudly if the export goes missing again.
@JS('__engineRegister')
external void _register(JSFunction buildScene, JSString version);

String buildSceneJson(String scenarioJson) {
  try {
    final sc = Scenario.fromJson(jsonDecode(scenarioJson) as Map<String, dynamic>);
    return jsonEncode(sceneToJson(sc));
  } catch (e) {
    return jsonEncode({'error': e.toString()});
  }
}

void main() {
  _register(
    ((JSString json) => buildSceneJson(json.toDart).toJS).toJS,
    '0.1.0'.toJS,
  );
}
