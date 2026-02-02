import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DailyMenu } from '@/components/daily-menu';
import { useEffect, useMemo, useState } from 'react';
import { HTWColors } from '@/constants/theme';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UNIVERSITIES } from '@/constants/universities';
import type { University, Canteen } from '@/constants/universities';

const UNIVERSITY_STORAGE_KEY = 'selected_university';
const CANTEEN_STORAGE_KEY = 'selected_canteen';

export default function MenuScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [universityOpen, setUniversityOpen] = useState(false);
  const [canteenOpen, setCanteenOpen] = useState(false);
  
  const [selectedUniversityId, setSelectedUniversityId] = useState('htw');
  const [selectedCanteenId, setSelectedCanteenId] = useState<string | null>(null);

  const selectedUniversity = useMemo(
    () => UNIVERSITIES.find((u) => u.id === selectedUniversityId) || UNIVERSITIES[0],
    [selectedUniversityId]
  );

  const availableCanteens = useMemo(
    () => selectedUniversity.canteens || [],
    [selectedUniversity]
  );

  const selectedCanteen = useMemo(() => {
    if (selectedCanteenId) {
      return availableCanteens.find((c) => c.id === selectedCanteenId) || availableCanteens[0];
    }
    return availableCanteens[0];
  }, [selectedCanteenId, availableCanteens]);

  // Lade gespeicherte Auswahl beim Start
  useEffect(() => {
    const loadSelection = async () => {
      try {
        const [savedUni, savedCanteen] = await Promise.all([
          AsyncStorage.getItem(UNIVERSITY_STORAGE_KEY),
          AsyncStorage.getItem(CANTEEN_STORAGE_KEY),
        ]);
        
        if (savedUni) {
          setSelectedUniversityId(savedUni);
        }
        if (savedCanteen) {
          setSelectedCanteenId(savedCanteen);
        }
      } catch (error) {
        console.error('Fehler beim Laden der Auswahl:', error);
      }
    };
    loadSelection();
  }, []);

  // Wenn Uni gewechselt wird, setze die erste Mensa als Standard
  useEffect(() => {
    if (availableCanteens.length > 0) {
      // Prüfe ob die aktuell ausgewählte Mensa zur neuen Uni gehört
      const canteenExists = availableCanteens.some((c) => c.id === selectedCanteenId);
      if (!canteenExists) {
        // Wähle die erste Mensa mit Menü, falls vorhanden
        const firstWithMenu = availableCanteens.find((c) => c.hasMenu);
        setSelectedCanteenId(firstWithMenu?.id || availableCanteens[0]?.id || null);
      }
    }
  }, [selectedUniversityId, availableCanteens]);

  const setUniversity = async (id: string) => {
    setSelectedUniversityId(id);
    setUniversityOpen(false);
    await AsyncStorage.setItem(UNIVERSITY_STORAGE_KEY, id);
  };

  const setCanteen = async (id: string) => {
    setSelectedCanteenId(id);
    setCanteenOpen(false);
    await AsyncStorage.setItem(CANTEEN_STORAGE_KEY, id);
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
          
          {/* Universität Dropdown */}
          <TouchableOpacity
            style={styles.locationBtn}
            onPress={() => {
              setUniversityOpen(!universityOpen);
              setCanteenOpen(false);
            }}
            activeOpacity={0.8}
          >
            <ThemedText style={styles.locationText} numberOfLines={1}>
              {selectedUniversity.name}
            </ThemedText>
            <ThemedText style={styles.locationChevron}>›</ThemedText>
          </TouchableOpacity>

          {universityOpen && (
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 320 }}>
                {UNIVERSITIES.map((uni) => (
                  <TouchableOpacity
                    key={uni.id}
                    style={[
                      styles.dropdownItem,
                      uni.id === selectedUniversityId && styles.dropdownItemSelected,
                    ]}
                    onPress={() => setUniversity(uni.id)}
                  >
                    <ThemedText
                      style={uni.id === selectedUniversityId && styles.selectedText}
                    >
                      {uni.name}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Campus/Mensa Dropdown - nur anzeigen wenn mehrere Mensen vorhanden */}
          {availableCanteens.length > 1 && (
            <>
              <TouchableOpacity
                style={[styles.locationBtn, styles.canteenBtn]}
                onPress={() => {
                  setCanteenOpen(!canteenOpen);
                  setUniversityOpen(false);
                }}
                activeOpacity={0.8}
              >
                <View style={styles.canteenBtnContent}>
                  <ThemedText style={styles.canteenLabel}>Campus:</ThemedText>
                  <ThemedText style={styles.locationText} numberOfLines={1}>
                    {selectedCanteen?.name || 'Bitte wählen'}
                  </ThemedText>
                </View>
                <ThemedText style={styles.locationChevron}>›</ThemedText>
              </TouchableOpacity>

              {canteenOpen && (
                <View style={styles.dropdown}>
                  <ScrollView style={{ maxHeight: 280 }}>
                    {availableCanteens.map((canteen) => (
                      <TouchableOpacity
                        key={canteen.id}
                        style={[
                          styles.dropdownItem,
                          canteen.id === selectedCanteen?.id && styles.dropdownItemSelected,
                          !canteen.hasMenu && styles.dropdownItemDisabled,
                        ]}
                        onPress={() => setCanteen(canteen.id)}
                      >
                        <View>
                          <ThemedText
                            style={[
                              canteen.id === selectedCanteen?.id && styles.selectedText,
                              !canteen.hasMenu && styles.disabledText,
                            ]}
                          >
                            {canteen.name}
                          </ThemedText>
                          <ThemedText style={styles.canteenAddress}>
                            {canteen.address}
                          </ThemedText>
                          {!canteen.hasMenu && (
                            <ThemedText style={styles.noMenuHint}>
                              Derzeit kein Menü verfügbar
                            </ThemedText>
                          )}
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </>
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
          {selectedCanteen && (
            <DailyMenu
              date={selectedDate}
              locationId={selectedCanteen.id}
              locationName={selectedCanteen.fullName}
            />
          )}
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
  canteenBtn: {
    marginTop: 4,
  },
  canteenBtnContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  canteenLabel: {
    color: HTWColors.textLight,
    fontSize: 14,
    fontWeight: '500',
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
  dropdownItemSelected: {
    backgroundColor: HTWColors.primary + '15',
  },
  dropdownItemDisabled: {
    opacity: 0.6,
  },
  selectedText: {
    color: HTWColors.primary,
    fontWeight: '600',
  },
  disabledText: {
    color: HTWColors.textLight,
  },
  canteenAddress: {
    fontSize: 12,
    color: HTWColors.textLight,
    marginTop: 2,
  },
  noMenuHint: {
    fontSize: 11,
    color: HTWColors.warning,
    marginTop: 2,
    fontStyle: 'italic',
  },
  content: {
    flex: 1,
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
