import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';

// Base URL for the engine bundle. 10.0.2.2 is the Android emulator's alias for
// the host machine's localhost; on a real device set EXPO_PUBLIC_API_BASE to the
// laptop's LAN IP (e.g. http://192.168.1.42:4000).
const API_BASE = process.env.EXPO_PUBLIC_API_BASE || 'http://10.0.2.2:4000';

const OUTCOME_LABEL = {
  collision: "To'qnashuv yuz berdi!",
  priority_violation: "Yo'l berilmadi!",
  sign_violation: 'Belgi buzildi!',
  marking_violation: 'Chiziq buzildi!',
  unnecessary_wait: 'Kutish shart emas edi',
  unsafe_but_legal: 'Xavfli, lekin qonuniy',
};

export function MobileScenarioPlayer({ scenarioData, lang = 'uz', onAnswerSelected }) {
  const webViewRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [result, setResult] = useState(null); // { clean, type }

  const scenarioJson = JSON.stringify(scenarioData);
  const correctId = scenarioData?.question?.correct;

  // The WebView document is rebuilt only when the scenario changes, so playback
  // state (time) lives inside the page rather than being re-injected each render.
  const htmlContent = useMemo(
    () => buildHtml(scenarioJson),
    [scenarioJson],
  );

  const inject = (js) => webViewRef.current?.injectJavaScript(js + '; true;');

  const handleSelectOption = (optId) => {
    inject(`window.__play(${JSON.stringify(optId)}, false)`);
    setPlaying(true);
    if (onAnswerSelected) onAnswerSelected(optId);
  };

  const watchCorrect = () => {
    if (!correctId) return;
    inject(`window.__play(${JSON.stringify(correctId)}, true)`);
    setPlaying(true);
  };

  const onMessage = (e) => {
    let msg;
    try { msg = JSON.parse(e.nativeEvent.data); } catch { return; }
    if (msg.type === 'outcome') setResult({ clean: msg.clean, type: msg.outcome });
    if (msg.type === 'ended') setPlaying(false);
  };

  const questionText = scenarioData?.question?.text?.[lang] || scenarioData?.question?.text?.['uz'] || '';
  const options = scenarioData?.question?.options || [];
  const rule = scenarioData?.resolution?.rule;
  const ruleText = rule?.text?.[lang] || rule?.text?.['uz'] || '';

  return (
    <View style={styles.container}>
      <View style={styles.canvasContainer}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: htmlContent }}
          style={{ flex: 1, backgroundColor: '#090d14' }}
          scrollEnabled={false}
          onMessage={onMessage}
        />
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => { inject('window.__toggle()'); setPlaying((p) => !p); }}
        >
          <Text style={styles.iconTxt}>{playing ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.iconBtn, styles.ghost]} onPress={() => { inject('window.__replay()'); setPlaying(true); }}>
          <Text style={styles.iconTxt}>↺</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.metaContainer}>
        <Text style={styles.questionText}>{questionText}</Text>

        <View style={styles.optionsList}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.id}
              style={styles.optionButton}
              onPress={() => handleSelectOption(opt.id)}
            >
              <Text style={styles.optionText}>{opt.label?.[lang] || opt.label?.['uz']}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {result && (
          <View style={[styles.banner, result.clean ? styles.bannerGood : styles.bannerBad]}>
            <Text style={styles.bannerIcon}>{result.clean ? '✅' : '💥'}</Text>
            <Text style={styles.bannerText}>
              {result.clean ? "To'g'ri javob!" : (OUTCOME_LABEL[result.type] || 'Xato')}
            </Text>
          </View>
        )}

        {result && !result.clean && (
          <TouchableOpacity style={styles.watchCorrect} onPress={watchCorrect}>
            <Text style={styles.watchCorrectText}>✅ To'g'ri javobni ko'rish</Text>
          </TouchableOpacity>
        )}

        {result && ruleText ? (
          <View style={styles.ruleBox}>
            <Text style={styles.ruleCode}>YHQ {rule?.code || ''}-band</Text>
            <Text style={styles.ruleText}>{ruleText}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

// The self-contained page that loads the engine bundle and drives playback. The
// only drawing code is drawDisplayList (fill polygon / stroke path / fill
// circle) — identical contract to shared/engine-js/renderer.mjs.
function buildHtml(scenarioJson) {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
        <style>
          body { margin: 0; background: #090d14; display: flex; justify-content: center; align-items: center; height: 100vh; overflow: hidden; }
          canvas { width: 100vw; height: 100vw; max-width: 100vh; max-height: 100vh; display: block; }
          #ov { position: fixed; inset: 0; display: none; align-items: center; justify-content: center; flex-direction: column; font-family: system-ui, sans-serif; }
          #ov.show { display: flex; }
          #ov .i { font-size: 56px; }
          #ov .t { font-size: 22px; font-weight: 800; margin-top: 6px; letter-spacing: .02em; }
        </style>
        <script>
          window.__engineRegister = (buildScene, buildFrame, sceneInfo, optionFrame, version) => {
            window.__yhqEngine = { buildScene, buildFrame, sceneInfo, optionFrame, version };
          };
        </script>
        <script src="${API_BASE}/engine.js"></script>
      </head>
      <body>
        <canvas id="cv" width="900" height="900"></canvas>
        <div id="ov"><div class="i" id="ovi">💥</div><div class="t" id="ovt"></div></div>
        <script>
          var raw = ${JSON.stringify(scenarioJson)};
          var t = 0, playing = false, opt = null, correctMode = false, last = 0;
          var info = null, dur = 5;

          function post(m) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(m)); }
          function rgba(argb) { var a = ((argb >>> 24) & 0xff) / 255; return "rgba(" + ((argb >> 16) & 0xff) + "," + ((argb >> 8) & 0xff) + "," + (argb & 0xff) + "," + a + ")"; }
          function trace(ctx, flat, closed) { ctx.beginPath(); ctx.moveTo(flat[0], flat[1]); for (var i = 2; i < flat.length; i += 2) ctx.lineTo(flat[i], flat[i + 1]); if (closed) ctx.closePath(); }
          function draw(ctx, frame, size) {
            var s = size / frame.canvas;
            ctx.setTransform(s, 0, 0, s, 0, 0); ctx.clearRect(0, 0, frame.canvas, frame.canvas);
            ctx.lineCap = "butt"; ctx.lineJoin = "miter";
            for (var k = 0; k < frame.ops.length; k++) {
              var op = frame.ops[k];
              if (op.op === "fillPolygon") { trace(ctx, op.points, true); ctx.fillStyle = rgba(op.colour); ctx.fill(); }
              else if (op.op === "strokePath") { trace(ctx, op.points, op.closed); ctx.strokeStyle = rgba(op.colour); ctx.lineWidth = op.width; ctx.setLineDash(op.dash || []); ctx.stroke(); ctx.setLineDash([]); }
              else if (op.op === "fillCircle") { ctx.beginPath(); ctx.arc(op.centre[0], op.centre[1], op.radius, 0, Math.PI * 2); ctx.fillStyle = rgba(op.colour); ctx.fill(); }
            }
          }

          var LABEL = { collision: ["💥","TO'QNASHUV!"], priority_violation: ["⚠️","YO'L BERILMADI!"], sign_violation: ["⚠️","BELGI BUZILDI!"], marking_violation: ["⚠️","CHIZIQ BUZILDI!"], unnecessary_wait: ["⚠️","KUTISH SHART EMAS"], unsafe_but_legal: ["⚠️","XAVFLI, LEKIN QONUNIY"] };
          function activeDur() { return (opt && info && info.options[opt] && info.options[opt].duration) || (info && info.duration) || 5; }
          function showOverlay(out) {
            var ov = document.getElementById("ov");
            if (out.clean) { document.getElementById("ovi").textContent = "✅"; document.getElementById("ovt").textContent = "TO'G'RI"; document.getElementById("ovt").style.color = "#a7f3d0"; ov.style.background = "rgba(16,185,129,.14)"; }
            else { var l = LABEL[out.type] || LABEL.collision; document.getElementById("ovi").textContent = l[0]; document.getElementById("ovt").textContent = l[1]; document.getElementById("ovt").style.color = out.type === "collision" ? "#fecaca" : "#fde68a"; ov.style.background = out.type === "collision" ? "rgba(239,68,68,.14)" : "rgba(245,158,11,.14)"; }
            ov.className = "show";
          }

          var canvas = document.getElementById("cv");
          var ctx = canvas.getContext("2d");

          function frame() {
            var now = performance.now();
            var dt = last ? (now - last) / 1000 : 0; last = now;
            if (playing) {
              t += dt;
              if (t >= activeDur()) { t = activeDur(); playing = false; post({ type: "ended" }); }
            }
            if (window.__yhqEngine) {
              var str = opt ? window.__yhqEngine.optionFrame(raw, opt, t) : window.__yhqEngine.buildFrame(raw, t);
              if (str) draw(ctx, JSON.parse(str), 900);
            }
            requestAnimationFrame(frame);
          }

          function ensureInfo() { if (!info && window.__yhqEngine) { try { info = JSON.parse(window.__yhqEngine.sceneInfo(raw)); } catch (e) {} } }

          // Public API used by React Native via injectJavaScript.
          window.__play = function (optionId, correct) {
            ensureInfo();
            opt = optionId; correctMode = !!correct; t = 0; playing = true; last = 0;
            document.getElementById("ov").className = "";
            if (info && info.options[optionId]) { var out = info.options[optionId]; if (!correct) post({ type: "outcome", clean: !!out.clean, outcome: out.clean ? null : out.type }); setTimeout(function () { showOverlay(correct ? { clean: true } : out); }, Math.max(0, (activeDur() - 0.15)) * 1000); }
          };
          window.__toggle = function () { if (!playing && t >= activeDur()) t = 0; playing = !playing; last = 0; if (playing) document.getElementById("ov").className = ""; };
          window.__replay = function () { t = 0; playing = true; last = 0; document.getElementById("ov").className = ""; };

          function start() { ensureInfo(); if (info) dur = info.duration; requestAnimationFrame(frame); }
          if (window.__yhqEngine) start(); else window.addEventListener("load", function () { setTimeout(start, 50); });
        </script>
      </body>
    </html>
  `;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  canvasContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#090d14', borderRadius: 16, overflow: 'hidden' },
  controls: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  ghost: { backgroundColor: '#1e293b' },
  iconTxt: { color: '#fff', fontSize: 18 },
  metaContainer: { padding: 16 },
  questionText: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 16 },
  optionsList: { gap: 10 },
  optionButton: { backgroundColor: '#1e293b', borderColor: '#26334d', borderWidth: 1.5, borderRadius: 12, padding: 14 },
  optionText: { color: '#f8fafc', fontSize: 14, fontWeight: '500' },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12, marginTop: 14 },
  bannerGood: { backgroundColor: 'rgba(16,185,129,.14)' },
  bannerBad: { backgroundColor: 'rgba(239,68,68,.14)' },
  bannerIcon: { fontSize: 22 },
  bannerText: { color: '#f8fafc', fontWeight: '700', fontSize: 15 },
  watchCorrect: { marginTop: 12, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,.1)', alignItems: 'center' },
  watchCorrectText: { color: '#10b981', fontWeight: '700', fontSize: 14 },
  ruleBox: { marginTop: 12, padding: 14, borderRadius: 12, backgroundColor: '#0f1524', borderWidth: 1, borderColor: '#26334d' },
  ruleCode: { color: '#3b82f6', fontWeight: '700', fontSize: 12, marginBottom: 4 },
  ruleText: { color: '#dbe4f3', fontSize: 13, lineHeight: 19 },
});
