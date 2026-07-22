import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export function ExamScreen() {
  const [started, setStarted] = useState(false);

  return (
    <View style={styles.container}>
      {!started ? (
        <View style={styles.card}>
          <Text style={styles.title}>Uzbekistan YHQ Rasmiy Imtihoni</Text>
          <Text style={styles.desc}>
            • 20 ta savol{'\n'}
            • 20 daqiqa vaqt{'\n'}
            • O'tish baliga kamida 18 ta to'g'ri javob kerak
          </Text>

          <TouchableOpacity style={styles.btn} onPress={() => setStarted(true)}>
            <Text style={styles.btnText}>Imtihonni Boshlash</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.title}>Imtihon Jarayoni</Text>
          <Text style={styles.desc}>Savol 1 / 20</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16, justifyContent: 'center' },
  card: { backgroundColor: '#151c2c', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#26334d' },
  title: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 12 },
  desc: { color: '#94a3b8', fontSize: 14, lineHeight: 22, marginBottom: 20 },
  btn: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
