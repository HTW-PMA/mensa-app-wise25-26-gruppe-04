import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UNIVERSITIES } from '@/constants/universities';
import { useUserPreferences } from '@/hooks/useUserPreferences';

const UNIVERSITY_STORAGE_KEY = 'selected_university';
const CANTEEN_STORAGE_KEY = 'selected_canteen';
const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';

const PROMPTS = [
  'Was moechtest du heute essen?',
  'Lust auf etwas Warmes?',
  'Vegan, Halal oder klassisch?',
  'Was gibt es heute in der Mensa?',
  'Heute eher leicht oder deftig?',
  'Suchst du etwas ohne Allergene?',
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 17) return 'Guten Tag';
  return 'Guten Abend';
}

function getDateString(): string {
  const d = new Date();
  const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  const months = ['Januar', 'Februar', 'Maerz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
  return `${days[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]}`;
}

type FeatureItem = {
  title: string;
  sub: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  route: string;
  color: string;
  bgLight: string;
  bgDark: string;
};

const FEATURES: FeatureItem[] = [
  {
    title: 'Tagesmenue',
    sub: 'Gerichte, Naehrwerte & Allergene',
    icon: 'restaurant-menu',
    route: '/(tabs)/menu',
    color: '#22C55E',
    bgLight: '#F0FDF4',
    bgDark: '#0A2E1A',
  },
  {
    title: 'KI-Assistent',
    sub: 'Personalisierte Empfehlungen',
    icon: 'auto-awesome',
    route: '/(tabs)/ai-assistant',
    color: '#8B5CF6',
    bgLight: '#F5F3FF',
    bgDark: '#1E1533',
  },
  {
    title: 'Wartezeiten',
    sub: 'Live-Auslastung der Mensen',
    icon: 'schedule',
    route: '/(tabs)/waiting-times',
    color: '#F59E0B',
    bgLight: '#FFFBEB',
    bgDark: '#2A1F0A',
  },
  {
    title: 'Favoriten',
    sub: 'Deine gespeicherten Gerichte',
    icon: 'favorite',
    route: '/(tabs)/favorites',
    color: '#EF4444',
    bgLight: '#FEF2F2',
    bgDark: '#2D1A1A',
  },
];

const QUICK_ACTIONS: { title: string; icon: React.ComponentProps<typeof MaterialIcons>['name']; route: string; color: string }[] = [
  { title: 'Nachhaltigkeit', icon: 'eco', route: '/sustainability', color: '#22C55E' },
  { title: 'Einstellungen', icon: 'tune', route: '/(tabs)/settings', color: '#6B7280' },
];

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  const [selectedUniversityId, setSelectedUniversityId] = useState('htw');
  const [selectedCanteenId, setSelectedCanteenId] = useState<string | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const [promptIndex, setPromptIndex] = useState(0);
  const promptOpacity = useRef(new Animated.Value(1)).current;
  const promptTranslateY = useRef(new Animated.Value(0)).current;

  const prefs = useUserPreferences();
  const activeFiltersCount = prefs.dietaryRestrictions.length + prefs.allergens.length;

  // Theme colors
  const surfaceColor = useThemeColor({}, 'surface');
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const borderColor = useThemeColor({}, 'border');

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

  // Load saved selection
  useEffect(() => {
    const loadSelection = async () => {
      try {
        const [savedUni, savedCanteen] = await Promise.all([
          AsyncStorage.getItem(UNIVERSITY_STORAGE_KEY),
          AsyncStorage.getItem(CANTEEN_STORAGE_KEY),
        ]);
        if (savedUni) setSelectedUniversityId(savedUni);
        if (savedCanteen) setSelectedCanteenId(savedCanteen);
      } catch {
        // ignore
      }
    };
    loadSelection();
  }, []);

  // Load favorites count on focus
  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem(FAVORITES_STORAGE_KEY).then((raw) => {
        if (raw) {
          try { setFavoritesCount(JSON.parse(raw).length); } catch { setFavoritesCount(0); }
        } else {
          setFavoritesCount(0);
        }
      });
    }, [])
  );

  // Animated prompt rotation
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
        setPromptIndex((i) => (i + 1) % PROMPTS.length);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

          {/* Header with logo + greeting */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image
                source={require('@/assets/images/home-icon.png')}
                style={styles.logo}
                contentFit="contain"
              />
              <View>
                <ThemedText style={styles.brandName}>UniMensa</ThemedText>
                <ThemedText style={[styles.dateText, { color: textSecondaryColor }]}>
                  {getDateString()}
                </ThemedText>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.settingsBtn, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}
              onPress={() => router.push('/(tabs)/settings' as any)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="tune" size={20} color={primaryColor} />
              {activeFiltersCount > 0 && (
                <View style={styles.filterBadge}>
                  <ThemedText style={styles.filterBadgeText}>{activeFiltersCount}</ThemedText>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Greeting + Animated Prompt */}
          <View style={styles.greetingSection}>
            <ThemedText style={styles.greeting}>{getGreeting()}</ThemedText>
            <Animated.View
              style={[
                styles.promptWrap,
                { opacity: promptOpacity, transform: [{ translateY: promptTranslateY }] },
              ]}
            >
              <ThemedText style={[styles.promptText, { color: textSecondaryColor }]}>{PROMPTS[promptIndex]}</ThemedText>
            </Animated.View>
          </View>

          {/* Location Card */}
          {selectedCanteen && (
            <TouchableOpacity
              style={[styles.locationCard, { backgroundColor: isDark ? '#1C1C1E' : surfaceColor }]}
              onPress={() => router.push('/(tabs)/menu' as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.locationIconCircle, { backgroundColor: isDark ? '#0A2E1A' : '#F0FDF4' }]}>
                <MaterialIcons name="location-on" size={22} color="#22C55E" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.locationName}>{selectedCanteen.name}</ThemedText>
                <ThemedText style={[styles.locationAddress, { color: textSecondaryColor }]}>
                  {selectedCanteen.address}
                </ThemedText>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={textSecondaryColor} />
            </TouchableOpacity>
          )}

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
              <MaterialIcons name="favorite" size={18} color="#EF4444" />
              <ThemedText style={styles.statValue}>{favoritesCount}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>Favoriten</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
              <MaterialIcons name="filter-list" size={18} color="#8B5CF6" />
              <ThemedText style={styles.statValue}>{activeFiltersCount}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>Filter aktiv</ThemedText>
            </View>
            <View style={[styles.statCard, { backgroundColor: isDark ? '#1C1C1E' : '#F2F3F5' }]}>
              <MaterialIcons name="school" size={18} color="#3B82F6" />
              <ThemedText style={styles.statValue}>{selectedUniversity.canteens.length}</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>Mensen</ThemedText>
            </View>
          </View>

          {/* Feature Cards */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Funktionen</ThemedText>
          </View>

          <View style={styles.featureGrid}>
            {FEATURES.map((item) => (
              <TouchableOpacity
                key={item.title}
                style={[styles.featureCard, { backgroundColor: isDark ? '#1C1C1E' : surfaceColor }]}
                onPress={() => router.push(item.route as any)}
                activeOpacity={0.7}
              >
                <View style={[styles.featureIconCircle, { backgroundColor: isDark ? item.bgDark : item.bgLight }]}>
                  <MaterialIcons name={item.icon} size={24} color={item.color} />
                </View>
                <ThemedText style={styles.featureTitle}>{item.title}</ThemedText>
                <ThemedText style={[styles.featureSub, { color: textSecondaryColor }]} numberOfLines={2}>
                  {item.sub}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Schnellzugriff</ThemedText>
          </View>

          {QUICK_ACTIONS.map((action) => (
            <TouchableOpacity
              key={action.title}
              style={[styles.quickAction, { backgroundColor: isDark ? '#1C1C1E' : surfaceColor }]}
              onPress={() => router.push(action.route as any)}
              activeOpacity={0.7}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: isDark ? '#2C2C2E' : '#F2F3F5' }]}>
                <MaterialIcons name={action.icon} size={20} color={action.color} />
              </View>
              <ThemedText style={styles.quickActionText}>{action.title}</ThemedText>
              <MaterialIcons name="chevron-right" size={18} color={textSecondaryColor} />
            </TouchableOpacity>
          ))}

          {/* Info Card */}
          <View style={[styles.infoCard, { backgroundColor: isDark ? '#1A2A3D' : '#EFF6FF', borderColor: isDark ? '#1E3A5F' : '#DBEAFE' }]}>
            <MaterialIcons name="info-outline" size={18} color="#3B82F6" />
            <ThemedText style={[styles.infoText, { color: textSecondaryColor }]}>
              Alle Gerichte werden taeglich von der Mensa-API aktualisiert. Allergene werden automatisch erkannt.
            </ThemedText>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={[styles.footerDivider, { backgroundColor: borderColor }]} />
            <ThemedText style={[styles.footerText, { color: textSecondaryColor }]}>
              UniMensa Berlin  ·  Gruppe 04  ·  HTW  ·  WiSe 25/26
            </ThemedText>
          </View>

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 30 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: { width: 46, height: 46 },
  brandName: { fontSize: 20, fontWeight: '800' },
  dateText: { fontSize: 13, marginTop: 1 },
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },

  // Greeting + Prompt
  greetingSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  greeting: { fontSize: 22, fontWeight: '700' },
  promptWrap: {
    marginTop: 4,
    minHeight: 24,
  },
  promptText: { fontSize: 15 },

  // Location card
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  locationIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationName: { fontSize: 15, fontWeight: '700' },
  locationAddress: { fontSize: 12, marginTop: 1 },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 3,
  },
  statValue: { fontSize: 18, fontWeight: '700' },
  statLabel: { fontSize: 10, fontWeight: '500' },

  // Section header
  sectionHeader: {
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '700' },

  // Feature grid (2x2)
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  featureCard: {
    width: '48%',
    flexBasis: '48%',
    borderRadius: 18,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTitle: { fontSize: 15, fontWeight: '700', marginTop: 2 },
  featureSub: { fontSize: 12, lineHeight: 16 },

  // Quick actions
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  quickIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: { fontSize: 15, fontWeight: '600', flex: 1 },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginHorizontal: 16,
    marginTop: 20,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  infoText: { fontSize: 12, flex: 1, lineHeight: 17 },

  // Footer
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 8,
    gap: 10,
  },
  footerDivider: {
    width: 40,
    height: 3,
    borderRadius: 2,
  },
  footerText: { fontSize: 11, fontWeight: '500' },
});
