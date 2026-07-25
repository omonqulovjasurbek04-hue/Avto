import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function ResultScreen({ route, navigation }) {
  const { score = 0, total = 0, passed = false } = route?.params || {};
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={[styles.iconCircle, passed ? styles.passed : styles.failed]}>
          <Text style={styles.icon}>{passed ? '\u{1F389}' : '\u{274C}'}</Text>
        </View>

        <Text style={styles.title}>{passed ? "IMTIHONDAN O'TDINGIZ!" : 'IMTIHON TOPSHIRILMADI'}</Text>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Natija</Text>
            <Text style={styles.statValue}>{score} / {total}</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statLabel}>Foiz</Text>
            <Text style={[styles.statValue, { color: '#06b6d4' }]}>{percentage}%</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.btnText}>Bosh sahifa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', justifyContent: 'center', padding: 16 },
  card: { backgroundColor: '#151c2c', borderRadius: 20, padding: 24, borderWidth: 1, borderColor: '#26334d', alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  passed: { backgroundColor: 'rgba(16,185,129,0.2)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  failed: { backgroundColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  icon: { fontSize: 28 },
  title: { fontSize: 18, fontWeight: '700', color: '#f8fafc', textAlign: 'center', marginBottom: 16 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 20 },
  stat: { flex: 1, backgroundColor: '#0f1524', borderRadius: 12, padding: 12, alignItems: 'center' },
  statLabel: { fontSize: 11, color: '#94a3b8', marginBottom: 4 },
  statValue: { fontSize: 20, fontWeight: '700', color: '#f8fafc' },
  btn: { backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
