import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Dish, DishLabel } from '@/models/Dish';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';

interface DishCardProps {
  dish: Dish;
}

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { name, description, price, labels, category, available } = dish;
  const [isFavorite, setIsFavorite] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const theme = Colors[colorScheme];

  const surfaceColor = useThemeColor({}, 'surface');
  const textSecondaryColor = useThemeColor({}, 'textSecondary');
  const primaryColor = useThemeColor({}, 'primary');
  const labelBgColor = useThemeColor({ light: '#F2F3F5', dark: '#2C2C2E' }, 'background');

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
        <View style={[styles.card, styles.unavailableCard, { backgroundColor: surfaceColor }]}>
          <ThemedText style={styles.name} type="subtitle">
            {name}
          </ThemedText>
          <ThemedText style={[styles.unavailableText, { color: textSecondaryColor }]}>
            {category} – Derzeit nicht verfügbar
          </ThemedText>
        </View>
    );
  }

  return (
      <View style={[styles.card, { backgroundColor: surfaceColor }]}>
        <View style={styles.header}>
          <ThemedText style={styles.name} type="subtitle">
            {name}
          </ThemedText>
          <View style={styles.headerRight}>
            <View style={styles.pricesBlock}>
              <View style={styles.priceContainer}>
                <ThemedText style={[styles.priceLabel, { color: textSecondaryColor }]}>Studierende</ThemedText>
                <ThemedText style={[styles.priceValue, { color: primaryColor }]}>{formatPrice(price.student)}</ThemedText>
              </View>
              <View style={styles.priceContainer}>
                <ThemedText style={[styles.priceLabel, { color: textSecondaryColor }]}>Angestellte</ThemedText>
                <ThemedText style={[styles.priceValue, { color: primaryColor }]}>{formatPrice(price.employee)}</ThemedText>
              </View>
              <View style={styles.priceContainer}>
                <ThemedText style={[styles.priceLabel, { color: textSecondaryColor }]}>Gäste</ThemedText>
                <ThemedText style={[styles.priceValue, { color: primaryColor }]}>{formatPrice(price.guest)}</ThemedText>
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
            <ThemedText style={[styles.description, { color: textSecondaryColor }]}>{description}</ThemedText>
        )}

        <View style={styles.footer}>
          <View style={styles.labelsContainer}>
            {labels?.map((label) => {
              const { name: iconName, color } = getLabelIcon(label);
              return (
                  <View key={label} style={[styles.label, { backgroundColor: labelBgColor }]}>
                    <IconSymbol name={iconName as any} size={14} color={color} />
                    <ThemedText style={[styles.labelText, { color }]}>
                      {label.replace('_', ' ')}
                    </ThemedText>
                  </View>
              );
            })}
          </View>
          <ThemedText style={[styles.categoryText, { color: textSecondaryColor }]}>
            {category.replace('_', ' ')}
          </ThemedText>
        </View>
      </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    gap: 8,
    marginBottom: 12,
  },
  unavailableCard: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  unavailableText: {
    fontStyle: 'italic',
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
    fontSize: 10,
  },
  priceValue: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
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
    textTransform: 'capitalize',
  },
});
