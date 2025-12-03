/**
 * Mensa API Service
 * Handles all API calls to HTW Berlin Mensa backend
 */

import { Menu, Dish } from '@/models';

const API_BASE_URL = 'https://api.htw-mensa.de'; // TODO: Replace with actual API URL

export class MensaApiService {
  /**
   * Fetch daily menu for a specific date
   */
  static async getDailyMenu(date: Date): Promise<Menu> {
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`${API_BASE_URL}/menu/daily/${dateStr}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily menu');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily menu:', error);
      throw error;
    }
  }

  /**
   * Fetch weekly menu
   */
  static async getWeeklyMenu(): Promise<Menu[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/menu/weekly`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch weekly menu');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching weekly menu:', error);
      throw error;
    }
  }

  /**
   * Search dishes by query
   */
  static async searchDishes(query: string): Promise<Dish[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/dishes/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search dishes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error searching dishes:', error);
      throw error;
    }
  }

  /**
   * Get dish details by ID
   */
  static async getDishDetails(dishId: string): Promise<Dish> {
    try {
      const response = await fetch(`${API_BASE_URL}/dishes/${dishId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dish details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dish details:', error);
      throw error;
    }
  }
}
