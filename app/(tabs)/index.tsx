import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { UniColors } from '@/constants/theme';

import { LOCATIONS, LOCATION_STORAGE_KEY } from '@/constants/locations';

const PROMPTS = [
  'Was möchtest du heute essen?',
  'Lust auf etwas Warmes?',
  'Vegan, Halal oder klassisch?',
  'Was gibt es heute in der Mensa?',
  'Heute eher leicht oder deftig?',
  'Suchst du etwas ohne Allergene?',
];

export default function HomeScreen() {
  const router = useRouter();
  // Farbschema wird hier aktuell nicht benötigt

  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('htw');
  // Suche/Filter sind bewusst entfernt (Anforderung: nicht auf Startseite anzeigen)

  const [promptIndex, setPromptIndex] = useState(0);
  const promptOpacity = useRef(new Animated.Value(1)).current;
  const promptTranslateY = useRef(new Animated.Value(0)).current;

  const selectedLocation = useMemo(
      () => LOCATIONS.find(l => l.id === selectedLocationId) || LOCATIONS[0],
      [selectedLocationId]
  );

  useEffect(() => {
    AsyncStorage.getItem(LOCATION_STORAGE_KEY).then(v => {
      if (v) setSelectedLocationId(v);
    });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.parallel([
        Animated.timing(promptOpacity, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(promptTranslateY, {
          toValue: -10,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setPromptIndex(i => (i + 1) % PROMPTS.length);
        promptTranslateY.setValue(10);

        Animated.parallel([
          Animated.timing(promptOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(promptTranslateY, {
            toValue: 0,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const setLocation = async (id: string) => {
    setSelectedLocationId(id);
    setLocationOpen(false);
    await AsyncStorage.setItem(LOCATION_STORAGE_KEY, id);
  };

  return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F5F6F8' }]}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.brand}>
            <Image
                source={require('@/assets/images/home-icon.png')}
                style={styles.logo}
                contentFit="contain"
            />
            <ThemedText style={styles.brandText}>UniMensa Berlin</ThemedText>
          </View>

          <TouchableOpacity style={styles.locationBtn} onPress={() => setLocationOpen(!locationOpen)}>
            <ThemedText style={styles.locationText} numberOfLines={1}>
              {selectedLocation.name}
            </ThemedText>
            <IconSymbol name="chevron.right" size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* DROPDOWN */}
        {locationOpen && (
            <View style={styles.dropdown}>
              <ScrollView style={{ maxHeight: 320 }}>
                {LOCATIONS.map(loc => (
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

        <ScrollView contentContainerStyle={styles.content}>
          {/* Animated Prompt */}
          <Animated.View
              style={[
                styles.promptWrap,
                { opacity: promptOpacity, transform: [{ translateY: promptTranslateY }] },
              ]}
          >
            <ThemedText style={styles.promptText}>{PROMPTS[promptIndex]}</ThemedText>
          </Animated.View>



          {/* Feature Cards */}
          {[
            ['Tagesmenü', 'Alle Gerichte mit Nährwerten und Allergenen', 'fork.knife', () => router.push('/(tabs)/menu')],
            ['KI-Assistent', 'Personalisierte Empfehlungen', 'sparkles', () => router.push('/(tabs)/ai-assistant')],
            ['Wartezeiten', 'Live-Auslastung der Mensen', 'clock.fill', () => router.push('/(tabs)/waiting-times')],
            ['Nachhaltigkeit', 'CO₂-Bilanz und Herkunft', 'leaf.fill', () => router.push('/(tabs)/menu')],
          ].map(([title, sub, icon, action]) => (
              <TouchableOpacity key={title as string} style={styles.card} onPress={action as any}>
                <IconSymbol name={icon as any} size={22} color={UniColors.primary} />
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.cardTitle}>{title}</ThemedText>
                  <ThemedText style={styles.cardSub}>{sub}</ThemedText>
                </View>
                <IconSymbol name="chevron.right" size={16} color="#9CA3AF" />
              </TouchableOpacity>
          ))}

          {/* Footer mit dynamischem Standort */}
          <View style={{ marginTop: 24, paddingBottom: 20 }}>
            {selectedLocation.address && (
                <ThemedText style={styles.locationFooter}>
                  📍 {selectedLocation.address}
                </ThemedText>
            )}
            <ThemedText style={styles.footerSmall}>
              UniMensa Berlin · Gruppe 04 · {selectedLocation.short} · WiSe 25/26
            </ThemedText>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  header: {
    height: 72,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 52, height: 52 },
  brandText: { fontSize: 18, fontWeight: '700' },

  locationBtn: {
    flexDirection: 'row',
    gap: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    backgroundColor: '#fff',
    maxWidth: 260,
  },
  locationText: { fontSize: 13 },

  dropdown: {
    position: 'absolute',
    top: 72,
    right: 16,
    width: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    zIndex: 1000,
  },

  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: '#F0F0F0',
  },

  content: { padding: 18 },

  promptWrap: { marginBottom: 6 },
  promptText: { fontSize: 18, fontWeight: '600', color: '#111827' },


  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#EEF0F3',
  },

  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 13, color: '#6B7280' },

  locationFooter: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 4,
    fontWeight: '500',
  },
  footerSmall: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
});