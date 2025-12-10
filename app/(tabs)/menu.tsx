import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DailyMenu } from '@/components/daily-menu';

export default function MenuScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Menüplan</ThemedText>
        <ThemedText>HTW Berlin Mensa</ThemedText>
      </ThemedView>

      <ThemedView style={styles.content}>
        <DailyMenu date={new Date()} />
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 0,
    gap: 8,
  },
  content: {
    flex: 1,
    // The DailyMenu component has its own padding
  },
});
