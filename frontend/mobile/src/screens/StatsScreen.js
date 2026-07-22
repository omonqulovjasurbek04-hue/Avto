import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function StatsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>O'quvchi Statistikasi</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Yechilgan savollar:</Text>
        <Text style={styles.val}>12 ta</Text>

        <Text style={styles.label}>To'g'ri javoblar:</Text>
        <Text style={[styles.val, { color: '#10b981' }]}>10 ta</Text>

        <Text style={styles.label}>Aniqlik darajasi:</Text>
        <Text style={[styles.val, { color: '#3b82f6' }]}>83%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  header: { fontSize: 20, fontWeight: '700', color: '#f8fafc', marginBottom: 16 },
  card: { backgroundColor: '#151c2c', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#26334d' },
  label: { color: '#94a3b8', fontSize: 13, marginTop: 10 },
  val: { color: '#f8fafc', fontSize: 22, fontWeight: '700', marginTop: 2 },
});
