import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Image } from 'expo-image';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { UNIVERSITIES } from '@/constants/universities';

const UNIVERSITY_STORAGE_KEY = 'selected_university';
const CANTEEN_STORAGE_KEY = 'selected_canteen';

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

  const [selectedUniversityId, setSelectedUniversityId] = useState('htw');
  const [selectedCanteenId, setSelectedCanteenId] = useState<string | null>(null);

  const [promptIndex, setPromptIndex] = useState(0);
  const promptOpacity = useRef(new Animated.Value(1)).current;
  const promptTranslateY = useRef(new Animated.Value(0)).current;

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const cardColor = useThemeColor({}, 'surface');
  const headerColor = useThemeColor({}, 'surface');
  const borderColor = useThemeColor({}, 'border');
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');

  const selectedUniversity = useMemo(
      () => UNIVERSITIES.find((u) => u.id === selectedUniversityId) || UNIVERSITIES[0],
      [selectedUniversityId]
  );

  const selectedCanteen = useMemo(() => {
    const availableCanteens = selectedUniversity.canteens || [];
    if (selectedCanteenId) {
      return availableCanteens.find((c) => c.id === selectedCanteenId) || availableCanteens[0];
    }
    return availableCanteens[0];
  }, [selectedCanteenId, selectedUniversity]);

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

  return (
      <ThemedView style={styles.safeArea}>
        <SafeAreaView style={{ flex: 1 }} edges={['top']}>
          {/* HEADER */}
          <View style={[styles.header, { backgroundColor: headerColor, borderColor }]}>
            <View style={styles.brand}>
              <Image
                  source={require('@/assets/images/home-icon.png')}
                  style={styles.logo}
                  contentFit="contain"
              />
              <ThemedText style={styles.brandText}>UniMensa Berlin</ThemedText>
            </View>
          </View>

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
            {([
              { title: 'Tagesmenü', sub: 'Alle Gerichte mit Nährwerten und Allergenen', icon: 'fork.knife', route: '/(tabs)/menu' },
              { title: 'KI-Assistent', sub: 'Personalisierte Empfehlungen', icon: 'sparkles', route: '/(tabs)/ai-assistant' },
              { title: 'Wartezeiten', sub: 'Live-Auslastung der Mensen', icon: 'clock.fill', route: '/(tabs)/waiting-times' },
            ] as const).map((item) => (
                <TouchableOpacity
                    key={item.title}
                    style={[styles.card, { backgroundColor: cardColor, borderColor }]}
                    onPress={() => router.push(item.route as any)}
                >
                  <IconSymbol name={item.icon as any} size={22} color={primaryColor} />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
                    <ThemedText style={[styles.cardSub, { color: textSecondaryColor }]}>{item.sub}</ThemedText>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color={textSecondaryColor} />
                </TouchableOpacity>
            ))}

            {/* Footer mit dynamischem Standort */}
            <View style={{ marginTop: 24, paddingBottom: 20 }}>
              {selectedCanteen && (
                  <ThemedText style={[styles.locationFooter, { color: textSecondaryColor }]}>
                    📍 {selectedCanteen.name}: {selectedCanteen.address}
                  </ThemedText>
              )}
              <ThemedText style={[styles.footerSmall, { color: textSecondaryColor }]}>
                Designed & Created by UniMensa Berlin · Gruppe 04 · HTW · WiSe 25/26
              </ThemedText>
            </View>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },

  header: {
    height: 72,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 52, height: 52 },
  brandText: { fontSize: 18, fontWeight: '700' },

  content: { padding: 18 },

  promptWrap: { marginBottom: 6 },
  promptText: { fontSize: 18, fontWeight: '600' },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
  },

  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardSub: { fontSize: 13 },

  locationFooter: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: '500',
  },
  footerSmall: { fontSize: 12, marginTop: 4 },
});
//