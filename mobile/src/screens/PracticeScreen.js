import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { api } from '../api';
import AnswerButton from '../components/AnswerButton';

export default function PracticeScreen() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => { api.listCategories().then(setCategories).catch(() => {}); }, []);

  useEffect(() => {
    if (!selectedCat) return;
    api.getCategoryQuestions(selectedCat.id).then(setQuestions).catch(() => {});
    setCurrentIdx(0); setSelectedId(null); setAnswered(false); setResult(null);
  }, [selectedCat]);

  const q = questions[currentIdx];

  const handleAnswer = async (answerId) => {
    if (answered || !q) return;
    setSelectedId(answerId);
    setAnswered(true);
    try {
      const res = await api.checkAnswer?.(q.id, answerId) || { isCorrect: false };
      setResult({ isCorrect: res.isCorrect });
    } catch {
      setResult({ isCorrect: false });
    }
  };

  if (!selectedCat) {
    return (
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Kategoriyani tanlang</Text>
        {categories.map((c) => (
          <TouchableOpacity key={c.id} style={styles.card} onPress={() => setSelectedCat(c)}>
            <Text style={styles.cardTitle}>{c.name?.uz || c.slug}</Text>
            <Text style={styles.cardSub}>{c._count?.questions || 0} ta savol</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  const answerStatus = (aId) => {
    if (!answered) return selectedId === aId ? 'selected' : 'default';
    if (selectedId === aId) return result?.isCorrect ? 'correct' : 'wrong';
    return 'default';
  };

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => { setSelectedCat(null); setQuestions([]); }}>
        <Text style={styles.back}>{'\u2190'} Orqaga</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{selectedCat.name?.uz} ({currentIdx + 1}/{questions.length})</Text>

      {q ? (
        <>
          <View style={styles.questionCard}>
            <Text style={styles.questionText}>
              {typeof q.text === 'object' ? (q.text.uz || q.text.en) : q.text}
            </Text>
            {q.answers.map((a) => {
              const label = typeof a.text === 'object' ? (a.text.uz || a.text.en) : a.text;
              return (
                <AnswerButton
                  key={a.id}
                  label={label}
                  status={answerStatus(a.id)}
                  disabled={answered}
                  onPress={() => handleAnswer(a.id)}
                />
              );
            })}
          </View>

          {answered && (
            <View style={[styles.feedbackCard, result?.isCorrect ? styles.correct : styles.wrong]}>
              <Text style={styles.feedbackText}>{result?.isCorrect ? "To'g'ri!" : 'Xato javob'}</Text>
            </View>
          )}

          {answered && currentIdx < questions.length - 1 && (
            <TouchableOpacity style={styles.nextBtn} onPress={() => {
              setCurrentIdx(currentIdx + 1);
              setSelectedId(null);
              setAnswered(false);
              setResult(null);
            }}>
              <Text style={styles.nextBtnText}>Keyingisi {'\u2192'}</Text>
            </TouchableOpacity>
          )}
        </>
      ) : (
        <Text style={{ color: '#94a3b8', textAlign: 'center', marginTop: 20 }}>Savollar topilmadi.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  title: { fontSize: 18, fontWeight: '700', color: '#f8fafc', marginBottom: 16 },
  back: { color: '#3b82f6', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  card: { backgroundColor: '#151c2c', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#26334d', marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#f8fafc' },
  cardSub: { fontSize: 12, color: '#94a3b8', marginTop: 2 },
  questionCard: { backgroundColor: '#151c2c', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#26334d' },
  questionText: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 16, lineHeight: 22 },
  feedbackCard: { borderRadius: 12, padding: 14, marginTop: 12 },
  correct: { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  wrong: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  feedbackText: { fontSize: 16, fontWeight: '700', color: '#f8fafc' },
  nextBtn: { backgroundColor: '#3b82f6', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
