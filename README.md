# HTW Berlin Mensa App - Gruppe 04

Eine mobile Anwendung für die Mensa der HTW Berlin mit integrierter KI-Unterstützung.

## 🎯 Features

### Kernfunktionen
- **Menüplan-Ansicht**: Tagesaktuelle und wöchentliche Menüpläne
- **Favoriten**: Speichern und Verwalten von Lieblingsgerichten
- **Einstellungen**: Personalisierte Präferenzen und Allergen-Filter
- **Preisanzeige**: Unterschiedliche Preise für Studenten, Mitarbeiter und Gäste

### KI-Integration
- **Ernährungsberatung**: Personalisierte Empfehlungen basierend auf Präferenzen
- **Intelligenter Chat**: Fragen zu Gerichten, Zutaten und Nährwerten
- **Nährwertanalyse**: Detaillierte Analyse von Kalorien, Proteinen, etc.
- **Allergen-Warnungen**: Automatische Erkennung von Allergenen

## 🏗️ Projektstruktur

```
mensa-app-extended/
├── app/                          # Expo Router Screens
│   └── (tabs)/                   # Tab-basierte Navigation
│       ├── index.tsx             # Home Screen
│       ├── menu.tsx              # Menüplan Screen
│       ├── ai-assistant.tsx      # KI-Assistent Screen
│       ├── favorites.tsx         # Favoriten Screen
│       └── settings.tsx          # Einstellungen Screen
├── components/                   # React Komponenten
│   ├── mensa/                    # Mensa-spezifische Komponenten
│   │   └── MenuCard.tsx          # Gericht-Karte
│   └── ai/                       # KI-Komponenten
│       └── ChatInterface.tsx     # Chat-Interface
├── services/                     # Backend Services
│   ├── api/                      # API Services
│   │   └── mensaApi.ts           # Mensa API Client
│   └── ai/                       # KI Services
│       └── aiService.ts          # KI Integration
├── models/                       # Datenmodelle
│   ├── Menu.ts                   # Menü-Modell
│   ├── Dish.ts                   # Gericht-Modell
│   └── UserPreferences.ts        # Nutzereinstellungen
├── hooks/                        # Custom React Hooks
│   ├── useMenuData.ts            # Menüdaten Hook
│   └── useAIChat.ts              # KI-Chat Hook
├── config/                       # Konfiguration
│   ├── api.config.ts             # API-Konfiguration
│   └── constants.ts              # App-Konstanten
├── types/                        # TypeScript Typen
│   └── index.d.ts                # Globale Type Definitions
└── utils/                        # Hilfsfunktionen
```

## 🚀 Installation

### Voraussetzungen
- Node.js (v18 oder höher)
- npm oder yarn
- Expo CLI
- Xcode (für iOS-Entwicklung)
- Android Studio / IntelliJ IDEA (für Android-Entwicklung)

### Setup

1. **Dependencies installieren**
   ```bash
   npm install
   ```

2. **Umgebungsvariablen konfigurieren**
   
   Erstellen Sie eine `.env` Datei im Projektverzeichnis:
   ```env
   EXPO_PUBLIC_MENSA_API_URL=https://api.htw-mensa.de
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **App starten**
   ```bash
   npm start
   ```

4. **Plattform-spezifisch starten**
   ```bash
   # iOS (Xcode erforderlich)
   npm run ios
   
   # Android (Android Studio/IntelliJ erforderlich)
   npm run android
   
   # Web
   npm run web
   ```

## 💻 Entwicklung

### Mit Xcode (iOS)
1. Öffnen Sie das Projekt in Xcode
2. Wählen Sie einen Simulator oder ein verbundenes Gerät
3. Starten Sie die App mit `npm run ios`

### Mit IntelliJ IDEA (Android)
1. Öffnen Sie das Projekt in IntelliJ IDEA
2. Konfigurieren Sie den Android SDK
3. Starten Sie einen Emulator oder verbinden Sie ein Gerät
4. Starten Sie die App mit `npm run android`

### Code-Qualität
```bash
# TypeScript Type-Checking
npm run type-check

# Linting
npm run lint

# Tests ausführen
npm run test
```

## 🤖 KI-Integration

Die App nutzt OpenAI's GPT-Modelle für:
- Personalisierte Menüempfehlungen
- Natürlichsprachliche Suche
- Ernährungsberatung
- Chatbot-Funktionalität

### KI-Features konfigurieren
Bearbeiten Sie `config/api.config.ts` um KI-Parameter anzupassen:
```typescript
AI_API: {
  MODEL: 'gpt-4.1-mini',
  MAX_TOKENS: 1000,
  TEMPERATURE: 0.7,
}
```

## 📱 Plattform-Kompatibilität

- **iOS**: Vollständig unterstützt (Xcode erforderlich)
- **Android**: Vollständig unterstützt (Android Studio/IntelliJ erforderlich)
- **Web**: Grundlegende Unterstützung

## 🔧 Technologie-Stack

- **Framework**: React Native mit Expo
- **Sprache**: TypeScript
- **Navigation**: Expo Router
- **State Management**: React Hooks
- **API Client**: Axios
- **KI**: OpenAI API
- **UI**: React Native Components

## 📝 TODO

- [ ] Mensa API Integration implementieren
- [ ] KI-Empfehlungsalgorithmus verfeinern
- [ ] Offline-Modus mit lokaler Datenspeicherung
- [ ] Push-Benachrichtigungen für Tagesmenü
- [ ] Bildererkennung für Gerichte
- [ ] Bewertungssystem für Gerichte
- [ ] Social Features (Teilen, Kommentare)

## 👥 Team

Gruppe 04 - HTW Berlin

## 📄 Lizenz

Dieses Projekt ist Teil eines Universitätsprojekts an der HTW Berlin.
