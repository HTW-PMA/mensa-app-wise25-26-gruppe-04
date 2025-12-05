/**
 * Mensa API Service
 * Handles all API calls to HTW Berlin Mensa backend
 */

import { Menu, Dish } from '@/models';

const API_BASE_URL = 'https://mensa.gregorflachs.de/lylDptJVKMnASYr0Equ4Wk3lAtHdSmKBcuVHRL5h3Czlj6/BllEEo58Imkbj5M3f+wJwbnkLTMEEM/UHsRlPUSfCMfaf8Bi0zGYzuIAWbGnUtJNFs3f9j1LvJzJy6x+bNuvMqi5h632L2MdJ81NXnfnb1gI12bKtKxLqFTNAHmHLiEx72uh0uATs0xyrewHOujMv9JFIqfdjFIi3YCT0+6zMmkS6pedLvilyMJLy9f/BCMd2Ow7+3rEMbXjuLMJ6lXGofPbt3S1KILzZ7XrxVCxNpye9WSCj1KQdjceLyjX1CPqbXhiexhoTo3lcgQsCTy9S11G5NuAvgtrSMYx4hg==\n' +
    '\n'; // TODO: Replace with actual API URL

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
