import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dish } from '@/models/Dish';
import { DishCard } from '@/components/dish-card';
import { useFocusEffect } from '@react-navigation/native';

const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Reload favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const favs: Dish[] = JSON.parse(stored);
        setFavorites(favs);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Favoriten</ThemedText>
        <ThemedText>Ihre gespeicherten Gerichte</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.content}>
        {isLoading ? (
          <ThemedText>Lade Favoriten...</ThemedText>
        ) : favorites.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={styles.emptyText}>
              Noch keine Favoriten gespeichert
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Tippe auf das Herz-Symbol bei einem Gericht, um es zu deinen Favoriten hinzuzufügen.
            </ThemedText>
          </View>
        ) : (
          favorites.map((dish) => (
            <DishCard key={dish.id} dish={dish} />
          ))
        )}
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
  content: {
    padding: 20,
    gap: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});
