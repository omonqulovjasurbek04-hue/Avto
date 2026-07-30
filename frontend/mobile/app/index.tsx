import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { questions: number };
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      setError("Kategoriyalarni yuklab bo'lmadi. Backend ishga tushganini tekshiring.");
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (categoryId: string) => {
    try {
      setStarting(true);
      setError(null);
      const res = await api.post('/tests/start', { categoryId });
      router.push({
        pathname: '/test/[sessionId]',
        params: {
          sessionId: res.data.sessionId,
          question: JSON.stringify(res.data.question),
          total: String(res.data.total),
        },
      });
    } catch (err) {
      setError("Testni boshlab bo'lmadi.");
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
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Test Kategoriyasini Tanlang</Text>
          <Text style={styles.subtitle}>Salom, {user?.name}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Chiqish</Text>
        </TouchableOpacity>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleStartTest(item.id)} disabled={starting}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.badge}>{item._count?.questions ?? 0} ta savol</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
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
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
  },
  logoutText: {
    color: '#fca5a5',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
    marginBottom: 12,
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
