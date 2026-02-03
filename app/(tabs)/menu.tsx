import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { DailyMenu } from '@/components/daily-menu';
import { useEffect, useMemo, useState } from 'react';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UNIVERSITIES } from '@/constants/universities';

const UNIVERSITY_STORAGE_KEY = 'selected_university';
const CANTEEN_STORAGE_KEY = 'selected_canteen';

const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function getWeekDays(baseDate: Date): Date[] {
  const day = baseDate.getDay();
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day + 6) % 7));
  const days: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function MenuScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [universityOpen, setUniversityOpen] = useState(false);
  const [canteenOpen, setCanteenOpen] = useState(false);
  const [selectedUniversityId, setSelectedUniversityId] = useState('htw');
  const [selectedCanteenId, setSelectedCanteenId] = useState<string | null>(null);

  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const primaryColor = useThemeColor({}, 'primary');
  const surfaceColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const textInverseColor = useThemeColor({}, 'textInverse');

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

  const weekDays = useMemo(() => getWeekDays(selectedDate), [selectedDate]);
  const today = useMemo(() => new Date(), []);

  useEffect(() => {
    const loadSelection = async () => {
      try {
        const [savedUni, savedCanteen] = await Promise.all([
          AsyncStorage.getItem(UNIVERSITY_STORAGE_KEY),
          AsyncStorage.getItem(CANTEEN_STORAGE_KEY),
        ]);
        if (savedUni) setSelectedUniversityId(savedUni);
        if (savedCanteen) setSelectedCanteenId(savedCanteen);
      } catch (error) {
        console.error('Fehler beim Laden der Auswahl:', error);
      }
    };
    loadSelection();
  }, []);

  useEffect(() => {
    if (availableCanteens.length > 0) {
      const canteenExists = availableCanteens.some((c) => c.id === selectedCanteenId);
      if (!canteenExists) {
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

  const goToPreviousWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 7);
    setSelectedDate(d);
  };

  const goToNextWeek = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 7);
    setSelectedDate(d);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  return (
    <ThemedView style={styles.safeArea}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView style={styles.container} stickyHeaderIndices={[0]}>
          {/* Sticky Header */}
          <View style={[styles.stickyHeader, { backgroundColor: isDark ? '#000' : '#F7F8FA' }]}>
            {/* Location selectors */}
            <View style={styles.locationRow}>
              <TouchableOpacity
                style={[styles.locationPill, { backgroundColor: surfaceColor }]}
                onPress={() => { setUniversityOpen(!universityOpen); setCanteenOpen(false); }}
                activeOpacity={0.7}
              >
                <MaterialIcons name="school" size={16} color={primaryColor} />
                <ThemedText style={styles.locationPillText} numberOfLines={1}>
                  {selectedUniversity.name}
                </ThemedText>
                <MaterialIcons
                  name={universityOpen ? 'expand-less' : 'expand-more'}
                  size={18}
                  color={textSecondaryColor}
                />
              </TouchableOpacity>

              {availableCanteens.length > 1 && (
                <TouchableOpacity
                  style={[styles.locationPill, { backgroundColor: surfaceColor }]}
                  onPress={() => { setCanteenOpen(!canteenOpen); setUniversityOpen(false); }}
                  activeOpacity={0.7}
                >
                  <MaterialIcons name="restaurant" size={16} color={primaryColor} />
                  <ThemedText style={styles.locationPillText} numberOfLines={1}>
                    {selectedCanteen?.name || 'Mensa'}
                  </ThemedText>
                  <MaterialIcons
                    name={canteenOpen ? 'expand-less' : 'expand-more'}
                    size={18}
                    color={textSecondaryColor}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Dropdowns */}
            {universityOpen && (
              <View style={[styles.dropdown, { backgroundColor: surfaceColor, borderColor }]}>
                <ScrollView style={{ maxHeight: 320 }}>
                  {UNIVERSITIES.map((uni) => (
                    <TouchableOpacity
                      key={uni.id}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: borderColor },
                        uni.id === selectedUniversityId && { backgroundColor: primaryColor + '12' },
                      ]}
                      onPress={() => setUniversity(uni.id)}
                    >
                      <MaterialIcons
                        name={uni.id === selectedUniversityId ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={18}
                        color={uni.id === selectedUniversityId ? primaryColor : textSecondaryColor}
                      />
                      <ThemedText
                        style={uni.id === selectedUniversityId ? { color: primaryColor, fontWeight: '600' } : undefined}
                      >
                        {uni.name}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {canteenOpen && (
              <View style={[styles.dropdown, { backgroundColor: surfaceColor, borderColor }]}>
                <ScrollView style={{ maxHeight: 280 }}>
                  {availableCanteens.map((canteen) => (
                    <TouchableOpacity
                      key={canteen.id}
                      style={[
                        styles.dropdownItem,
                        { borderBottomColor: borderColor },
                        canteen.id === selectedCanteen?.id && { backgroundColor: primaryColor + '12' },
                        !canteen.hasMenu && { opacity: 0.5 },
                      ]}
                      onPress={() => setCanteen(canteen.id)}
                    >
                      <MaterialIcons
                        name={canteen.id === selectedCanteen?.id ? 'radio-button-checked' : 'radio-button-unchecked'}
                        size={18}
                        color={canteen.id === selectedCanteen?.id ? primaryColor : textSecondaryColor}
                      />
                      <View style={{ flex: 1 }}>
                        <ThemedText
                          style={canteen.id === selectedCanteen?.id ? { color: primaryColor, fontWeight: '600' } : undefined}
                        >
                          {canteen.name}
                        </ThemedText>
                        <ThemedText style={[styles.canteenAddress, { color: textSecondaryColor }]}>
                          {canteen.address}
                        </ThemedText>
                        {!canteen.hasMenu && (
                          <ThemedText style={styles.noMenuHint}>Kein Menu verfuegbar</ThemedText>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Week navigation */}
            <View style={styles.weekNav}>
              <TouchableOpacity onPress={goToPreviousWeek} style={styles.weekArrow} activeOpacity={0.6}>
                <MaterialIcons name="chevron-left" size={24} color={primaryColor} />
              </TouchableOpacity>

              <ThemedText style={styles.monthLabel}>
                {formatMonthYear(selectedDate)}
              </ThemedText>

              <TouchableOpacity onPress={goToNextWeek} style={styles.weekArrow} activeOpacity={0.6}>
                <MaterialIcons name="chevron-right" size={24} color={primaryColor} />
              </TouchableOpacity>
            </View>

            {/* Day pills */}
            <View style={styles.dayPillsRow}>
              {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const isToday = isSameDay(day, today);
                return (
                  <TouchableOpacity
                    key={day.toISOString()}
                    style={[
                      styles.dayPill,
                      isSelected && { backgroundColor: primaryColor },
                      !isSelected && { backgroundColor: surfaceColor },
                    ]}
                    onPress={() => setSelectedDate(day)}
                    activeOpacity={0.7}
                  >
                    <ThemedText
                      style={[
                        styles.dayPillWeekday,
                        { color: isSelected ? textInverseColor : textSecondaryColor },
                      ]}
                    >
                      {WEEKDAYS_SHORT[day.getDay()]}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.dayPillDate,
                        { color: isSelected ? textInverseColor : (isToday ? primaryColor : undefined) },
                        isSelected && { fontWeight: '700' },
                      ]}
                    >
                      {day.getDate()}
                    </ThemedText>
                    {isToday && !isSelected && (
                      <View style={[styles.todayDot, { backgroundColor: primaryColor }]} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Sustainability banner */}
          <TouchableOpacity
            style={[styles.sustainabilityBanner, { backgroundColor: isDark ? '#0A2E1A' : '#F0FDF4' }]}
            onPress={() => router.push('/sustainability')}
            activeOpacity={0.7}
          >
            <View style={[styles.sustainabilityIconCircle, { backgroundColor: isDark ? '#1A3D1A' : '#DCFCE7' }]}>
              <MaterialIcons name="eco" size={20} color="#22C55E" />
            </View>
            <View style={styles.sustainabilityBannerText}>
              <ThemedText style={styles.sustainabilityBannerTitle}>Nachhaltigkeit</ThemedText>
              <ThemedText style={[styles.sustainabilityBannerDesc, { color: textSecondaryColor }]}>
                CO2-Bilanz, Wasser-Fussabdruck & mehr
              </ThemedText>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#22C55E" />
          </TouchableOpacity>

          {/* Menu content */}
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
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },

  // Sticky header
  stickyHeader: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    gap: 10,
  },

  // Location pills
  locationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  locationPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  locationPillText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },

  // Dropdown
  dropdown: {
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
  },
  canteenAddress: {
    fontSize: 11,
    marginTop: 2,
  },
  noMenuHint: {
    fontSize: 11,
    color: '#F59E0B',
    marginTop: 2,
    fontStyle: 'italic',
  },

  // Week navigation
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  weekArrow: {
    padding: 4,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  // Day pills
  dayPillsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    gap: 2,
  },
  dayPillWeekday: {
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  dayPillDate: {
    fontSize: 18,
    fontWeight: '600',
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginTop: 2,
  },

  // Sustainability banner
  sustainabilityBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
    padding: 14,
    borderRadius: 16,
  },
  sustainabilityIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sustainabilityBannerText: {
    flex: 1,
  },
  sustainabilityBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sustainabilityBannerDesc: {
    fontSize: 12,
    marginTop: 1,
  },

  content: {
    flex: 1,
  },
});
