import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Dish, DishLabel } from '@/models/Dish';
import { ThemedText } from './themed-text';
import { HTWColors } from '@/constants/theme';
import { IconSymbol } from './ui/icon-symbol';

interface DishCardProps {
  dish: Dish;
}

const getLabelIcon = (label: DishLabel) => {
  switch (label) {
    case DishLabel.VEGAN:
      return { name: 'leaf.fill', color: HTWColors.success };
    case DishLabel.VEGETARIAN:
      return { name: 'carrot.fill', color: HTWColors.success };
    case DishLabel.ORGANIC:
      return { name: 'o.circle.fill', color: HTWColors.primary };
    case DishLabel.REGIONAL:
      return { name: 'map.fill', color: HTWColors.primary };
    default:
      return { name: 'tag.fill', color: HTWColors.text };
  }
};

const formatPrice = (price: number) => {
  return (price / 100).toFixed(2).replace('.', ',') + ' €';
};

export const DishCard: React.FC<DishCardProps> = ({ dish }) => {
  const { name, description, price, labels, category, available } = dish;

  if (!available) {
    return (
      <View style={[styles.card, styles.unavailableCard]}>
        <ThemedText style={styles.name} type="subtitle">
          {name}
        </ThemedText>
        <ThemedText style={styles.unavailableText}>
          {category} - Derzeit nicht verfügbar
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
        <View style={styles.priceContainer}>
          <ThemedText style={styles.priceLabel}>Studierende:</ThemedText>
          <ThemedText style={styles.priceValue}>{formatPrice(price.student)}</ThemedText>
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
                <IconSymbol name={iconName} size={14} color={color} />
                <ThemedText style={[styles.labelText, { color }]}>
                  {label.replace('_', ' ')}
                </ThemedText>
              </View>
            );
          })}
        </View>
        <ThemedText style={styles.categoryText}>{category.replace('_', ' ')}</ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: HTWColors.backgroundGray,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    gap: 8,
  },
  unavailableCard: {
    opacity: 0.6,
    borderLeftWidth: 4,
    borderLeftColor: HTWColors.error,
  },
  unavailableText: {
    fontStyle: 'italic',
    color: HTWColors.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    color: HTWColors.textLight,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: HTWColors.primary,
  },
  description: {
    fontSize: 14,
    color: HTWColors.textLight,
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
    backgroundColor: HTWColors.background,
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
    color: HTWColors.textLight,
    textTransform: 'capitalize',
  },
});
