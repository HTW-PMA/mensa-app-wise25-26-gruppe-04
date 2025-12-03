import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function FavoritesScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Favoriten</ThemedText>
        <ThemedText>Ihre gespeicherten Gerichte</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        {/* TODO: Implement favorites list */}
        <ThemedText>Noch keine Favoriten gespeichert</ThemedText>
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
