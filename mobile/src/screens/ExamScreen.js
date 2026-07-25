import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { api } from '../api';
import AnswerButton from '../components/AnswerButton';
import VideoPlayer from '../components/VideoPlayer';

export default function ExamScreen({ route, navigation }) {
  const { sessionId, categoryId } = route?.params || {};

  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!categoryId) { setLoading(false); return; }
    api.getCategoryQuestions(categoryId).then((qs) => {
      setQuestions(qs);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [categoryId]);

  const q = questions[currentIdx];

  const handleAnswer = async (answerId) => {
    if (answered || submitting) return;
    setSelectedId(answerId);
    setAnswered(true);
    setSubmitting(true);

    try {
      const result = await api.answerQuestion(sessionId, q.id, answerId);
      setFeedback(result);
      if (result.isCorrect) setScore((s) => s + 1);
      setTotal((t) => t + 1);
    } catch {
      const isCorrect = q.answers.find((a) => a.id === answerId)?.isCorrect || false;
      setFeedback({ isCorrect, videoUrl: null });
      if (isCorrect) setScore((s) => s + 1);
      setTotal((t) => t + 1);
    }
    setSubmitting(false);
  };

  const handleFinish = async () => {
    try { await api.finishTest(sessionId); } catch {}
    navigation.navigate('Result', { sessionId, score, total, passed: score >= Math.ceil(total * 0.9) });
  };

  if (loading) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: '#94a3b8' }}>Yuklanmoqda...</Text>
    </View>;
  }

  if (!q) {
    return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
      <Text style={{ color: '#94a3b8' }}>Savollar topilmadi yoki sessionId yo'q</Text>
    </View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.progress}>Savol {currentIdx + 1} / {questions.length}</Text>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>
          {typeof q.text === 'object' ? (q.text.uz || q.text.en) : q.text}
        </Text>

        {q.answers.map((a) => {
          const label = typeof a.text === 'object' ? (a.text.uz || a.text.en) : a.text;
          let status = 'default';
          if (answered && selectedId === a.id) status = feedback?.isCorrect ? 'correct' : 'wrong';
          else if (selectedId === a.id) status = 'selected';
          return (
            <AnswerButton key={a.id} label={label} status={status} disabled={answered} onPress={() => handleAnswer(a.id)} />
          );
        })}
      </View>

      {answered && (
        <View style={[styles.feedbackCard, feedback?.isCorrect ? styles.correct : styles.wrong]}>
          <Text style={styles.feedbackText}>{feedback?.isCorrect ? "To'g'ri!" : 'Xato!'}</Text>
          <VideoPlayer url={feedback?.videoUrl} type={feedback?.isCorrect ? 'correct' : 'wrong'} />
        </View>
      )}

      {answered && currentIdx < questions.length - 1 && (
        <TouchableOpacity style={styles.nextBtn} onPress={() => {
          setCurrentIdx(currentIdx + 1);
          setSelectedId(null); setAnswered(false); setFeedback(null);
        }}>
          <Text style={styles.nextBtnText}>Keyingisi {'\u2192'}</Text>
        </TouchableOpacity>
      )}

      {answered && currentIdx === questions.length - 1 && (
        <TouchableOpacity style={[styles.nextBtn, { backgroundColor: '#10b981' }]} onPress={handleFinish}>
          <Text style={styles.nextBtnText}>Yakunlash</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19', padding: 16 },
  progress: { fontSize: 14, fontWeight: '700', color: '#94a3b8', marginBottom: 12 },
  questionCard: { backgroundColor: '#151c2c', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#26334d' },
  questionText: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 16, lineHeight: 22 },
  feedbackCard: { borderRadius: 12, padding: 14, marginTop: 12 },
  correct: { backgroundColor: 'rgba(16,185,129,0.12)', borderWidth: 1, borderColor: 'rgba(16,185,129,0.3)' },
  wrong: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)' },
  feedbackText: { fontSize: 16, fontWeight: '700', color: '#f8fafc', marginBottom: 8 },
  nextBtn: { backgroundColor: '#3b82f6', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 16 },
  nextBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
