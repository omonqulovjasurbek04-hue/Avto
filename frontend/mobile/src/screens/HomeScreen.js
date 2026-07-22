import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export function HomeScreen({ navigation }) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>Yo'l Harakati Qoidalari (YHQ)</Text>
        <Text style={styles.heroSub}>Interaktiv 2D animatsiyalar bilan chorraha va imtiyoz qoidalarini tez o'rganing.</Text>

        <TouchableOpacity
          style={styles.heroButton}
          onPress={() => navigation.navigate('Exam')}
        >
          <Text style={styles.heroButtonText}>🚀 Imtihon Boshlash (20 Savol)</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>O'quv Bo'limlari</Text>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Practice')}>
        <Text style={styles.cardIcon}>🚦</Text>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Interaktiv Mashqlar</Text>
          <Text style={styles.cardSub}>Har bir ssenariyni animatsiyada o'ynatish va qoidani tushunish</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('Stats')}>
        <Text style={styles.cardIcon}>📊</Text>
        <View style={styles.cardTextContainer}>
          <Text style={styles.cardTitle}>Statistika & Natijalar</Text>
          <Text style={styles.cardSub}>O'zlashtirish va xatolar ustida ishlash</Text>
        </View>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  heroCard: {
    backgroundColor: '#151c2c',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#26334d',
    marginBottom: 24,
  },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#ffffff', marginBottom: 8 },
  heroSub: { fontSize: 13, color: '#94a3b8', lineHeight: 18, marginBottom: 16 },
  heroButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  heroButtonText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 12 },
  card: {
    backgroundColor: '#151c2c',
    borderColor: '#26334d',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIcon: { fontSize: 28, marginRight: 14 },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#f8fafc', marginBottom: 2 },
  cardSub: { fontSize: 12, color: '#94a3b8' },
});
