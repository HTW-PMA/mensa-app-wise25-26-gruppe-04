import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function SettingsScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Einstellungen</ThemedText>
        <ThemedText>Präferenzen & Allergien</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Ernährungspräferenzen</ThemedText>
        {/* TODO: Implement dietary preferences */}
        <ThemedText>Vegetarisch, Vegan, Glutenfrei, etc.</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">Allergene</ThemedText>
        {/* TODO: Implement allergen selection */}
        <ThemedText>Wählen Sie Ihre Allergene aus</ThemedText>
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
  section: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
});
