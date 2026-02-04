import { Dish, DishLabel } from '@/models/Dish';

export interface CriterionResult {
  name: string;
  gained: number;
  max: number;
  explanation: string;
}

export interface SustainabilityResult {
  score: number;
  criteria: CriterionResult[];
}

export function calculateSustainabilityScore(dish: Dish): SustainabilityResult {
  const labels = dish.labels ?? [];
  const criteria: CriterionResult[] = [];

  // 1. Basis — always +1
  criteria.push({
    name: 'Basis',
    gained: 1,
    max: 1,
    explanation: 'Jedes Gericht erhält einen Basispunkt.',
  });

  // 2. Ernährungsweise — vegan +3, vegetarisch +2, sonst 0
  const isVegan = labels.includes(DishLabel.VEGAN);
  const isVegetarian = labels.includes(DishLabel.VEGETARIAN);
  let dietGained = 0;
  let dietExplanation = 'Weder vegan noch vegetarisch.';
  if (isVegan) {
    dietGained = 3;
    dietExplanation = 'Vegan: sehr nachhaltige Ernährungsweise.';
  } else if (isVegetarian) {
    dietGained = 2;
    dietExplanation = 'Vegetarisch: nachhaltigere Ernährungsweise.';
  }
  criteria.push({
    name: 'Ernährungsweise',
    gained: dietGained,
    max: 3,
    explanation: dietExplanation,
  });

  // 3. CO₂-Bilanz — ≤500g: +1, ≤1000g: +0.5, >1000g: 0, kein Wert: +0.5
  const co2 = dish.sustainability?.co2Bilanz;
  let co2Gained = 0.5;
  let co2Explanation = 'Keine CO₂-Daten verfügbar (Durchschnittswert).';
  if (co2 != null) {
    if (co2 <= 500) {
      co2Gained = 1;
      co2Explanation = `Niedriger CO₂-Ausstoß (${co2} g).`;
    } else if (co2 <= 1000) {
      co2Gained = 0.5;
      co2Explanation = `Mittlerer CO₂-Ausstoß (${co2} g).`;
    } else {
      co2Gained = 0;
      co2Explanation = `Hoher CO₂-Ausstoß (${co2} g).`;
    }
  }
  criteria.push({
    name: 'CO₂-Bilanz',
    gained: co2Gained,
    max: 1,
    explanation: co2Explanation,
  });

  const sum = criteria.reduce((acc, c) => acc + c.gained, 0);
  const score = Math.min(Math.round(sum), 5);

  return { score: Math.max(score, 1), criteria };
}

export function getScoreColor(score: number): string {
  if (score >= 4) return '#4CAF50';
  if (score === 3) return '#FFC107';
  return '#EF4444';
}

export function getScoreLabel(score: number): string {
  if (score >= 5) return 'Sehr nachhaltig';
  if (score >= 4) return 'Nachhaltig';
  if (score === 3) return 'Durchschnittlich';
  if (score === 2) return 'Weniger nachhaltig';
  return 'Nicht nachhaltig';
}
