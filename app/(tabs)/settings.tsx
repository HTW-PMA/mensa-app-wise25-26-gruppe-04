import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HTWColors } from '@/constants/theme';

const STORAGE_KEY = '@mensa_app_preferences';

interface UserPreferences {
  dietaryRestrictions: string[];
  allergens: string[];
  maxPrice: number;
  notificationsEnabled: boolean;
}

const DIETARY_OPTIONS = [
  { id: 'vegetarian', label: 'Vegetarisch' },
  { id: 'vegan', label: 'Vegan' },
  { id: 'glutenfree', label: 'Glutenfrei' },
  { id: 'lactosefree', label: 'Laktosefrei' },
  { id: 'halal', label: 'Halal' },
  { id: 'kosher', label: 'Koscher' },
];

const ALLERGEN_OPTIONS = [
  { id: 'gluten', label: 'Gluten' },
  { id: 'milk', label: 'Milch' },
  { id: 'eggs', label: 'Eier' },
  { id: 'fish', label: 'Fisch' },
  { id: 'shellfish', label: 'Schalentiere' },
  { id: 'nuts', label: 'Nüsse' },
  { id: 'peanuts', label: 'Erdnüsse' },
  { id: 'soy', label: 'Soja' },
  { id: 'celery', label: 'Sellerie' },
  { id: 'mustard', label: 'Senf' },
  { id: 'sesame', label: 'Sesam' },
  { id: 'sulfites', label: 'Sulfite' },
];

export default function SettingsScreen() {
  const [preferences, setPreferences] = useState<UserPreferences>({
    dietaryRestrictions: [],
    allergens: [],
    maxPrice: 10,
    notificationsEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences on mount
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
      'Einstellungen zurücksetzen',
      'Möchten Sie wirklich alle Einstellungen zurücksetzen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Zurücksetzen',
          style: 'destructive',
          onPress: () => {
            const defaultPrefs = {
              dietaryRestrictions: [],
              allergens: [],
              maxPrice: 10,
              notificationsEnabled: false,
            };
            savePreferences(defaultPrefs);
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedView style={styles.container}>
          <ThemedText>Lädt Einstellungen...</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Einstellungen</ThemedText>
          <ThemedText>Präferenzen & Allergien</ThemedText>
        </ThemedView>

        {/* Dietary Restrictions */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Ernährungspräferenzen
          </ThemedText>
          {DIETARY_OPTIONS.map((option) => (
            <View key={option.id} style={styles.optionRow}>
              <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
              <Switch
                value={preferences.dietaryRestrictions.includes(option.id)}
                onValueChange={() => toggleDietaryRestriction(option.id)}
                trackColor={{ false: '#ccc', true: HTWColors.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </ThemedView>

        {/* Allergens */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Allergene
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Wählen Sie Ihre Allergene aus, um Warnungen zu erhalten
          </ThemedText>
          {ALLERGEN_OPTIONS.map((option) => (
            <View key={option.id} style={styles.optionRow}>
              <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
              <Switch
                value={preferences.allergens.includes(option.id)}
                onValueChange={() => toggleAllergen(option.id)}
                trackColor={{ false: '#ccc', true: HTWColors.error }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </ThemedView>

        {/* Push Notifications */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Benachrichtigungen
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            Erhalte Push-Benachrichtigungen, wenn deine Lieblingsspeisen verfügbar sind
          </ThemedText>
          <View style={styles.optionRow}>
            <ThemedText style={styles.optionLabel}>Push-Benachrichtigungen</ThemedText>
            <Switch
              value={preferences.notificationsEnabled}
              onValueChange={toggleNotifications}
              trackColor={{ false: '#ccc', true: HTWColors.primary }}
              thumbColor="#fff"
            />
          </View>
        </ThemedView>

        {/* Summary */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Zusammenfassung
          </ThemedText>
          <View style={styles.summaryBox}>
            <ThemedText style={styles.summaryLabel}>Ernährung:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {preferences.dietaryRestrictions.length > 0
                ? preferences.dietaryRestrictions
                    .map((id) => DIETARY_OPTIONS.find((o) => o.id === id)?.label)
                    .join(', ')
                : 'Keine Einschränkungen'}
            </ThemedText>
          </View>
          <View style={styles.summaryBox}>
            <ThemedText style={styles.summaryLabel}>Allergene:</ThemedText>
            <ThemedText style={styles.summaryValue}>
              {preferences.allergens.length > 0
                ? preferences.allergens
                    .map((id) => ALLERGEN_OPTIONS.find((o) => o.id === id)?.label)
                    .join(', ')
                : 'Keine Allergene'}
            </ThemedText>
          </View>
        </ThemedView>

        {/* Reset Button */}
        <ThemedView style={styles.section}>
          <TouchableOpacity style={styles.resetButton} onPress={resetPreferences}>
            <ThemedText style={styles.resetButtonText}>
              Alle Einstellungen zurücksetzen
            </ThemedText>
          </TouchableOpacity>
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
  section: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: HTWColors.backgroundGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
  },
  summaryBox: {
    padding: 12,
    backgroundColor: HTWColors.backgroundGray,
    borderRadius: 8,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    color: '#666',
  },
  resetButton: {
    backgroundColor: HTWColors.error,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
