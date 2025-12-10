import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function FavoritesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 10,
    gap: 8,
  },
  content: {
    padding: 20,
    gap: 12,
  },
});
