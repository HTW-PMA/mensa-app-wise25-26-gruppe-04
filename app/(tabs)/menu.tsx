import { StyleSheet, ScrollView } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DailyMenu } from '@/components/daily-menu';

export default function MenuScreen() {
  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Menüplan</ThemedText>
        <ThemedText>HTW Berlin Mensa</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <DailyMenu date={new Date()} />
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 0,
    gap: 8,
  },
  content: {
    flex: 1,
    // The DailyMenu component has its own padding
  },
});
