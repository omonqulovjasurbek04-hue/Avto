import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.log('Failed to fetch categories', err);
      // Fallback mock category for testing
      setCategories([
        { id: 'cat-1', name: "Yo'l belgilari va chiziqlari", slug: 'yol-belgilari' },
        { id: 'cat-2', name: 'Chorrahalarni kesib o\'tish', slug: 'chorrahalar' },
        { id: 'cat-3', name: 'Harakat tezligi va masofa', slug: 'tezlik-va-masofa' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (categoryId: string) => {
    try {
      setStarting(true);
      const res = await api.post('/tests/start', { categoryId });
      router.push(`/test/${res.data.sessionId}`);
    } catch (err) {
      console.log('Error starting test:', err);
      // Demo navigation
      router.push(`/test/demo-session-id`);
    } finally {
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4cd7f6" />
        <Text style={styles.loadingText}>Bo'limlar yuklanmoqda...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Kategoriyasini Tanlang</Text>
      <Text style={styles.subtitle}>Har bir javob uchun Cloudflare HD video simulyatsiyasi</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleStartTest(item.id)}
            disabled={starting}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.badge}>20 Savol</Text>
            </View>
            <Text style={styles.cardFooter}>Boshlash uchun bosing →</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#081425',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#081425',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#4cd7f6',
    marginBottom: 20,
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#111c2d',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    flex: 1,
  },
  badge: {
    backgroundColor: 'rgba(76,215,246,0.15)',
    color: '#4cd7f6',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontWeight: 'bold',
  },
  cardFooter: {
    fontSize: 12,
    color: '#adc6ff',
    fontWeight: 'bold',
  },
});
