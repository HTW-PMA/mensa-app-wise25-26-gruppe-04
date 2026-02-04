import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MensaApiService } from '../api/mensaApi';

const FAVORITES_STORAGE_KEY = '@mensa_app_favorites';
const STORAGE_KEY = '@mensa_app_preferences';

/** Returns true when running inside Expo Go (where push notifications are unsupported since SDK 53). */
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Ensure notification permissions are granted (needed for both local and push notifications).
 * Returns true if permissions are granted.
 */
async function ensureNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#76B900',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Request notification permissions and register for push notifications.
 * Push token registration is skipped in Expo Go (unsupported since SDK 53).
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  const granted = await ensureNotificationPermissions();
  if (!granted) {
    console.log('Benachrichtigungen wurden nicht erlaubt.');
    return;
  }

  // Push token registration is not supported in Expo Go since SDK 53
  if (isExpoGo) {
    console.log('Push token registration skipped in Expo Go. Local notifications still work.');
    return;
  }

  if (Device.isDevice) {
    const token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push token:', token);
    return token;
  }

  console.log('Push-Benachrichtigungen funktionieren nur auf echten Geräten.');
  return;
}

/**
 * Schedule daily notification to check for favorite dishes
 */
export async function scheduleDailyFavoriteCheck() {
  try {
    // Cancel all previous notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    // Check if notifications are enabled
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const preferences = JSON.parse(stored);
    if (!preferences.notificationsEnabled) return;

    // Schedule daily notification at 9:00 AM
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'HTW Mensa 🍽️',
        body: 'Prüfe, ob deine Lieblingsspeisen heute verfügbar sind!',
        data: { type: 'daily_check' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });

    console.log('Daily notification scheduled');
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
}

/**
 * Check if favorite dishes are available today and send notification
 */
export async function checkAndNotifyFavorites() {
  try {
    // Check if notifications are enabled
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    
    const preferences = JSON.parse(stored);
    if (!preferences.notificationsEnabled) return;

    // Get favorites
    const favoritesStored = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!favoritesStored) return;
    
    const favorites = JSON.parse(favoritesStored);
    if (favorites.length === 0) return;

    // Get today's menu
    const menu = await MensaApiService.getDailyMenu(new Date());
    if (!menu || menu.dishes.length === 0) return;

    // Check for matching dishes
    const matchingDishes = menu.dishes.filter((dish: { name: string }) =>
      favorites.some((fav: { name: string }) => fav.name === dish.name)
    );

    if (matchingDishes.length > 0) {
      const dishNames = matchingDishes.map((d: { name: string }) => d.name).join(', ');
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Deine Lieblingsspeisen sind da! 🎉',
          body: `Heute in der Mensa: ${dishNames}`,
          data: { type: 'favorite_available', dishes: matchingDishes },
        },
        trigger: null, // Send immediately
      });

      console.log('Favorite notification sent:', dishNames);
    }
  } catch (error) {
    console.error('Error checking favorites:', error);
  }
}

/**
 * Send test notification (local – works in Expo Go too).
 * Throws if permissions are missing so callers can show an error.
 */
export async function sendTestNotification() {
  const granted = await ensureNotificationPermissions();
  if (!granted) {
    throw new Error('Benachrichtigungen wurden nicht erlaubt. Bitte in den Geräte-Einstellungen aktivieren.');
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Test-Benachrichtigung 🔔',
      body: 'Push-Benachrichtigungen funktionieren!',
      data: { type: 'test' },
    },
    trigger: null, // Send immediately
  });
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('All notifications cancelled');
  } catch (error) {
    console.error('Error cancelling notifications:', error);
  }
}

export default {
  registerForPushNotificationsAsync,
  scheduleDailyFavoriteCheck,
  checkAndNotifyFavorites,
  sendTestNotification,
  cancelAllNotifications,
};
