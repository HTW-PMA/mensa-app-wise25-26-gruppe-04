/**
 * Dish Data Model
 */

export interface Dish {
  id: string;
  name: string;
  description?: string;
  category: DishCategory;
  price: {
    student: number;
    employee: number;
    guest: number;
  };
  nutrition?: NutritionInfo;
  allergens?: Allergen[];
  ingredients?: string[];
  labels?: DishLabel[];
  imageUrl?: string;
  available: boolean;
}

export enum DishCategory {
  MAIN_COURSE = 'main_course',
  SIDE_DISH = 'side_dish',
  SOUP = 'soup',
  SALAD = 'salad',
  DESSERT = 'dessert',
  BEVERAGE = 'beverage',
}

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  salt?: number;
}

export enum Allergen {
  GLUTEN = 'gluten',
  CRUSTACEANS = 'crustaceans',
  EGGS = 'eggs',
  FISH = 'fish',
  PEANUTS = 'peanuts',
  SOYBEANS = 'soybeans',
  MILK = 'milk',
  NUTS = 'nuts',
  CELERY = 'celery',
  MUSTARD = 'mustard',
  SESAME = 'sesame',
  SULPHITES = 'sulphites',
  LUPIN = 'lupin',
  MOLLUSCS = 'molluscs',
}

export enum DishLabel {
  VEGETARIAN = 'vegetarian',
  VEGAN = 'vegan',
  ORGANIC = 'organic',
  REGIONAL = 'regional',
  FAIR_TRADE = 'fair_trade',
  HALAL = 'halal',
  KOSHER = 'kosher',
}
