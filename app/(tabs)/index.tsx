import { Image } from 'expo-image';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';

const LOCATION_STORAGE_KEY = '@mensa_app_location';

const LOCATIONS = [
  { id: 'htw', name: 'HTW Berlin – Wilhelminenhof', address: 'Wilhelminenhofstraße 75A, 12459 Berlin' },
  { id: 'tu', name: 'TU Berlin – Hardenbergstraße', address: 'Hardenbergstraße 34, 10623 Berlin' },
  { id: 'hu', name: 'HU Berlin – Nord', address: 'Invalidenstraße 42, 10115 Berlin' },
  { id: 'fu', name: 'FU Berlin – Dahlem', address: 'Königin-Luise-Straße 24, 14195 Berlin' },
  { id: 'hwr', name: 'HWR Berlin', address: 'Alt-Friedrichsfelde 60, 10315 Berlin' },
  { id: 'udk', name: 'UdK Berlin', address: 'Einsteinufer 43, 10587 Berlin' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme];

  const [selectedLocation, setSelectedLocation] = useState('htw');

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    const stored = await AsyncStorage.getItem(LOCATION_STORAGE_KEY);
    if (stored) setSelectedLocation(stored);
  };

  const handleLocationChange = async (locationId: string) => {
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, locationId);
    setSelectedLocation(locationId);
  };

  const currentLocation = LOCATIONS.find(loc => loc.id === selectedLocation) || LOCATIONS[0];

  return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <ThemedView style={[styles.header, { backgroundColor: theme.primary }]}>
            <Image
                source={require('@/assets/images/app-icon.png')}
                style={styles.logo}
                contentFit="contain"
            />
            <ThemedText type="title" style={styles.title}>
              UniMensa Berlin
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Alle Mensen der Berliner Hochschulen in einer App
            </ThemedText>

            <View style={styles.locationPicker}>
              <Picker
                  selectedValue={selectedLocation}
                  onValueChange={handleLocationChange}
                  style={styles.picker}
                  dropdownIconColor="#FFFFFF"
              >
                {LOCATIONS.map(loc => (
                    <Picker.Item key={loc.id} label={loc.name} value={loc.id} />
                ))}
              </Picker>
            </View>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText type="subtitle">🍽️ Funktionen</ThemedText>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/menu')}>
              <ThemedText style={styles.cardTitle}>Tagesmenü</ThemedText>
              <ThemedText style={styles.cardText}>Alle Gerichte mit Preisen, Allergenen und Nährwerten</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/ai-assistant')}>
              <ThemedText style={styles.cardTitle}>KI-Assistent</ThemedText>
              <ThemedText style={styles.cardText}>Persönliche Empfehlungen nach Vorlieben</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity style={styles.card} onPress={() => router.push('/(tabs)/waiting-times')}>
              <ThemedText style={styles.cardTitle}>Wartezeiten</ThemedText>
              <ThemedText style={styles.cardText}>Live-Auslastung und Stoßzeiten</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.infoSection}>
            <ThemedText type="subtitle">📍 Aktueller Standort</ThemedText>
            <ThemedText style={styles.infoText}>{currentLocation.address}</ThemedText>
          </ThemedView>

          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              UniMensa Berlin • Gruppe 04 • WiSe 25/26
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },

  header: {
    padding: 24,
    alignItems: 'center',
    paddingTop: 60,
  },
  logo: {
    width: 88,
    height: 88,
    marginBottom: 16,
    borderRadius: 20,
  },
  title: {
    color: '#FFFFFF',
    marginBottom: 6,
  },
  subtitle: {
    color: '#FFFFFF',
    opacity: 0.9,
  },
  locationPicker: {
    width: '100%',
    marginTop: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  picker: {
    color: '#FFFFFF',
  },

  section: {
    padding: 20,
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardText: {
    fontSize: 14,
    opacity: 0.7,
  },

  infoSection: {
    padding: 20,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.8,
  },

  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});