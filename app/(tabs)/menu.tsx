import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DailyMenu } from '@/components/daily-menu';
import { useEffect, useMemo, useState } from 'react';
import { HTWColors } from '@/constants/theme';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LOCATIONS, LOCATION_STORAGE_KEY } from '@/constants/locations';

export default function MenuScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('htw');

  const selectedLocation = useMemo(
    () => LOCATIONS.find((l) => l.id === selectedLocationId) || LOCATIONS[0],
    [selectedLocationId]
  );

  useEffect(() => {
    AsyncStorage.getItem(LOCATION_STORAGE_KEY).then((v) => {
      if (v) setSelectedLocationId(v);
    });
  }, []);

  const setLocation = async (id: string) => {
    setSelectedLocationId(id);
    setLocationOpen(false);
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, id);
  };

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
        <TouchableOpacity
          style={styles.locationBtn}
          onPress={() => setLocationOpen(!locationOpen)}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.locationText} numberOfLines={1}>
            {selectedLocation.name}
          </ThemedText>
          <ThemedText style={styles.locationChevron}>›</ThemedText>
        </TouchableOpacity>

        {locationOpen && (
          <View style={styles.dropdown}>
            <ScrollView style={{ maxHeight: 320 }}>
              {LOCATIONS.map((loc) => (
                <TouchableOpacity
                  key={loc.id}
                  style={styles.dropdownItem}
                  onPress={() => setLocation(loc.id)}
                >
                  <ThemedText>{loc.name}</ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
        
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
        <DailyMenu date={selectedDate} locationId={selectedLocationId} locationName={selectedLocation.name} />
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
  locationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HTWColors.border,
    backgroundColor: HTWColors.backgroundCard,
  },
  locationText: {
    flex: 1,
  },
  locationChevron: {
    color: HTWColors.textLight,
    fontSize: 18,
    marginLeft: 8,
  },
  dropdown: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: HTWColors.border,
    backgroundColor: HTWColors.backgroundCard,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: HTWColors.border,
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
