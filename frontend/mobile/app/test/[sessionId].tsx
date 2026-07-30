import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import api from '../../services/api';
import { SceneView, SceneData, SceneActor, SceneOutcome } from '../../components/SceneView';

interface Answer {
  id: string;
  text: string;
}

interface QuestionData {
  id: string;
  text: string;
  answers: Answer[];
  scene: SceneData | null;
  actors: SceneActor[] | null;
}

interface AnswerResponse {
  isCorrect: boolean;
  scene: SceneOutcome | null;
  nextQuestion: QuestionData | null;
}

export default function TestSessionScreen() {
  const { sessionId, question, total } = useLocalSearchParams<{ sessionId: string; question: string; total: string }>();
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState<QuestionData>(() => JSON.parse(question));
  const [answeredCount, setAnsweredCount] = useState(0);
  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [answerResult, setAnswerResult] = useState<AnswerResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [phase, setPhase] = useState<'running' | 'result'>('running');
  const [finishResult, setFinishResult] = useState<{ score: number; total: number; percentage: number } | null>(null);
  const [finishing, setFinishing] = useState(false);

  const totalCount = Number(total) || 0;

  const handleSelectAnswer = async (answerId: string) => {
    if (selectedAnswerId || submitting) return;
    setSelectedAnswerId(answerId);
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.post(`/tests/${sessionId}/answer`, {
        questionId: currentQuestion.id,
        answerId,
      });
      setAnswerResult(res.data);
      setAnsweredCount((c) => c + 1);
    } catch (err) {
      setError("Javobni yuborib bo'lmadi.");
      setSelectedAnswerId(null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    setError(null);
    try {
      const res = await api.post(`/tests/${sessionId}/finish`);
      setFinishResult(res.data);
    } catch (err) {
      setError("Testni yakunlab bo'lmadi.");
    } finally {
      setFinishing(false);
      setPhase('result');
    }
  };

  const handleContinue = () => {
    if (answerResult?.nextQuestion) {
      setCurrentQuestion(answerResult.nextQuestion);
      setAnswerResult(null);
      setSelectedAnswerId(null);
    } else {
      handleFinish();
    }
  };

  if (phase === 'result') {
    const passed = (finishResult?.percentage ?? 0) >= 80;
    return (
      <View style={styles.resultContainer}>
        <Text style={styles.resultEmoji}>{passed ? '🏆' : '⚠️'}</Text>
        <Text style={styles.resultTitle}>{passed ? "Muvaffaqiyatli!" : "Qoniqarsiz natija"}</Text>
        <Text style={styles.resultScore}>{finishResult?.percentage ?? 0}%</Text>
        <Text style={styles.resultDetail}>
          {finishResult?.score ?? 0} / {finishResult?.total ?? 0} to'g'ri javob
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={() => router.replace('/')}>
          <Text style={styles.primaryButtonText}>Bosh sahifaga qaytish</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isAnswered = !!answerResult;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.progress}>
        Savol {answeredCount + 1} / {totalCount}
      </Text>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <SceneView scene={currentQuestion.scene} actors={currentQuestion.actors} outcome={answerResult?.scene ?? null} />

      <View style={styles.card}>
        <Text style={styles.qText}>{currentQuestion.text}</Text>

        <View style={styles.answersList}>
          {currentQuestion.answers.map((ans) => {
            const selected = selectedAnswerId === ans.id;
            const extraStyle = isAnswered && selected
              ? (answerResult!.isCorrect ? styles.ansCorrect : styles.ansWrong)
              : isAnswered
                ? styles.ansDisabled
                : null;
            return (
              <TouchableOpacity
                key={ans.id}
                style={[styles.ansButton, extraStyle]}
                onPress={() => handleSelectAnswer(ans.id)}
                disabled={isAnswered || submitting}
              >
                <Text style={styles.ansText}>{ans.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {isAnswered && (
          <View style={[styles.resultBanner, answerResult!.isCorrect ? styles.resultBannerSafe : styles.resultBannerFail]}>
            <Text style={styles.resultBannerTitle}>{answerResult!.isCorrect ? "To'g'ri javob!" : 'Xato javob!'}</Text>
            {answerResult!.scene?.ruleText && (
              <Text style={styles.resultBannerText}>
                {answerResult!.scene.ruleCode ? `YHQ ${answerResult!.scene.ruleCode}: ` : ''}
                {answerResult!.scene.ruleText}
              </Text>
            )}
          </View>
        )}

        {isAnswered && (
          <TouchableOpacity style={styles.primaryButton} onPress={handleContinue} disabled={finishing}>
            {finishing ? (
              <ActivityIndicator color="#002e6a" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {answerResult?.nextQuestion ? 'Keyingi savol' : 'Testni yakunlash'}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#081425',
  },
  content: {
    padding: 16,
    gap: 16,
  },
  progress: {
    color: '#4cd7f6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#fca5a5',
    fontSize: 12,
  },
  card: {
    backgroundColor: '#111c2d',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    gap: 14,
  },
  qText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    lineHeight: 22,
  },
  answersList: {
    gap: 10,
  },
  ansButton: {
    backgroundColor: '#182436',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ansCorrect: {
    backgroundColor: 'rgba(16,185,129,0.2)',
    borderColor: '#10b981',
  },
  ansWrong: {
    backgroundColor: 'rgba(239,68,68,0.2)',
    borderColor: '#ef4444',
  },
  ansDisabled: {
    opacity: 0.5,
  },
  ansText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  resultBanner: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  resultBannerSafe: {
    backgroundColor: 'rgba(6,78,59,0.4)',
    borderColor: 'rgba(16,185,129,0.4)',
  },
  resultBannerFail: {
    backgroundColor: 'rgba(69,10,10,0.4)',
    borderColor: 'rgba(239,68,68,0.4)',
  },
  resultBannerTitle: {
    color: '#e2e8f0',
    fontWeight: 'bold',
    fontSize: 13,
  },
  resultBannerText: {
    color: '#cbd5e1',
    fontSize: 12,
    lineHeight: 17,
  },
  primaryButton: {
    backgroundColor: '#4cd7f6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#002e6a',
    fontWeight: 'bold',
    fontSize: 14,
  },
  resultContainer: {
    flex: 1,
    backgroundColor: '#081425',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 10,
  },
  resultEmoji: {
    fontSize: 56,
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  resultScore: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#4cd7f6',
  },
  resultDetail: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 20,
  },
});
