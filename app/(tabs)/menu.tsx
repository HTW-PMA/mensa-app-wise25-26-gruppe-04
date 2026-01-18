import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DailyMenu } from '@/components/daily-menu';
import { useState } from 'react';
import { HTWColors } from '@/constants/theme';

export default function MenuScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Menüplan</ThemedText>
        <ThemedText>HTW Berlin Mensa</ThemedText>
        
        {/* Datum-Navigation */}
        <View style={styles.dateNavigation}>
          <TouchableOpacity style={styles.navButton} onPress={goToPreviousDay}>
            <ThemedText style={styles.navButtonText}>◀ Zurück</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.todayButton} onPress={goToToday}>
            <ThemedText style={styles.todayButtonText}>Heute</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navButton} onPress={goToNextDay}>
            <ThemedText style={styles.navButtonText}>Weiter ▶</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ThemedView style={styles.content}>
        <DailyMenu date={selectedDate} />
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
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: HTWColors.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    color: HTWColors.textInverse,
    fontWeight: '600',
    fontSize: 14,
  },
  todayButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: HTWColors.backgroundGray,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: HTWColors.primary,
  },
  todayButtonText: {
    color: HTWColors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
