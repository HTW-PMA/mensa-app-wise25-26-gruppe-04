import { Image } from 'expo-image';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { HTWColors } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const LOCATION_STORAGE_KEY = '@mensa_app_location';

const LOCATIONS = [
  { id: 'wilhelminenhof', name: 'Campus Wilhelminenhof', address: 'Wilhelminenhofstraße 75A, 12459 Berlin' },
  { id: 'treskowallee', name: 'Campus Treskowallee', address: 'Treskowallee 8, 10318 Berlin' },
];

export default function HomeScreen() {
  const router = useRouter();
  const [selectedLocation, setSelectedLocation] = useState('wilhelminenhof');

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    try {
      const stored = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored) {
        setSelectedLocation(stored);
      }
    } catch (error) {
      console.error('Error loading location:', error);
    }
  };

  const handleLocationChange = async (locationId: string) => {
    try {
      await AsyncStorage.setItem(LOCATION_STORAGE_KEY, locationId);
      setSelectedLocation(locationId);
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const currentLocation = LOCATIONS.find(loc => loc.id === selectedLocation) || LOCATIONS[0];

  return (
    <SafeAreaView style={styles.safeArea} edges={[]}>
      <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <Image
          source={require('@/assets/images/app-icon.png')}
          style={styles.logo}
          contentFit="contain"
        />
        <ThemedText type="title" style={styles.title}>
          HTW Mensa App
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Deine digitale Mensa-Begleitung
        </ThemedText>
        
        {/* Standort-Wechsel */}
        <View style={styles.locationPicker}>
          <Picker
            selectedValue={selectedLocation}
            onValueChange={handleLocationChange}
            style={styles.picker}
            dropdownIconColor={HTWColors.textInverse}
          >
            {LOCATIONS.map(loc => (
              <Picker.Item key={loc.id} label={loc.name} value={loc.id} />
            ))}
          </Picker>
        </View>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">🍽️ Features</ThemedText>
        
        <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/(tabs)/menu')}>
          <ThemedText style={styles.featureTitle}>Tagesmenü</ThemedText>
          <ThemedText style={styles.featureText}>
            Sieh dir das aktuelle Menü mit allen Nährwertangaben und Allergenen an
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/(tabs)/ai-assistant')}>
          <ThemedText style={styles.featureTitle}>KI-Assistent</ThemedText>
          <ThemedText style={styles.featureText}>
            Erhalte personalisierte Empfehlungen basierend auf deinen Präferenzen
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/(tabs)/waiting-times')}>
          <ThemedText style={styles.featureTitle}>Wartezeiten</ThemedText>
          <ThemedText style={styles.featureText}>
            Plane deinen Besuch mit Live-Wartezeiten und Auslastungsinformationen
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureCard} onPress={() => router.push('/(tabs)/menu')}>
          <ThemedText style={styles.featureTitle}>Nachhaltigkeit</ThemedText>
          <ThemedText style={styles.featureText}>
            Transparente Informationen zu Herkunft und CO₂-Bilanz der Gerichte
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.infoSection}>
        <ThemedText type="subtitle">📍 Standort</ThemedText>
        <ThemedText style={styles.infoText}>
          HTW Berlin Mensa{'\n'}
          {currentLocation.address}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.infoSection}>
        <ThemedText type="subtitle">🕐 Öffnungszeiten</ThemedText>
        <ThemedText style={styles.infoText}>
          Montag - Freitag: 11:00 - 14:30 Uhr{'\n'}
          Samstag & Sonntag: Geschlossen
        </ThemedText>
      </ThemedView>

      <View style={styles.footer}>
        <ThemedText style={styles.footerText}>
          Entwickelt von Gruppe 04 • WiSe 25/26
        </ThemedText>
      </View>

      </ScrollView>
    </SafeAreaView>);
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: HTWColors.primary,
    paddingTop: 60,
  },
  locationPicker: {
    width: '100%',
    marginTop: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    color: HTWColors.textInverse,
    height: 50,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
    borderRadius: 16,
  },
  title: {
    color: HTWColors.textInverse,
    marginBottom: 8,
  },
  subtitle: {
    color: HTWColors.textInverse,
    fontSize: 16,
    opacity: 0.9,
  },
  section: {
    padding: 20,
    gap: 12,
  },
  featureCard: {
    padding: 16,
    backgroundColor: HTWColors.backgroundGray,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: HTWColors.primary,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  infoSection: {
    padding: 20,
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 22,
    opacity: 0.8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});
