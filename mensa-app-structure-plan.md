# Erweiterte Mensa-App Projektstruktur - HTW Berlin

## Analyse der vorhandenen Struktur

Das Projekt ist eine **React Native Expo App** mit:
- TypeScript
- Expo Router (file-based routing)
- React Navigation
- Themed Components
- Tab-basierte Navigation

## Erweiterte Struktur für Mensa-App mit KI-Integration

### Neue Verzeichnisse und Module

#### 1. `/app/(tabs)/` - Erweiterte Screens
- **menu.tsx** - Menüplan-Ansicht (Tagesmenü, Wochenplan)
- **favorites.tsx** - Favoriten und gespeicherte Gerichte
- **ai-assistant.tsx** - KI-Assistent für Ernährungsberatung
- **settings.tsx** - Einstellungen (Allergien, Präferenzen)

#### 2. `/services/` - Backend-Services
- **api/mensaApi.ts** - API-Calls zur HTW Mensa
- **ai/aiService.ts** - KI-Integration (OpenAI/Gemini)
- **storage/localStorage.ts** - Lokale Datenspeicherung
- **notifications/notificationService.ts** - Push-Benachrichtigungen

#### 3. `/models/` - Datenmodelle
- **Menu.ts** - Menü-Datenstruktur
- **Dish.ts** - Gericht-Datenstruktur
- **UserPreferences.ts** - Nutzereinstellungen
- **AIResponse.ts** - KI-Antwort-Struktur

#### 4. `/components/mensa/` - Mensa-spezifische Komponenten
- **MenuCard.tsx** - Karte für einzelnes Gericht
- **DailyMenu.tsx** - Tagesmenü-Komponente
- **WeeklyCalendar.tsx** - Wochenkalender
- **NutritionInfo.tsx** - Nährwertinformationen
- **AllergenBadge.tsx** - Allergen-Badges
- **PriceTag.tsx** - Preisanzeige (Student/Mitarbeiter/Gast)

#### 5. `/components/ai/` - KI-Komponenten
- **ChatInterface.tsx** - Chat-Interface für KI
- **RecommendationCard.tsx** - Empfehlungskarten
- **NutritionAnalysis.tsx** - Ernährungsanalyse-Anzeige
- **VoiceInput.tsx** - Spracheingabe-Komponente

#### 6. `/hooks/` - Custom Hooks
- **useMenuData.ts** - Hook für Menüdaten
- **useAIChat.ts** - Hook für KI-Chat
- **useFavorites.ts** - Hook für Favoriten
- **useUserPreferences.ts** - Hook für Nutzereinstellungen

#### 7. `/utils/` - Hilfsfunktionen
- **dateHelpers.ts** - Datums-Hilfsfunktionen
- **nutritionCalculator.ts** - Nährwertberechnungen
- **allergenFilter.ts** - Allergen-Filterung
- **priceCalculator.ts** - Preisberechnungen

#### 8. `/config/` - Konfiguration
- **api.config.ts** - API-Konfiguration
- **ai.config.ts** - KI-Konfiguration
- **theme.config.ts** - Theme-Konfiguration
- **constants.ts** - App-Konstanten

#### 9. `/types/` - TypeScript-Typen
- **index.d.ts** - Globale Type Definitions
- **api.types.ts** - API-Typen
- **navigation.types.ts** - Navigation-Typen

### KI-Integration Features

1. **Ernährungsberatung**
   - Personalisierte Empfehlungen basierend auf Präferenzen
   - Nährwertanalyse
   - Allergenwarnungen

2. **Intelligente Suche**
   - Natürlichsprachliche Suche ("Zeig mir vegetarische Gerichte unter 500 Kalorien")
   - Bildererkennung für Gerichte

3. **Chatbot**
   - Fragen zu Zutaten
   - Öffnungszeiten
   - Menüinformationen

4. **Personalisierung**
   - Lernende Präferenzen
   - Vorschläge basierend auf Essgewohnheiten

### Plattform-Kompatibilität

- **Xcode**: iOS-Entwicklung via Expo
- **IntelliJ IDEA**: Android-Entwicklung + Code-Editing
- **Expo Go**: Schnelles Testen auf beiden Plattformen
