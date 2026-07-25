import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Video, ResizeMode } from 'expo-av';

export default function VideoPlayer({ url, type, onEnded }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.setPositionAsync(0);
      if (type === 'correct') {
        videoRef.current.setIsLoopingAsync(true);
      } else {
        videoRef.current.setIsLoopingAsync(false);
      }
    }
  }, [url, type]);

  if (!url) return null;

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: url.startsWith('http') ? url : `http://10.0.2.2:4000${url}` }}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        useNativeControls
        isLooping={type === 'correct'}
        onPlaybackStatusUpdate={(status) => {
          if (type === 'wrong' && status.didJustFinish && onEnded) onEnded();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#000' },
  video: { width: '100%', height: 220 },
});
