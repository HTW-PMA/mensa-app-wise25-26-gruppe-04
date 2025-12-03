/**
 * SustainabilityBadge Component
 * Displays sustainability and quality information
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { HTWColors } from '@/constants/theme';

export enum SustainabilityLevel {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

interface SustainabilityInfo {
  level: SustainabilityLevel;
  regional: boolean;
  organic: boolean;
  fairTrade: boolean;
  co2Score?: number;
}

interface SustainabilityBadgeProps {
  info: SustainabilityInfo;
}

export function SustainabilityBadge({ info }: SustainabilityBadgeProps) {
  const getLevelColor = (level: SustainabilityLevel) => {
    switch (level) {
      case SustainabilityLevel.HIGH:
        return HTWColors.success;
      case SustainabilityLevel.MEDIUM:
        return HTWColors.warning;
      case SustainabilityLevel.LOW:
        return HTWColors.error;
    }
  };

  const getLevelText = (level: SustainabilityLevel) => {
    switch (level) {
      case SustainabilityLevel.HIGH:
        return 'Sehr nachhaltig';
      case SustainabilityLevel.MEDIUM:
        return 'Nachhaltig';
      case SustainabilityLevel.LOW:
        return 'Weniger nachhaltig';
    }
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.levelBadge,
          { backgroundColor: getLevelColor(info.level) },
        ]}
      >
        <ThemedText style={styles.levelText}>
          {getLevelText(info.level)}
        </ThemedText>
      </View>

      <View style={styles.attributesContainer}>
        {info.regional && (
          <View style={styles.attribute}>
            <ThemedText style={styles.attributeIcon}>🏞️</ThemedText>
            <ThemedText style={styles.attributeText}>Regional</ThemedText>
          </View>
        )}

        {info.organic && (
          <View style={styles.attribute}>
            <ThemedText style={styles.attributeIcon}>🌾</ThemedText>
            <ThemedText style={styles.attributeText}>Bio</ThemedText>
          </View>
        )}

        {info.fairTrade && (
          <View style={styles.attribute}>
            <ThemedText style={styles.attributeIcon}>🤝</ThemedText>
            <ThemedText style={styles.attributeText}>Fair Trade</ThemedText>
          </View>
        )}

        {info.co2Score !== undefined && (
          <View style={styles.attribute}>
            <ThemedText style={styles.attributeIcon}>🌍</ThemedText>
            <ThemedText style={styles.attributeText}>
              CO₂: {info.co2Score}g
            </ThemedText>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
    paddingVertical: 8,
  },
  levelBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  levelText: {
    color: HTWColors.textInverse,
    fontSize: 12,
    fontWeight: '600',
  },
  attributesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  attribute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: HTWColors.backgroundGray,
    borderRadius: 12,
  },
  attributeIcon: {
    fontSize: 14,
  },
  attributeText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
