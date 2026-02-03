import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useMenuData } from '@/hooks/useMenuData';
import { Dish, DishLabel } from '@/models/Dish';

const LABEL_CONFIG: Record<string, { icon: React.ComponentProps<typeof MaterialIcons>['name']; text: string }> = {
  [DishLabel.VEGAN]: { icon: 'eco', text: 'Vegan' },
  [DishLabel.VEGETARIAN]: { icon: 'grass', text: 'Vegetarisch' },
  [DishLabel.ORGANIC]: { icon: 'verified', text: 'Bio' },
  [DishLabel.REGIONAL]: { icon: 'location-on', text: 'Regional' },
  [DishLabel.FAIR_TRADE]: { icon: 'handshake', text: 'Fair Trade' },
  [DishLabel.HALAL]: { icon: 'info', text: 'Halal' },
  [DishLabel.KOSHER]: { icon: 'info', text: 'Koscher' },
};

const TIPS = [
  'Pflanzliche Gerichte haben in der Regel einen deutlich niedrigeren CO\u2082-Fussabdruck als Fleischgerichte.',
  'Regionale Zutaten reduzieren Transportwege und damit den CO\u2082-Ausstoss.',
  'Bio-Produkte werden ohne synthetische Pestizide und Duenger hergestellt.',
  'Saisonales Gemuese spart Energie, da es nicht aus beheizten Gewaechshaeusern stammt.',
  'Fair-Trade-Produkte sichern gerechte Loehne fuer Produzenten in Entwicklungslaendern.',
];

function getDishScore(dish: Dish): number {
  const co2 = dish.sustainability?.co2Bilanz;
  if (co2 != null) {
    if (co2 <= 200) return 5;
    if (co2 <= 500) return 4;
    if (co2 <= 1000) return 3;
    if (co2 <= 1500) return 2;
    return 1;
  }
  const labels = dish.labels ?? [];
  let score = 2;
  if (labels.includes(DishLabel.VEGAN)) score = 5;
  else if (labels.includes(DishLabel.VEGETARIAN)) score = 4;
  if (labels.includes(DishLabel.ORGANIC)) score = Math.min(score + 1, 5);
  if (labels.includes(DishLabel.REGIONAL)) score = Math.min(score + 1, 5);
  return score;
}

function getScoreColor(score: number): string {
  if (score >= 4) return '#4CAF50';
  if (score === 3) return '#FFC107';
  return '#EF4444';
}

export default function SustainabilityScreen() {
  const [locationId, setLocationId] = useState<string | null>(null);
  const [today] = useState(() => new Date());
  const colorScheme = useColorScheme() ?? 'light';
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    AsyncStorage.getItem('selected_university').then((val) => {
      setLocationId(val || 'htw');
    });
  }, []);

  const { menu, loading, error } = useMenuData(today, locationId || 'htw');
  const isReady = locationId !== null;

  const cardColor = useThemeColor({}, 'surface');
  const primaryColor = useThemeColor({}, 'primary');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const successColor = useThemeColor({}, 'success');
  const warningColor = useThemeColor({}, 'warning');

  const dishes = useMemo(() => menu?.dishes ?? [], [menu]);

  const stats = useMemo(() => {
    const withCo2 = dishes.filter((d) => d.sustainability?.co2Bilanz != null);
    const withWater = dishes.filter((d) => d.sustainability?.waterBilanz != null);

    const avgCo2 =
      withCo2.length > 0
        ? withCo2.reduce((sum, d) => sum + (d.sustainability!.co2Bilanz ?? 0), 0) / withCo2.length
        : null;

    const avgWater =
      withWater.length > 0
        ? withWater.reduce((sum, d) => sum + (d.sustainability!.waterBilanz ?? 0), 0) / withWater.length
        : null;

    return { avgCo2, avgWater, totalDishes: dishes.length };
  }, [dishes]);

  const getCo2Color = (value: number) => {
    if (value <= 500) return successColor;
    if (value <= 1500) return warningColor;
    return '#EF4444';
  };

  const renderScoreDots = (score: number) => {
    const color = getScoreColor(score);
    return (
      <View style={styles.dotsContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i <= score ? color : (isDark ? '#3A3A3C' : '#E0E0E0'),
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const renderDishCard = (dish: Dish) => {
    const labels = dish.labels ?? [];
    const co2 = dish.sustainability?.co2Bilanz;
    const water = dish.sustainability?.waterBilanz;
    const score = getDishScore(dish);

    return (
      <View
        key={dish.id}
        style={[styles.dishCard, { backgroundColor: cardColor }]}
      >
        <View style={styles.dishHeader}>
          <ThemedText style={styles.dishName}>{dish.name}</ThemedText>
          {renderScoreDots(score)}
        </View>

        <View style={styles.metricsRow}>
          {co2 != null && (
            <View style={[styles.metricChip, { backgroundColor: getCo2Color(co2) + '18' }]}>
              <MaterialIcons name="public" size={14} color={getCo2Color(co2)} />
              <ThemedText style={[styles.metricValue, { color: getCo2Color(co2) }]}>
                {co2} g CO₂
              </ThemedText>
            </View>
          )}
          {water != null && (
            <View style={[styles.metricChip, { backgroundColor: '#3B82F618' }]}>
              <MaterialIcons name="water-drop" size={14} color="#3B82F6" />
              <ThemedText style={[styles.metricValue, { color: '#3B82F6' }]}>
                {water} L
              </ThemedText>
            </View>
          )}
          {co2 == null && water == null && (
            <ThemedText style={[styles.noData, { color: textSecondaryColor }]}>
              Keine Nachhaltigkeitsdaten verfuegbar
            </ThemedText>
          )}
        </View>

        {labels.length > 0 && (
          <View style={styles.labelsRow}>
            {labels.map((label) => {
              const config = LABEL_CONFIG[label];
              if (!config) return null;
              return (
                <View
                  key={label}
                  style={[styles.label, { backgroundColor: isDark ? '#2C2C2E' : '#F2F3F5' }]}
                >
                  <MaterialIcons name={config.icon} size={14} color={primaryColor} />
                  <ThemedText style={[styles.labelText, { color: primaryColor }]}>
                    {config.text}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Nachhaltigkeit',
          headerBackTitle: 'Zurueck',
        }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {(!isReady || loading) && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color={primaryColor} />
              <ThemedText style={[styles.loadingText, { color: textSecondaryColor }]}>
                Daten werden geladen...
              </ThemedText>
            </View>
          )}

          {isReady && error && !loading && (
            <View style={styles.center}>
              <MaterialIcons name="warning" size={32} color="#EF4444" />
              <ThemedText style={styles.errorText}>
                Fehler beim Laden der Daten
              </ThemedText>
            </View>
          )}

          {isReady && !loading && !error && (
            <>
              {/* Hero Banner */}
              <View style={[styles.heroBanner, { backgroundColor: isDark ? '#1A2E0A' : '#F0F9E8' }]}>
                <MaterialIcons name="eco" size={48} color={primaryColor} />
                <ThemedText style={styles.heroTitle}>Nachhaltigkeit</ThemedText>
                <ThemedText style={[styles.heroSubtitle, { color: textSecondaryColor }]}>
                  {stats.totalDishes} Gerichte heute verfuegbar
                </ThemedText>
              </View>

              {/* Statistics Cards */}
              <View style={styles.statsRow}>
                <View style={[styles.statCard, { backgroundColor: isDark ? '#0A2E1A' : '#ECFDF5' }]}>
                  <MaterialIcons name="public" size={28} color={primaryColor} />
                  <ThemedText style={[styles.statValue, { color: primaryColor }]}>
                    {stats.avgCo2 != null ? `${Math.round(stats.avgCo2)} g` : '–'}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                    CO₂-Durchschnitt
                  </ThemedText>
                </View>

                <View style={[styles.statCard, { backgroundColor: isDark ? '#0A1A2E' : '#EFF6FF' }]}>
                  <MaterialIcons name="water-drop" size={28} color="#3B82F6" />
                  <ThemedText style={[styles.statValue, { color: '#3B82F6' }]}>
                    {stats.avgWater != null ? `${Math.round(stats.avgWater)} L` : '–'}
                  </ThemedText>
                  <ThemedText style={[styles.statLabel, { color: textSecondaryColor }]}>
                    Wasser-Fussabdruck
                  </ThemedText>
                </View>
              </View>

              {/* Dish List */}
              <ThemedText style={styles.sectionTitle}>Gerichte</ThemedText>
              {dishes.length === 0 ? (
                <ThemedText style={[styles.emptyText, { color: textSecondaryColor }]}>
                  Heute sind keine Gerichte verfuegbar.
                </ThemedText>
              ) : (
                dishes.map(renderDishCard)
              )}

              {/* Tips Section */}
              <ThemedText style={styles.sectionTitle}>Tipps</ThemedText>
              {TIPS.map((tip, index) => (
                <View
                  key={index}
                  style={[styles.tipCard, { backgroundColor: isDark ? '#2E2A0A' : '#FFFBEB' }]}
                >
                  <MaterialIcons name="lightbulb" size={20} color="#F59E0B" />
                  <ThemedText style={styles.tipText}>{tip}</ThemedText>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 48 },

  center: { alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14 },
  errorText: { fontSize: 15, color: '#EF4444' },

  // Hero Banner
  heroBanner: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 28,
    gap: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 14,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 18,
    padding: 20,
    gap: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Section
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 28,
    marginBottom: 14,
  },

  // Dish cards
  dishCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  dishHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dishName: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  metricChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  noData: {
    fontSize: 13,
    fontStyle: 'italic',
  },

  labelsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  labelText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // Tips
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 20,
  },

  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
