import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AIAssistantScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">KI-Assistent</ThemedText>
        <ThemedText>Ernährungsberatung & Empfehlungen</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        <ThemedText type="subtitle">Wie kann ich helfen?</ThemedText>
        {/* TODO: Implement AI chat interface */}
        <ThemedText>
          Fragen Sie nach Empfehlungen, Nährwertinformationen oder Allergenen.
        </ThemedText>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    gap: 8,
  },
  content: {
    padding: 20,
    gap: 12,
  },
});
