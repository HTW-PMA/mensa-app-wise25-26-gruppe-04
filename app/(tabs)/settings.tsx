import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
  { id: 'glutenfree', label: 'Glutenfrei', icon: 'do-not-disturb' },
  { id: 'lactosefree', label: 'Laktosefrei', icon: 'water-drop' },
  { id: 'halal', label: 'Halal', icon: 'verified' },
  { id: 'kosher', label: 'Koscher', icon: 'verified' },
];

const ALLERGEN_OPTIONS: { id: string; label: string; icon: React.ComponentProps<typeof MaterialIcons>['name'] }[] = [
  { id: 'gluten', label: 'Gluten', icon: 'bakery-dining' },
  { id: 'milk', label: 'Milch', icon: 'local-drink' },
  { id: 'eggs', label: 'Eier', icon: 'egg' },
  { id: 'fish', label: 'Fisch', icon: 'set-meal' },
  { id: 'shellfish', label: 'Schalentiere', icon: 'set-meal' },
  { id: 'nuts', label: 'Nuesse', icon: 'spa' },
  { id: 'peanuts', label: 'Erdnuesse', icon: 'spa' },
  { id: 'soy', label: 'Soja', icon: 'grass' },
  { id: 'celery', label: 'Sellerie', icon: 'eco' },
  { id: 'mustard', label: 'Senf', icon: 'local-dining' },
  { id: 'sesame', label: 'Sesam', icon: 'grain' },
  { id: 'sulfites', label: 'Sulfite', icon: 'science' },
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
  const surfaceColor = useThemeColor({}, 'surface');
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

  const toggleNotifications = () => {
    savePreferences({ ...preferences, notificationsEnabled: !preferences.notificationsEnabled });
  };

  const resetPreferences = () => {
    Alert.alert(
      'Einstellungen zuruecksetzen',
      'Alle Einstellungen werden zurueckgesetzt.',
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

  const activeCount = preferences.dietaryRestrictions.length + preferences.allergens.length;

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ThemedText style={{ padding: 20 }}>Einstellungen werden geladen...</ThemedText>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={[styles.headerIcon, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
              <MaterialIcons name="tune" size={28} color={primaryColor} />
            </View>
            <ThemedText style={styles.headerTitle}>Einstellungen</ThemedText>
            {activeCount > 0 && (
              <ThemedText style={[styles.headerSub, { color: textSecondaryColor }]}>
                {activeCount} {activeCount === 1 ? 'Filter' : 'Filter'} aktiv
              </ThemedText>
            )}
          </View>

          {/* Dietary Preferences */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="restaurant" size={20} color={primaryColor} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.sectionTitle}>Ernaehrungspraeferenzen</ThemedText>
                <ThemedText style={[styles.sectionSub, { color: textSecondaryColor }]}>
                  Gerichte werden im Menueplan hervorgehoben
                </ThemedText>
              </View>
            </View>

            <View style={styles.optionsGrid}>
              {DIETARY_OPTIONS.map((option) => {
                const isActive = preferences.dietaryRestrictions.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.chipOption,
                      {
                        backgroundColor: isActive
                          ? (isDark ? '#0A2E1A' : '#F0FDF4')
                          : (isDark ? '#1C1C1E' : '#F2F3F5'),
                        borderColor: isActive ? '#22C55E' : 'transparent',
                      },
                    ]}
                    onPress={() => toggleDietaryRestriction(option.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={option.icon}
                      size={18}
                      color={isActive ? '#22C55E' : textSecondaryColor}
                    />
                    <ThemedText
                      style={[
                        styles.chipLabel,
                        isActive && { color: '#22C55E', fontWeight: '600' },
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                    {isActive && (
                      <MaterialIcons name="check-circle" size={16} color="#22C55E" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Allergens */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="warning" size={20} color="#EF4444" />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.sectionTitle}>Allergene</ThemedText>
                <ThemedText style={[styles.sectionSub, { color: textSecondaryColor }]}>
                  Warnungen werden auf Gerichtekarten angezeigt
                </ThemedText>
              </View>
            </View>

            <View style={styles.optionsGrid}>
              {ALLERGEN_OPTIONS.map((option) => {
                const isActive = preferences.allergens.includes(option.id);
                return (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.chipOption,
                      {
                        backgroundColor: isActive
                          ? (isDark ? '#3B1010' : '#FEF2F2')
                          : (isDark ? '#1C1C1E' : '#F2F3F5'),
                        borderColor: isActive ? '#EF4444' : 'transparent',
                      },
                    ]}
                    onPress={() => toggleAllergen(option.id)}
                    activeOpacity={0.7}
                  >
                    <MaterialIcons
                      name={option.icon}
                      size={18}
                      color={isActive ? '#EF4444' : textSecondaryColor}
                    />
                    <ThemedText
                      style={[
                        styles.chipLabel,
                        isActive && { color: '#EF4444', fontWeight: '600' },
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                    {isActive && (
                      <MaterialIcons name="check-circle" size={16} color="#EF4444" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Notifications */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="notifications" size={20} color={primaryColor} />
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.sectionTitle}>Benachrichtigungen</ThemedText>
                <ThemedText style={[styles.sectionSub, { color: textSecondaryColor }]}>
                  Push wenn Lieblingsspeisen verfuegbar sind
                </ThemedText>
              </View>
            </View>
            <View style={[styles.switchRow, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
              <MaterialIcons name="notifications-active" size={18} color={primaryColor} />
              <ThemedText style={styles.switchLabel}>Push-Benachrichtigungen</ThemedText>
              <Switch
                value={preferences.notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ false: '#767680', true: primaryColor }}
                thumbColor="#fff"
              />
            </View>
          </View>

          {/* Active Summary */}
          {activeCount > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialIcons name="checklist" size={20} color={primaryColor} />
                <ThemedText style={styles.sectionTitle}>Aktive Filter</ThemedText>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: isDark ? '#1C1C1E' : surfaceColor }]}>
                {preferences.dietaryRestrictions.length > 0 && (
                  <View style={styles.summaryRow}>
                    <MaterialIcons name="restaurant" size={16} color="#22C55E" />
                    <ThemedText style={styles.summaryText}>
                      {preferences.dietaryRestrictions
                        .map((id) => DIETARY_OPTIONS.find((o) => o.id === id)?.label)
                        .filter(Boolean)
                        .join(', ')}
                    </ThemedText>
                  </View>
                )}
                {preferences.allergens.length > 0 && (
                  <View style={styles.summaryRow}>
                    <MaterialIcons name="warning" size={16} color="#EF4444" />
                    <ThemedText style={styles.summaryText}>
                      {preferences.allergens
                        .map((id) => ALLERGEN_OPTIONS.find((o) => o.id === id)?.label)
                        .filter(Boolean)
                        .join(', ')}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Reset */}
          <View style={[styles.section, { paddingBottom: 40 }]}>
            <TouchableOpacity
              style={[styles.resetButton, { backgroundColor: isDark ? '#3B1010' : '#FEF2F2' }]}
              onPress={resetPreferences}
              activeOpacity={0.7}
            >
              <MaterialIcons name="restart-alt" size={20} color={errorColor} />
              <ThemedText style={[styles.resetText, { color: errorColor }]}>
                Alle Einstellungen zuruecksetzen
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },

  // Header
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 13,
  },

  // Sections
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 1,
  },

  // Chip grid
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 8,
  },
  chipOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  chipLabel: {
    fontSize: 14,
  },

  // Switch row
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  switchLabel: {
    flex: 1,
    fontSize: 14,
  },

  // Summary
  summaryCard: {
    borderRadius: 14,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  summaryText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Reset
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 14,
    borderRadius: 14,
  },
  resetText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
