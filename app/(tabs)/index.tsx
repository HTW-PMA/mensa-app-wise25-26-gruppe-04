import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, UniColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const LOCATION_STORAGE_KEY = '@mensa_location';

const PROMPTS = [
  'Was möchtest du heute essen?',
  'Lust auf etwas Warmes?',
  'Vegan, Halal oder klassisch?',
  'Was gibt es heute in der Mensa?',
  'Heute eher leicht oder deftig?',
  'Suchst du etwas ohne Allergene?',
];

const LOCATIONS = [
  { id: 'fu', name: 'Freie Universität Berlin (FU)', address: 'Königin-Luise-Straße 24, 14195 Berlin' },
  { id: 'hu', name: 'Humboldt-Universität zu Berlin (HU)', address: 'Unter den Linden 6, 10117 Berlin' },
  { id: 'tu', name: 'Technische Universität Berlin (TU)', address: 'Straße des 17. Juni 135, 10623 Berlin' },
  { id: 'udk', name: 'Universität der Künste Berlin (UdK)', address: 'Einsteinufer 43, 10587 Berlin' },
  { id: 'charite', name: 'Charité – Universitätsmedizin Berlin', address: 'Charitéplatz 1, 10117 Berlin' },
  { id: 'bht', name: 'Berliner Hochschule für Technik (BHT)', address: 'Luxemburger Straße 10, 13353 Berlin' },
  { id: 'htw', name: 'Hochschule für Technik und Wirtschaft (HTW)', address: 'Wilhelminenhofstraße 75A, 12459 Berlin' },
  { id: 'hwr', name: 'Hochschule für Wirtschaft und Recht (HWR)', address: 'Alt-Friedrichsfelde 60, 10315 Berlin' },
  { id: 'ash', name: 'Alice Salomon Hochschule (ASH)', address: 'Alice-Salomon-Platz 5, 12627 Berlin' },
  { id: 'ehb', name: 'Evangelische Hochschule Berlin (EHB)', address: 'Teltower Damm 118–122, 14167 Berlin' },
  { id: 'khsb', name: 'Katholische Hochschule für Sozialwesen Berlin (KHSB)', address: 'Köpenicker Allee 39–57, 10318 Berlin' },
];

type Filters = {
  price: boolean;
  allergens: boolean;
  vegan: boolean;
  vegetarian: boolean;
  halal: boolean;
};

export default function HomeScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = Colors[scheme];

  const [locationOpen, setLocationOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState('htw');
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<Filters>({
    price: false,
    allergens: false,
    vegan: false,
    vegetarian: false,
    halal: false,
  });

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

  const toggleFilter = (key: keyof Filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
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

          {/* Search */}
          <View style={styles.search}>
            <IconSymbol name="magnifyingglass" size={16} color="#9CA3AF" />
            <TextInput
                placeholder="Gerichte suchen…"
                value={query}
                onChangeText={setQuery}
                style={styles.searchInput}
                placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Filter Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginVertical: 12 }}>
            {[
              ['price', 'Preis', 'fork.knife'],
              ['allergens', 'Allergene', 'exclamationmark.triangle'],
              ['vegan', 'Vegan', 'leaf.fill'],
              ['vegetarian', 'Vegetarisch', 'carrot'],
              ['halal', 'Halal', 'moon.stars'],
            ].map(([key, label, icon]) => (
                <TouchableOpacity
                    key={key}
                    style={[styles.chip, filters[key as keyof Filters] && styles.chipActive]}
                    onPress={() => toggleFilter(key as keyof Filters)}
                >
                  <IconSymbol
                      name={icon as any}
                      size={14}
                      color={filters[key as keyof Filters] ? UniColors.primary : '#6B7280'}
                  />
                  <ThemedText>{label}</ThemedText>
                </TouchableOpacity>
            ))}
          </ScrollView>

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

          {/* Footer */}
          <View style={{ marginTop: 24 }}>
            <ThemedText style={styles.footerTitle}>Standort</ThemedText>
            <ThemedText style={styles.footerText}>{selectedLocation.address}</ThemedText>
            <ThemedText style={styles.footerSmall}>
              UniMensa Berlin · Gruppe 04 · HTW Berlin · WiSe 25/26
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

  search: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
    ...Platform.select({ web: { outlineStyle: 'none' as any } }),
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
  },

  chipActive: {
    backgroundColor: '#EEF2FF',
    borderColor: '#C7D2FE',
  },

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

  footerTitle: { fontWeight: '700', marginBottom: 4 },
  footerText: { color: '#6B7280' },
  footerSmall: { color: '#9CA3AF', fontSize: 12, marginTop: 12 },
});