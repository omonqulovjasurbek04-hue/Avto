// JavaScript entry point for the engine.
//
// Compiled with:
//   dart compile js -O2 -o ../frontend/editor/public/engine.js web/engine_web.dart
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
external void _register(
  JSFunction buildScene,
  JSFunction buildFrame,
  JSFunction sceneInfo,
  JSFunction optionFrame,
  JSString version,
);

/// Static scene at t = 0 (the `preview`).
String buildSceneJson(String scenarioJson) => _guard(() {
      final sc = _parse(scenarioJson);
      return sceneToJson(sc);
    });

/// One animation frame of the correct answer, at time [t].
String buildFrameJson(String scenarioJson, double t) => _guard(() {
      final sc = _parse(scenarioJson);
      return sceneFrameToJson(sc, t);
    });

/// Playback timing plus the computed outcome of every option.
String sceneInfoJson(String scenarioJson) => _guard(() {
      final sc = _parse(scenarioJson);
      return scenePlaybackInfo(sc);
    });

/// One animation frame of a specific option's playback, at time [t] - so the
/// viewer can show a student their own (possibly wrong) answer unfolding.
String optionFrameJson(String scenarioJson, String optionId, double t) => _guard(() {
      final sc = _parse(scenarioJson);
      final option = sc.question.options.firstWhere((o) => o.id == optionId);
      final player = ScenePlayer.forPlayback(sc, classifyOption(sc, option).playback);
      return playerFrameToJson(player, sc.id, t);
    });

Scenario _parse(String json) => Scenario.fromJson(jsonDecode(json) as Map<String, dynamic>);

String _guard(Map<String, dynamic> Function() body) {
  try {
    return jsonEncode(body());
  } catch (e) {
    return jsonEncode({'error': e.toString()});
  }
}

void main() {
  _register(
    ((JSString j) => buildSceneJson(j.toDart).toJS).toJS,
    ((JSString j, JSNumber t) => buildFrameJson(j.toDart, t.toDartDouble).toJS).toJS,
    ((JSString j) => sceneInfoJson(j.toDart).toJS).toJS,
    ((JSString j, JSString o, JSNumber t) =>
        optionFrameJson(j.toDart, o.toDart, t.toDartDouble).toJS).toJS,
    '0.1.0'.toJS,
  );
}
