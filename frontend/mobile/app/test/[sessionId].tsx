import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import api from '../../services/api';

export default function TestSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const router = useRouter();

  const [currentQuestion, setCurrentQuestion] = useState<any>({
    id: 'q-1',
    text: "Svetoforning qizil chirog'ida harakatlanish taqiqlanadimi?",
    answers: [
      { id: 'a-1', text: "Ha, qat'iyan taqiqlanadi" },
      { id: 'a-2', text: 'Yo\'q, ruxsat beriladi' },
      { id: 'a-3', text: 'Faqat o\'ngga burilishda ruxsat beriladi' },
    ],
  });

  const [selectedAnswerId, setSelectedAnswerId] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<{
    playbackUrl: string;
    type: 'CORRECT' | 'WRONG';
    durationSec: number;
    isCorrect: boolean;
  } | null>(null);

  const [loadingAnswer, setLoadingAnswer] = useState(false);

  // Initialize expo-video player
  const player = useVideoPlayer(videoResult?.playbackUrl || '', (p) => {
    p.loop = videoResult?.type === 'CORRECT';
    p.play();
  });

  const handleSelectAnswer = async (answerId: string) => {
    if (selectedAnswerId || loadingAnswer) return;
    setSelectedAnswerId(answerId);
    setLoadingAnswer(true);

    try {
      const res = await api.post(`/tests/${sessionId}/answer`, {
        questionId: currentQuestion.id,
        answerId,
      });

      const { isCorrect, video, nextQuestion } = res.data;
      if (video) {
        setVideoResult({
          playbackUrl: video.playbackUrl,
          type: video.type,
          durationSec: video.durationSec || 10,
          isCorrect,
        });
      } else {
        // Fallback video result demo
        setVideoResult({
          playbackUrl: '',
          type: answerId === 'a-1' ? 'CORRECT' : 'WRONG',
          durationSec: 10,
          isCorrect: answerId === 'a-1',
        });
      }
    } catch (err) {
      console.log('Error submitting answer:', err);
      setVideoResult({
        playbackUrl: '',
        type: answerId === 'a-1' ? 'CORRECT' : 'WRONG',
        durationSec: 10,
        isCorrect: answerId === 'a-1',
      });
    } finally {
      setLoadingAnswer(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* VIDEO CONTAINER */}
      <View style={styles.videoContainer}>
        {videoResult?.playbackUrl ? (
          <VideoView player={player} style={styles.video} nativeControls={false} />
        ) : (
          <View style={[styles.placeholderVideo, videoResult && (videoResult.isCorrect ? styles.bgCorrect : styles.bgWrong)]}>
            <Text style={styles.videoBadge}>
              {videoResult ? (videoResult.isCorrect ? "✅ TO'G'RI (LOOP)" : "❌ XATO (AVARIYA MIN 10S)") : "🎬 VIDEO SIMULATSIYA"}
            </Text>
            <Text style={styles.videoSubtext}>
              {videoResult ? (videoResult.isCorrect ? "Mashina xavfsiz harakatlanmoqda" : "Kamida 10s avariya ko'rsatiladi") : "Javob tanlangach Cloudflare Stream videosi pleyerda ijro etiladi"}
            </Text>
          </View>
        )}
      </View>

      {/* QUESTION CARD */}
      <View style={styles.card}>
        <Text style={styles.qText}>{currentQuestion.text}</Text>

        <View style={styles.answersList}>
          {currentQuestion.answers.map((ans: any) => {
            const isSelected = selectedAnswerId === ans.id;
            return (
              <TouchableOpacity
                key={ans.id}
                style={[
                  styles.ansButton,
                  isSelected && (videoResult?.isCorrect ? styles.ansCorrect : styles.ansWrong),
                ]}
                onPress={() => handleSelectAnswer(ans.id)}
                disabled={!!selectedAnswerId}
              >
                <Text style={styles.ansText}>{ans.text}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
  videoContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#030712',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  placeholderVideo: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  bgCorrect: {
    backgroundColor: 'rgba(16,185,129,0.15)',
  },
  bgWrong: {
    backgroundColor: 'rgba(239,68,68,0.15)',
  },
  videoBadge: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  videoSubtext: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#111c2d',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  qText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
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
  ansText: {
    color: '#e2e8f0',
    fontSize: 14,
  },
});
