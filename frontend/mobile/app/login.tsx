import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const { login, register } = useAuthStore();

  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!identifier || !password || (isRegister && !name)) return;
    setSubmitting(true);
    setError(null);
    try {
      if (isRegister) {
        await register(name, identifier, password);
      } else {
        await login(identifier, password);
      }
      router.replace('/');
    } catch (err: any) {
      setError(err?.response?.data?.error || "Xatolik yuz berdi");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.content}>
        <Text style={styles.title}>AVTO</Text>
        <Text style={styles.subtitle}>{isRegister ? "Ro'yxatdan o'tish" : 'Tizimga kirish'}</Text>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {isRegister && (
          <TextInput
            style={styles.input}
            placeholder="Ismingiz"
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
          />
        )}
        <TextInput
          style={styles.input}
          placeholder="Email yoki telefon raqami"
          placeholderTextColor="#64748b"
          autoCapitalize="none"
          value={identifier}
          onChangeText={setIdentifier}
        />
        <TextInput
          style={styles.input}
          placeholder="Parol"
          placeholderTextColor="#64748b"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#001a42" />
          ) : (
            <Text style={styles.submitText}>{isRegister ? "Ro'yxatdan o'tish" : 'Kirish'}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsRegister((v) => !v)}>
          <Text style={styles.switchText}>
            {isRegister ? "Hisobingiz bormi? Kirish" : "Hisobingiz yo'qmi? Ro'yxatdan o'ting"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#081425',
    justifyContent: 'center',
  },
  content: {
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#adc6ff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    borderColor: 'rgba(239,68,68,0.4)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  submitButton: {
    backgroundColor: '#4cd7f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: '#001a42',
    fontWeight: 'bold',
    fontSize: 15,
  },
  switchText: {
    color: '#4cd7f6',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 8,
  },
});
