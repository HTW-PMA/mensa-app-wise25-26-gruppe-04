/**
 * Menu Data Model
 */

import { Dish } from './Dish';

export interface Menu {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'Mittagstisch' | string;
  dishes: Dish[];
  location?: string;
  openingHours?: {
    start: string;
    end: string;
  };
}

export interface WeeklyMenu {
  weekNumber: number;
  year: number;
  menus: Menu[];
}
