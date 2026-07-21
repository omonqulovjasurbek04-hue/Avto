import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MobileScenarioPlayer } from '../components/MobileScenarioPlayer';

export function PracticeScreen() {
  const [scenarios, setScenarios] = useState([]);
  const [selectedId, setSelectedId] = useState('sc-0001');
  const [currentScenario, setCurrentScenario] = useState(null);

  useEffect(() => {
    fetch('http://10.0.2.2:4000/api/scenarios')
      .then((res) => res.json())
      .then((data) => setScenarios(data))
      .catch(() => {
        // Fallback demo dataset for offline mode
        setScenarios([{ id: 'sc-0001' }, { id: 'sc-0002' }, { id: 'sc-0003' }]);
      });
  }, []);

  useEffect(() => {
    fetch(`http://10.0.2.2:4000/api/scenarios/${selectedId}`)
      .then((res) => res.json())
      .then((data) => setCurrentScenario(data));
  }, [selectedId]);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectorBar}>
        {scenarios.map((sc) => (
          <TouchableOpacity
            key={sc.id}
            style={[styles.pill, selectedId === sc.id && styles.activePill]}
            onPress={() => setSelectedId(sc.id)}
          >
            <Text style={[styles.pillText, selectedId === sc.id && styles.activePillText]}>
              {sc.id.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {currentScenario && <MobileScenarioPlayer scenarioData={currentScenario} lang="uz" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f19' },
  selectorBar: { paddingHorizontal: 16, paddingVertical: 12, maxHeight: 60 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#26334d',
    backgroundColor: '#151c2c',
    marginRight: 8,
  },
  activePill: { borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.2)' },
  pillText: { color: '#f8fafc', fontWeight: '600', fontSize: 13 },
  activePillText: { color: '#3b82f6' },
});
