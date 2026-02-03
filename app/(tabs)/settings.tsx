import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Switch, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { UniColors } from '@/constants/theme';
import { sendTestNotification, registerForPushNotificationsAsync } from '@/services/notifications/notificationService';

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

  // Theme colors
  const primaryColor = useThemeColor({}, 'primary');
  const errorColor = useThemeColor({}, 'error');
  const borderColor = useThemeColor({}, 'border');
  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const rowColor = useThemeColor({ light: '#F2F3F5', dark: '#2C2C2E' }, 'background');

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

  const toggleNotifications = async () => {
    const newValue = !preferences.notificationsEnabled;
    
    if (newValue) {
      // Request permissions when enabling notifications
      const token = await registerForPushNotificationsAsync();
      if (!token) {
        Alert.alert('Fehler', 'Benachrichtigungen konnten nicht aktiviert werden.');
        return;
      }
    }
    
    savePreferences({ ...preferences, notificationsEnabled: newValue });
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      Alert.alert('Erfolg', 'Test-Benachrichtigung wurde gesendet!');
    } catch (error) {
      console.error('Error sending test notification:', error);
      Alert.alert('Fehler', 'Test-Benachrichtigung konnte nicht gesendet werden.');
    }
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
        <ThemedView style={styles.container}>
          <SafeAreaView style={styles.safeArea} edges={['top']}>
            <ThemedText>Lädt Einstellungen...</ThemedText>
          </SafeAreaView>
        </ThemedView>
    );
  }

  return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView style={styles.container}>
            <ThemedView style={styles.header}>
              <ThemedText type="title">Einstellungen</ThemedText>
              <ThemedText style={{ color: textSecondaryColor }}>Präferenzen & Allergien</ThemedText>
            </ThemedView>

            {/* Dietary Restrictions */}
            <ThemedView style={[styles.section, { borderTopColor: borderColor }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Ernährungspräferenzen
              </ThemedText>
              {DIETARY_OPTIONS.map((option) => (
                  <View key={option.id} style={[styles.optionRow, { backgroundColor: rowColor }]}>
                    <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                    <Switch
                        value={preferences.dietaryRestrictions.includes(option.id)}
                        onValueChange={() => toggleDietaryRestriction(option.id)}
                        trackColor={{ false: '#767680', true: primaryColor }}
                        thumbColor="#fff"
                    />
                  </View>
              ))}
            </ThemedView>

            {/* Allergens */}
            <ThemedView style={[styles.section, { borderTopColor: borderColor }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Allergene
              </ThemedText>
              <ThemedText style={[styles.sectionDescription, { color: textSecondaryColor }]}>
                Wählen Sie Ihre Allergene aus, um Warnungen zu erhalten
              </ThemedText>
              {ALLERGEN_OPTIONS.map((option) => (
                  <View key={option.id} style={[styles.optionRow, { backgroundColor: rowColor }]}>
                    <ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
                    <Switch
                        value={preferences.allergens.includes(option.id)}
                        onValueChange={() => toggleAllergen(option.id)}
                        trackColor={{ false: '#767680', true: errorColor }}
                        thumbColor="#fff"
                    />
                  </View>
              ))}
            </ThemedView>

            {/* Push Notifications */}
            <ThemedView style={[styles.section, { borderTopColor: borderColor }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Benachrichtigungen
              </ThemedText>
              <ThemedText style={[styles.sectionDescription, { color: textSecondaryColor }]}>
                Erhalte Push-Benachrichtigungen, wenn deine Lieblingsspeisen verfügbar sind
              </ThemedText>
              <View style={[styles.optionRow, { backgroundColor: rowColor }]}>
                <ThemedText style={styles.optionLabel}>Push-Benachrichtigungen</ThemedText>
                <Switch
                    value={preferences.notificationsEnabled}
                    onValueChange={toggleNotifications}
                    trackColor={{ false: '#767680', true: primaryColor }}
                    thumbColor="#fff"
                />
              </View>
              {preferences.notificationsEnabled && (
                <TouchableOpacity 
                  style={[styles.testButton, { backgroundColor: primaryColor }]} 
                  onPress={handleTestNotification}
                >
                  <ThemedText style={styles.testButtonText}>
                    🔔 Test-Benachrichtigung senden
                  </ThemedText>
                </TouchableOpacity>
              )}
            </ThemedView>

            {/* Summary */}
            <ThemedView style={[styles.section, { borderTopColor: borderColor }]}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Zusammenfassung
              </ThemedText>
              <View style={[styles.summaryBox, { backgroundColor: rowColor }]}>
                <ThemedText style={styles.summaryLabel}>Ernährung:</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: textSecondaryColor }]}>
                  {preferences.dietaryRestrictions.length > 0
                      ? preferences.dietaryRestrictions
                          .map((id) => DIETARY_OPTIONS.find((o) => o.id === id)?.label)
                          .join(', ')
                      : 'Keine Einschränkungen'}
                </ThemedText>
              </View>
              <View style={[styles.summaryBox, { backgroundColor: rowColor }]}>
                <ThemedText style={styles.summaryLabel}>Allergene:</ThemedText>
                <ThemedText style={[styles.summaryValue, { color: textSecondaryColor }]}>
                  {preferences.allergens.length > 0
                      ? preferences.allergens
                          .map((id) => ALLERGEN_OPTIONS.find((o) => o.id === id)?.label)
                          .join(', ')
                      : 'Keine Allergene'}
                </ThemedText>
              </View>
            </ThemedView>

            {/* Reset Button */}
            <ThemedView style={[styles.section, { borderTopColor: borderColor }]}>
              <TouchableOpacity style={[styles.resetButton, { backgroundColor: errorColor }]} onPress={resetPreferences}>
                <ThemedText style={styles.resetButtonText}>
                  Alle Einstellungen zurücksetzen
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
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
    gap: 8,
  },
  section: {
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  sectionTitle: {
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
  },
  summaryBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
  },
  resetButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  testButton: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
