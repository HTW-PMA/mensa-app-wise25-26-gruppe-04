import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { sendTestNotification } from '@/services/notifications/notificationService';
import { notifyPreferencesChanged } from '@/hooks/useUserPreferences';

const STORAGE_KEY = '@mensa_app_preferences';

interface UserPreferences {
  dietaryRestrictions: string[];
  allergens: string[];
  maxPrice: number;
  notificationsEnabled: boolean;
}

const DIETARY_OPTIONS: { id: string; label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
  { id: 'vegetarian', label: 'Vegetarisch', icon: 'grass' },
  { id: 'vegan', label: 'Vegan', icon: 'eco' },
  { id: 'glutenfree', label: 'Glutenfrei', icon: 'grain' },
  { id: 'lactosefree', label: 'Laktosefrei', icon: 'water-drop' },
  { id: 'halal', label: 'Halal', icon: 'verified' },
  { id: 'kosher', label: 'Koscher', icon: 'star' },
];

const ALLERGEN_OPTIONS: { id: string; label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
  { id: 'gluten', label: 'Gluten', icon: 'grain' },
  { id: 'crustaceans', label: 'Krebstiere', icon: 'set-meal' },
  { id: 'eggs', label: 'Eier', icon: 'egg' },
  { id: 'fish', label: 'Fisch', icon: 'set-meal' },
  { id: 'peanuts', label: 'Erdnuesse', icon: 'forest' },
  { id: 'soybeans', label: 'Soja', icon: 'spa' },
  { id: 'milk', label: 'Milch / Laktose', icon: 'water-drop' },
  { id: 'nuts', label: 'Schalenfruechte', icon: 'forest' },
  { id: 'celery', label: 'Sellerie', icon: 'grass' },
  { id: 'mustard', label: 'Senf', icon: 'local-florist' },
  { id: 'sesame', label: 'Sesam', icon: 'grain' },
  { id: 'sulphites', label: 'Sulfite', icon: 'science' },
  { id: 'lupin', label: 'Lupinen', icon: 'spa' },
  { id: 'molluscs', label: 'Weichtiere', icon: 'set-meal' },
];

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    allergens: [],
    maxPrice: 10,
    notificationsEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Fehler', 'Einstellungen konnten nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
      notifyPreferencesChanged();
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Fehler', 'Einstellungen konnten nicht gespeichert werden.');
    }
  };

  const toggleDietaryRestriction = (id: string) => {
    const updated = preferences.dietaryRestrictions.includes(id)
        ? preferences.dietaryRestrictions.filter((item) => item !== id)
        : [...preferences.dietaryRestrictions, id];
    savePreferences({ ...preferences, dietaryRestrictions: updated });
  };

  const toggleAllergen = (id: string) => {
    const updated = preferences.allergens.includes(id)
        ? preferences.allergens.filter((item) => item !== id)
        : [...preferences.allergens, id];
    savePreferences({ ...preferences, allergens: updated });
  };

  const resetPreferences = () => {
    Alert.alert(
        'Einstellungen zuruecksetzen',
        'Moechten Sie wirklich alle Einstellungen zuruecksetzen?',
        [
          { text: 'Abbrechen', style: 'cancel' },
          {
            text: 'Zuruecksetzen',
            style: 'destructive',
            onPress: () => {
              savePreferences({
                dietaryRestrictions: [],
                allergens: [],
                maxPrice: 10,
                notificationsEnabled: false,
              });
            },
          },
        ]
    );
  };

  const toggleNotifications = () => {
    savePreferences({ ...preferences, notificationsEnabled: !preferences.notificationsEnabled });
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Erfolg', 'Test-Benachrichtigung wurde gesendet.');
    } catch (error: any) {
      Alert.alert('Fehler', error?.message ?? 'Test-Benachrichtigung konnte nicht gesendet werden.');
    }
  };

  const activeFilterCount = preferences.dietaryRestrictions.length + preferences.allergens.length;

  if (isLoading) {
    return (
        <ThemedView style={styles.container}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ThemedText>Laedt Einstellungen...</ThemedText>
          </SafeAreaView>
        </ThemedView>
    );
  }

  return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View>
                  <ThemedText type="title">Einstellungen</ThemedText>
                  <ThemedText style={{ color: textSecondaryColor, marginTop: 4 }}>
                    Praeferenzen & Allergien
                  </ThemedText>
                </View>
                {activeFilterCount > 0 && (
                    <View style={[styles.filterCountBadge, { backgroundColor: primaryColor }]}>
                      <ThemedText style={styles.filterCountText}>{activeFilterCount}</ThemedText>
                    </View>
                )}
              </View>
            </View>

            {/* Active filters summary */}
            {activeFilterCount > 0 && (
                <View style={[styles.summaryCard, { backgroundColor: isDark ? '#0A2E1A' : '#F0FDF4' }]}>
                  <MaterialIcons name="check-circle" size={20} color="#22C55E" />
                  <View style={styles.summaryContent}>
                    <ThemedText style={styles.summaryTitle}>Aktive Filter</ThemedText>
                    <ThemedText style={[styles.summaryValue, { color: textSecondaryColor }]}>
                      {[
                        ...preferences.dietaryRestrictions.map(
                            id => DIETARY_OPTIONS.find(o => o.id === id)?.label
                        ),
                        ...preferences.allergens.map(
                            id => ALLERGEN_OPTIONS.find(o => o.id === id)?.label
                        ),
                      ]
                          .filter(Boolean)
                          .join(', ')}
                    </ThemedText>
                  </View>
                </View>
            )}

            {/* Dietary Restrictions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: isDark ? '#1A3D1A' : '#ECFDF5' }]}>
                  <MaterialIcons name="restaurant" size={18} color={primaryColor} />
                </View>
                <View>
                  <ThemedText type="subtitle">Ernaehrungspraeferenzen</ThemedText>
                  <ThemedText style={[styles.sectionDesc, { color: textSecondaryColor }]}>
                    Gerichte nach Ernaehrungsweise filtern
                  </ThemedText>
                </View>
              </View>

              <View style={styles.chipGrid}>
                {DIETARY_OPTIONS.map((option) => {
                  const isActive = preferences.dietaryRestrictions.includes(option.id);
                  return (
                      <TouchableOpacity
                          key={option.id}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isActive
                                  ? (isDark ? '#1A3D1A' : '#ECFDF5')
                                  : (isDark ? '#2C2C2E' : '#F2F3F5'),
                              borderColor: isActive ? primaryColor : 'transparent',
                              borderWidth: 1.5,
                            },
                          ]}
                          onPress={() => toggleDietaryRestriction(option.id)}
                          activeOpacity={0.7}
                      >
                        <MaterialIcons
                            name={option.icon}
                            size={18}
                            color={isActive ? primaryColor : textSecondaryColor}
                        />
                        <ThemedText
                            style={[
                              styles.chipLabel,
                              { color: isActive ? primaryColor : undefined },
                            ]}
                        >
                          {option.label}
                        </ThemedText>
                        {isActive && (
                            <MaterialIcons name="check-circle" size={16} color={primaryColor} />
                        )}
                      </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Allergens */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: isDark ? '#3D1A1A' : '#FEF2F2' }]}>
                  <MaterialIcons name="warning" size={18} color={errorColor} />
                </View>
                <View>
                  <ThemedText type="subtitle">Allergene</ThemedText>
                  <ThemedText style={[styles.sectionDesc, { color: textSecondaryColor }]}>
                    Warnungen bei allergenen Zutaten
                  </ThemedText>
                </View>
              </View>

              <View style={styles.chipGrid}>
                {ALLERGEN_OPTIONS.map((option) => {
                  const isActive = preferences.allergens.includes(option.id);
                  return (
                      <TouchableOpacity
                          key={option.id}
                          style={[
                            styles.chip,
                            {
                              backgroundColor: isActive
                                  ? (isDark ? '#3D1A1A' : '#FEF2F2')
                                  : (isDark ? '#2C2C2E' : '#F2F3F5'),
                              borderColor: isActive ? errorColor : 'transparent',
                              borderWidth: 1.5,
                            },
                          ]}
                          onPress={() => toggleAllergen(option.id)}
                          activeOpacity={0.7}
                      >
                        <MaterialIcons
                            name={option.icon}
                            size={18}
                            color={isActive ? errorColor : textSecondaryColor}
                        />
                        <ThemedText
                            style={[
                              styles.chipLabel,
                              { color: isActive ? errorColor : undefined },
                            ]}
                        >
                          {option.label}
                        </ThemedText>
                        {isActive && (
                            <MaterialIcons name="check-circle" size={16} color={errorColor} />
                        )}
                      </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Push Notifications */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: isDark ? '#1A2A3D' : '#EFF6FF' }]}>
                  <MaterialIcons name="notifications" size={18} color={primaryColor} />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText type="subtitle">Benachrichtigungen</ThemedText>
                  <ThemedText style={[styles.sectionDesc, { color: textSecondaryColor }]}>
                    Push-Benachrichtigungen fuer Lieblingsspeisen
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.notificationRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F3F5' }]}>
                <View style={styles.notificationRowLeft}>
                  <MaterialIcons name="notifications-active" size={20} color={preferences.notificationsEnabled ? primaryColor : textSecondaryColor} />
                  <ThemedText style={styles.chipLabel}>Push-Benachrichtigungen</ThemedText>
                </View>
                <Switch
                    value={preferences.notificationsEnabled}
                    onValueChange={toggleNotifications}
                    trackColor={{ false: '#767680', true: primaryColor }}
                    thumbColor="#fff"
                />
              </View>

              <TouchableOpacity
                  style={[styles.testButton, { backgroundColor: isDark ? '#1A2A3D' : '#EFF6FF' }]}
                  onPress={handleTestNotification}
                  activeOpacity={0.7}
              >
                <MaterialIcons name="send" size={18} color={primaryColor} />
                <ThemedText style={[styles.testButtonText, { color: primaryColor }]}>
                  Test-Benachrichtigung senden
                </ThemedText>
              </TouchableOpacity>
            </View>

            {/* Summary */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconCircle, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
                  <MaterialIcons name="summarize" size={18} color={primaryColor} />
                </View>
                <View>
                  <ThemedText type="subtitle">Zusammenfassung</ThemedText>
                </View>
              </View>

              <View style={[styles.summaryRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F3F5' }]}>
                <ThemedText style={styles.summaryRowLabel}>Ernaehrung:</ThemedText>
                <ThemedText style={[styles.summaryRowValue, { color: textSecondaryColor }]}>
                  {preferences.dietaryRestrictions.length > 0
                      ? preferences.dietaryRestrictions
                          .map((id) => DIETARY_OPTIONS.find((o) => o.id === id)?.label)
                          .filter(Boolean)
                          .join(', ')
                      : 'Keine Einschraenkungen'}
                </ThemedText>
              </View>
              <View style={[styles.summaryRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F3F5' }]}>
                <ThemedText style={styles.summaryRowLabel}>Allergene:</ThemedText>
                <ThemedText style={[styles.summaryRowValue, { color: textSecondaryColor }]}>
                  {preferences.allergens.length > 0
                      ? preferences.allergens
                          .map((id) => ALLERGEN_OPTIONS.find((o) => o.id === id)?.label)
                          .filter(Boolean)
                          .join(', ')
                      : 'Keine Allergene'}
                </ThemedText>
              </View>
              <View style={[styles.summaryRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F3F5' }]}>
                <ThemedText style={styles.summaryRowLabel}>Benachrichtigungen:</ThemedText>
                <ThemedText style={[styles.summaryRowValue, { color: preferences.notificationsEnabled ? primaryColor : textSecondaryColor }]}>
                  {preferences.notificationsEnabled ? 'Aktiviert' : 'Deaktiviert'}
                </ThemedText>
              </View>
            </View>

            {/* Reset Button */}
            <View style={styles.section}>
              <TouchableOpacity
                  style={[styles.resetButton, { backgroundColor: isDark ? '#3D1A1A' : '#FEF2F2' }]}
                  onPress={resetPreferences}
                  activeOpacity={0.7}
              >
                <MaterialIcons name="restart-alt" size={20} color={errorColor} />
                <ThemedText style={[styles.resetButtonText, { color: errorColor }]}>
                  Alle Einstellungen zuruecksetzen
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
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
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  filterCountBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterCountText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Summary card
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 14,
    borderRadius: 14,
  },
  summaryContent: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 13,
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionDesc: {
    fontSize: 13,
    marginTop: 2,
  },

  // Chip grid
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
  },

  // Notification row
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  notificationRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Test button
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 12,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Summary rows
  summaryRow: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  summaryRowLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 2,
  },
  summaryRowValue: {
    fontSize: 13,
  },

  // Reset
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 14,
  },
  resetButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
