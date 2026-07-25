import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import HomeScreen from './src/screens/HomeScreen';
import PracticeScreen from './src/screens/PracticeScreen';
import ExamScreen from './src/screens/ExamScreen';
import ResultScreen from './src/screens/ResultScreen';

const screens = ['Home', 'Practice', 'Exam', 'Result'];

export default function App() {
  const [currentScreen, setCurrentScreen] = useState('Home');
  const [screenParams, setScreenParams] = useState({});

  const navigate = (screen, params = {}) => {
    setCurrentScreen(screen);
    setScreenParams(params);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Home': return <HomeScreen navigation={{ navigate }} />;
      case 'Practice': return <PracticeScreen />;
      case 'Exam': return <ExamScreen route={{ params: screenParams }} navigation={{ navigate }} />;
      case 'Result': return <ResultScreen route={{ params: screenParams }} navigation={{ navigate }} />;
      default: return <HomeScreen navigation={{ navigate }} />;
    }
  };

  const tabs = [
    { key: 'Home', label: 'Bosh sahifa', icon: '\u{1F3E0}' },
    { key: 'Practice', label: 'Mashqlar', icon: '\u{1F6A6}' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>AVTO QOIDALAR</Text>
        {screens.includes(currentScreen) && false}
      </View>

      <View style={styles.body}>{renderScreen()}</View>

      <View style={styles.navBar}>
        {tabs.map((item) => (
          <TouchableOpacity key={item.key} style={styles.navItem} onPress={() => navigate(item.key)}>
            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            <Text style={[styles.navText, currentScreen === item.key && styles.activeNavText]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#26334d', backgroundColor: '#151c2c',
  },
  headerTitle: { color: '#f8fafc', fontWeight: '700', fontSize: 16 },
  body: { flex: 1 },
  navBar: {
    flexDirection: 'row', justifyContent: 'space-around',
    paddingVertical: 8, backgroundColor: '#151c2c',
    borderTopWidth: 1, borderTopColor: '#26334d',
  },
  navItem: { alignItems: 'center' },
  navText: { color: '#94a3b8', fontSize: 11, marginTop: 2, fontWeight: '500' },
  activeNavText: { color: '#3b82f6', fontWeight: '700' },
});
