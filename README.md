# UniMensa Berlin - Gruppe 04

Mobile App für Studierende, Mitarbeiter und Gäste der HTW Berlin zum Abrufen von Mensa-Speiseplänen, KI-gestützten Ernährungsempfehlungen und Verwaltung von Ernährungspräferenzen.

## Tech Stack

- **Framework**: React Native 0.81.5 + Expo 54
- **Sprache**: TypeScript 5.9 (strict mode)
- **Navigation**: Expo Router (File-based Routing)
- **State Management**: React Hooks + AsyncStorage
- **KI**: OpenAI GPT-4o-mini (via Backend)

## Features

### Kernfunktionen
- **Menüplan-Ansicht**: Tagesaktuelle Speisepläne aller Berliner Mensen
- **Standort-Auswahl**: HTW (Wilhelminenhof/Treskowallee), TU, HU, FU, Charité und weitere
- **Favoriten**: Speichern und Verwalten von Lieblingsgerichten
- **Preisanzeige**: Unterschiedliche Preise für Studenten, Mitarbeiter und Gäste
- **Allergen-Filter**: Automatische Erkennung von 14 EU-Hauptallergenen
- **Wartezeiten**: Aktuelle Auslastung der Mensen

### KI-Assistent
- Personalisierte Menüempfehlungen basierend auf Präferenzen
- Natürlichsprachliche Fragen zu Gerichten und Nährwerten
- Allergen-Warnungen und Ernährungsberatung

## Projektstruktur

```
├── app/                          # Expo Router Screens
│   └── (tabs)/                   # Tab-basierte Navigation
│       ├── index.tsx             # Home Screen
│       ├── menu.tsx              # Menüplan Screen
│       ├── ai-assistant.tsx      # KI-Assistent Screen
│       ├── favorites.tsx         # Favoriten Screen
│       ├── settings.tsx          # Einstellungen Screen
│       └── waiting-times.tsx     # Wartezeiten Screen
├── components/                   # React Komponenten
│   ├── mensa/                    # Mensa-spezifische Komponenten
│   │   ├── MenuCard.tsx          # Gericht-Karte
│   │   ├── RatingCard.tsx        # Bewertungs-Komponente
│   │   └── SustainabilityBadge.tsx
│   ├── ai/                       # KI-Komponenten
│   │   └── ChatInterface.tsx     # Chat-Interface
│   ├── dish-card.tsx             # Einzelne Gerichtkarte
│   ├── daily-menu.tsx            # Tagesmenü-Ansicht
│   ├── themed-view.tsx           # Dark/Light Mode Support
│   └── themed-text.tsx
├── services/                     # Backend Services
│   ├── api/mensaApi.ts           # Mensa API Client
│   ├── ai/aiService.ts           # KI Integration
│   ├── storage/                  # AsyncStorage Wrapper
│   ├── notifications/            # Push-Benachrichtigungen
│   └── offline/                  # Offline-Unterstützung
├── models/                       # TypeScript Datenmodelle
│   ├── Menu.ts                   # Menü-Modell
│   ├── Dish.ts                   # Gericht mit Allergenen, Labels
│   └── UserPreferences.ts        # Nutzereinstellungen
├── hooks/                        # Custom React Hooks
│   ├── useMenuData.ts            # Menüdaten Hook
│   ├── useAIChat.ts              # KI-Chat Hook
│   └── use-color-scheme.ts       # Theme Hook
├── config/                       # Konfiguration
│   ├── api.config.ts             # API-Endpoints
│   └── constants.ts              # Allergen-Labels, Storage Keys
└── constants/                    # App-Konstanten
    ├── locations.ts              # Campus-Standorte
    └── theme.ts                  # HTW Green (#76B900)
```

## Installation

### Voraussetzungen
- Node.js v18+
- npm
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode (für Simulator)
- Android: Android Studio (für Emulator)

### Setup

1. **Dependencies installieren**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen konfigurieren**

   Erstelle eine `.env` Datei im Projektverzeichnis:
   ```env
   EXPO_PUBLIC_MENSA_API_KEY=dein_mensa_api_key
   EXPO_PUBLIC_MENSA_API_URL=https://mensa.gregorflachs.de/api/v1
   EXPO_PUBLIC_MENSA_CANTEEN_ID=              # Optional: Feste Mensa-ID
   EXPO_PUBLIC_OPENAI_API_KEY=                # Optional: Für lokale KI-Tests
   ```

3. **App starten**
   ```bash
   npm start
   ```

4. **Plattform-spezifisch**
   ```bash
   npm run ios       # iOS Simulator
   npm run android   # Android Emulator
   npm run web       # Web Browser
   ```

## Entwicklung

### Befehle

```bash
npm start              # Expo Development Server
npm run lint           # ESLint ausführen
npm run type-check     # TypeScript prüfen
npm run test           # Jest Tests
```

### EAS Build (Production)

```bash
eas build --platform ios --profile development      # iOS Simulator
eas build --platform android --profile preview      # Android APK
```

## APIs

### Mensa API
- **Basis-URL**: `https://mensa.gregorflachs.de/api/v1`
- **Endpoints**: `/canteen`, `/menue`, `/meal`, `/additive`, `/badge`
- **Auth**: `X-API-KEY` Header
- **Folgendes muss lokal in einer .env Datei konfiguriert werden**:
  
EXPO_PUBLIC_MENSA_API_KEY=lylDptJVKMnASYr0Equ4Wk3lAtHdSmKBcuVHRL5h3Czlj6/BllEEo58Imkbj5M3f+wJwbnkLTMEEM/UHsRlPUSfCMfaf8Bi0zGYzuIAWbGnUtJNFs3f9j1LvJzJy6x+bNuvMqi5h632L2MdJ81NXnfnb1gI12bKtKxLqFTNAHmHLiEx72uh0uATs0xyrewHOujMv9JFIqfdjFIi3YCT0+6zMmkS6pedLvilyMJLy9f/BCMd2Ow7+3rEMbXjuLMJ6lXGofPbt3S1KILzZ7XrxVCxNpye9WSCj1KQdjceLyjX1CPqbXhiexhoTo3lcgQsCTy9S11G5NuAvgtrSMYx4hg==

### KI Backend
- **URL**: `https://mensa-app-backend.vercel.app/api`
- **Modell**: GPT-4o-mini

## App-Konfiguration

| Einstellung | Wert |
|-------------|------|
| App ID | `de.unimensa.berlin.gruppe04` |
| EAS Project ID | `3e9f4af8-8657-4562-8f7a-e85a5cd12397` |
| Slug | `htw-mensa-app` |
| Owner | `gruppe-04` |

## Team

Gruppe 04 - HTW Berlin, WiSe 25/26

## Lizenz

Universitätsprojekt der HTW Berlin.
