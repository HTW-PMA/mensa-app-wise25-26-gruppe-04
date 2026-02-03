/**
 * RatingCard Component
 * Displays ratings and reviews for dishes
 */

import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useThemeColor } from '@/hooks/use-theme-color';

interface Rating {
  id: string;
  dishId: string;
  userName: string;
  rating: number;
  comment?: string;
  date: Date;
}

interface RatingCardProps {
  rating: Rating;
}

export function RatingCard({ rating }: RatingCardProps) {
  const primaryColor = useThemeColor({}, 'primary');
  const borderColor = useThemeColor({}, 'border');
  const warningColor = useThemeColor({}, 'warning');

  const renderStars = (count: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <ThemedText key={index} style={[styles.star, { color: warningColor }]}>
        {index < count ? '\u2605' : '\u2606'}
      </ThemedText>
    ));
  };

  return (
    <ThemedView style={[styles.card, { borderColor }]}>
      <View style={styles.header}>
        <View style={styles.userInfo}>
          <View style={[styles.avatar, { backgroundColor: primaryColor }]}>
            <ThemedText style={styles.avatarText}>
              {rating.userName.charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View>
            <ThemedText style={styles.userName}>{rating.userName}</ThemedText>
            <ThemedText style={styles.date}>
              {rating.date.toLocaleDateString('de-DE')}
            </ThemedText>
          </View>
        </View>
        <View style={styles.starsContainer}>{renderStars(rating.rating)}</View>
      </View>

      {rating.comment && (
        <ThemedText style={styles.comment}>{rating.comment}</ThemedText>
      )}
    </ThemedView>
  );
}

interface RatingSummaryProps {
  averageRating: number;
  totalRatings: number;
  onPress?: () => void;
}

export function RatingSummary({
  averageRating,
  totalRatings,
  onPress,
}: RatingSummaryProps) {
  const warningColor = useThemeColor({}, 'warning');

  const renderStars = (count: number) => {
    const fullStars = Math.floor(count);
    const hasHalfStar = count % 1 >= 0.5;

    return Array.from({ length: 5 }, (_, index) => {
      if (index < fullStars) {
        return <ThemedText key={index} style={[styles.star, { color: warningColor }]}>{'\u2605'}</ThemedText>;
      } else if (index === fullStars && hasHalfStar) {
        return <ThemedText key={index} style={[styles.star, { color: warningColor }]}>{'\u2BE8'}</ThemedText>;
      } else {
        return <ThemedText key={index} style={[styles.star, { color: warningColor }]}>{'\u2606'}</ThemedText>;
      }
    });
  };

  return (
    <Pressable onPress={onPress}>
      <View style={styles.summaryContainer}>
        <View style={styles.starsContainer}>{renderStars(averageRating)}</View>
        <ThemedText style={styles.ratingText}>
          {averageRating.toFixed(1)} ({totalRatings} Bewertungen)
        </ThemedText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  star: {
    fontSize: 18,
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  summaryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  ratingText: {
    fontSize: 14,
    opacity: 0.7,
  },
});
