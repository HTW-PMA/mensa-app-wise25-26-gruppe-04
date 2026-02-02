import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Dish, DishLabel } from '@/models/Dish';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';

interface DishCardProps {
  dish: Dish;
}

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { name, description, price, labels, category, available } = dish;
  const [isFavorite, setIsFavorite] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const getLabelIcon = (label: DishLabel) => {
    switch (label) {
      case DishLabel.VEGAN:
        return { name: 'leaf.fill', color: theme.success };
      case DishLabel.VEGETARIAN:
        return { name: 'carrot.fill', color: theme.success };
      case DishLabel.ORGANIC:
        return { name: 'o.circle.fill', color: theme.primary };
      case DishLabel.REGIONAL:
        return { name: 'map.fill', color: theme.primary };
      default:
        return { name: 'tag.fill', color: theme.text };
    }
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(2).replace('.', ',') + ' €';
  };

  useEffect(() => {
    checkIfFavorite();
  }, [dish.id]);

  const checkIfFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const favorites: Dish[] = JSON.parse(stored);
        setIsFavorite(favorites.some(fav => fav.id === dish.id));
      }
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const toggleFavorite = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
      let favorites: Dish[] = stored ? JSON.parse(stored) : [];

      if (isFavorite) {
        favorites = favorites.filter(fav => fav.id !== dish.id);
      } else {
        favorites.push(dish);
      }

      await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  if (!available) {
    return (
        <View style={[styles.card, styles.unavailableCard]}>
          <ThemedText style={styles.name} type="subtitle">
            {name}
          </ThemedText>
          <ThemedText style={styles.unavailableText}>
            {category} – Derzeit nicht verfügbar
          </ThemedText>
        </View>
    );
  }

  return (
      <View style={styles.card}>
        <View style={styles.header}>
          <ThemedText style={styles.name} type="subtitle">
            {name}
          </ThemedText>
          <View style={styles.headerRight}>
            <View style={styles.pricesBlock}>
              <View style={styles.priceContainer}>
                <ThemedText style={styles.priceLabel}>Studierende</ThemedText>
                <ThemedText style={styles.priceValue}>{formatPrice(price.student)}</ThemedText>
              </View>
              <View style={styles.priceContainer}>
                <ThemedText style={styles.priceLabel}>Angestellte</ThemedText>
                <ThemedText style={styles.priceValue}>{formatPrice(price.employee)}</ThemedText>
              </View>
              <View style={styles.priceContainer}>
                <ThemedText style={styles.priceLabel}>Gäste</ThemedText>
                <ThemedText style={styles.priceValue}>{formatPrice(price.guest)}</ThemedText>
              </View>
            </View>
            <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
              <IconSymbol
                  name={isFavorite ? 'heart.fill' : 'heart'}
                  size={22}
                  color={isFavorite ? theme.error : theme.icon}
              />
            </TouchableOpacity>
          </View>
        </View>

        {description && (
            <ThemedText style={styles.description}>{description}</ThemedText>
        )}

        <View style={styles.footer}>
          <View style={styles.labelsContainer}>
            {labels?.map((label) => {
              const { name: iconName, color } = getLabelIcon(label);
              return (
                  <View key={label} style={styles.label}>
                    <IconSymbol name={iconName as any} size={14} color={color} />
                    <ThemedText style={[styles.labelText, { color }]}>
                      {label.replace('_', ' ')}
                    </ThemedText>
                  </View>
              );
            })}
          </View>
          <ThemedText style={styles.categoryText}>
            {category.replace('_', ' ')}
          </ThemedText>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 8,
  },
  unavailableCard: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  unavailableText: {
    fontStyle: 'italic',
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pricesBlock: {
    alignItems: 'flex-end',
    gap: 6,
  },
  favoriteButton: {
    padding: 4,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  priceContainer: {
    marginLeft: 10,
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A2540',
  },
  description: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  labelsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  label: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F3F5',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
    gap: 4,
  },
  labelText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  categoryText: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'capitalize',
  },
});