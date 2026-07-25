import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { api } from '../api';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.listCategories().then(setCategories).catch(() => {});
  }, []);

  const startExam = async (cat) => {
    try {
      const session = await api.startTest(cat.id);
      navigation.navigate('Exam', { sessionId: session.id, categoryId: session.categoryId });
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Yo'l Harakati Qoidalari</Text>
        <Text style={styles.heroSub}>Video savollar bilan YHQ ni o'rganing</Text>
        <TouchableOpacity style={styles.heroBtn} onPress={() => navigation.navigate('Practice')}>
          <Text style={styles.heroBtnText}>Mashq qilish</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Imtihon kategoriyalari</Text>
      {categories.map((cat) => (
        <TouchableOpacity key={cat.id} style={styles.card} onPress={() => startExam(cat)}>
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{cat.name?.uz || cat.slug}</Text>
            <Text style={styles.cardSub}>{cat._count?.questions || 0} ta savol</Text>
          </View>
          <Text style={styles.arrow}>{'\u203A'}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  hero: { backgroundColor: '#151c2c', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#26334d', marginBottom: 24, alignItems: 'center' },
  heroTitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6 },
  heroSub: { fontSize: 13, color: '#94a3b8', marginBottom: 16 },
  heroBtn: { backgroundColor: '#3b82f6', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10 },
  heroBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 12 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#151c2c', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#26334d', marginBottom: 10 },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#f8fafc' },
  cardSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  arrow: { fontSize: 22, color: '#64748b', marginLeft: 8 },
});
