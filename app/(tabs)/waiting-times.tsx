import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function WaitingTimesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  // Mock data - später durch echte API-Daten ersetzen
  const waitingTimes = [
    { time: '11:00 - 12:00', status: 'low', minutes: '< 5 Min' },
    { time: '12:00 - 13:00', status: 'high', minutes: '15-20 Min' },
    { time: '13:00 - 14:00', status: 'medium', minutes: '10-15 Min' },
    { time: '14:00 - 14:30', status: 'low', minutes: '< 5 Min' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return theme.success;
      case 'medium':
        return theme.warning;
      case 'high':
        return theme.error;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]} edges={['top']}>
      <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Wartezeiten</ThemedText>
        <ThemedText>Aktuelle Auslastung der Mensa</ThemedText>
      </ThemedView>

      <View style={[styles.currentStatus, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="subtitle">Jetzt</ThemedText>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: theme.success }]} />
          <ThemedText style={styles.statusText}>Geringe Auslastung</ThemedText>
        </View>
        <ThemedText style={[styles.waitTime, { color: theme.primary }]}>Wartezeit: ca. 5 Minuten</ThemedText>
      </View>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Heute
        </ThemedText>

        {waitingTimes.map((item, index) => (
          <View key={index} style={[styles.timeSlot, { borderBottomColor: theme.borderLight }]}>
            <View style={styles.timeInfo}>
              <ThemedText style={styles.timeText}>{item.time}</ThemedText>
              <ThemedText style={[styles.minutesText, { color: theme.textSecondary }]}>{item.minutes}</ThemedText>
            </View>
            <View
              style={[
                styles.statusBar,
                { backgroundColor: getStatusColor(item.status) },
              ]}
            />
          </View>
        ))}
      </ThemedView>

      <View style={[styles.tips, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText type="subtitle">💡 Tipps</ThemedText>
        <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
          • Beste Zeit: 11:00-11:30 Uhr oder nach 13:30 Uhr
        </ThemedText>
        <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
          • Stoßzeit: 12:00-13:00 Uhr (Hauptvorlesungsende)
        </ThemedText>
        <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
          • Vorbestellung über die App spart Zeit
        </ThemedText>
      </View>
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
  currentStatus: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
  },
  waitTime: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '600',
  },
  minutesText: {
    fontSize: 14,
    marginTop: 4,
  },
  statusBar: {
    width: 60,
    height: 8,
    borderRadius: 4,
  },
  tips: {
    padding: 20,
    margin: 16,
    borderRadius: 12,
    gap: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
