import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { PracticeScreen } from './src/screens/PracticeScreen';
import { ExamScreen } from './src/screens/ExamScreen';
import { StatsScreen } from './src/screens/StatsScreen';

export default function App() {
  const [currentTab, setCurrentTab] = useState('Home');

  const renderScreen = () => {
    switch (currentTab) {
      case 'Home':
        return <HomeScreen navigation={{ navigate: (screen) => setCurrentTab(screen) }} />;
      case 'Practice':
        return <PracticeScreen />;
      case 'Exam':
        return <ExamScreen />;
      case 'Stats':
        return <StatsScreen />;
      default:
        return <HomeScreen navigation={{ navigate: (screen) => setCurrentTab(screen) }} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0b0f19" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AVTO QOIDALAR</Text>
        <Text style={styles.headerTag}>Expo Mobile</Text>
      </View>

      {/* Screen Body */}
      <View style={styles.body}>{renderScreen()}</View>

      {/* Bottom Navigation */}
      <View style={styles.navBar}>
        {[
          { key: 'Home', label: 'Bosh sahifa', icon: '🏠' },
          { key: 'Practice', label: 'Mashqlar', icon: '🚦' },
          { key: 'Exam', label: 'Imtihon', icon: '📝' },
          { key: 'Stats', label: 'Statistika', icon: '📊' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.navItem}
            onPress={() => setCurrentTab(item.key)}
          >
            <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            <Text style={[styles.navText, currentTab === item.key && styles.activeNavText]}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#26334d',
    backgroundColor: '#151c2c',
  },
  headerTitle: { color: '#f8fafc', fontWeight: '700', fontSize: 16 },
  headerTag: { color: '#3b82f6', fontSize: 11, fontWeight: '600', backgroundColor: 'rgba(59, 130, 246, 0.15)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  body: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#151c2c',
    borderTopWidth: 1,
    borderTopColor: '#26334d',
  },
  navItem: { alignItems: 'center' },
  navText: { color: '#94a3b8', fontSize: 11, marginTop: 2, fontWeight: '500' },
  activeNavText: { color: '#3b82f6', fontWeight: '700' },
});
