import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';

const variants = {
  default: { bg: '#1e293b', border: '#26334d', text: '#f8fafc' },
  selected: { bg: 'rgba(59,130,246,0.2)', border: '#3b82f6', text: '#f8fafc' },
  correct: { bg: 'rgba(16,185,129,0.15)', border: '#10b981', text: '#a7f3d0' },
  wrong: { bg: 'rgba(239,68,68,0.15)', border: '#ef4444', text: '#fecaca' },
};

export default function AnswerButton({ label, status, disabled, onPress }) {
  const v = variants[status] || variants.default;
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: v.bg, borderColor: v.border }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: v.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  text: { fontSize: 14, fontWeight: '600' },
});
