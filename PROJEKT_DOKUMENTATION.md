# Projekt-Dokumentation: HTW Berlin Mensa App

## Projektübersicht

Diese mobile Anwendung wurde im Rahmen eines Universitätsprojekts an der HTW Berlin entwickelt. Die App bietet Studierenden und Mitarbeitern eine komfortable Möglichkeit, den Menüplan der Mensa einzusehen und durch KI-gestützte Features personalisierte Empfehlungen zu erhalten.

## Architektur

### Frontend-Architektur

Die App basiert auf einer modernen React Native Architektur mit folgenden Prinzipien:

**Component-Based Architecture**: Alle UI-Elemente sind als wiederverwendbare React-Komponenten implementiert. Die Komponenten sind in zwei Hauptkategorien unterteilt: generische UI-Komponenten (`components/`) und feature-spezifische Komponenten (`components/mensa/`, `components/ai/`).

**Service Layer Pattern**: Die Business-Logik ist in dedizierte Service-Klassen ausgelagert. Der `MensaApiService` kümmert sich um alle API-Aufrufe zur Mensa-Backend, während der `AIService` die Integration mit der OpenAI API verwaltet.

**Custom Hooks Pattern**: Zustandsverwaltung und Side-Effects werden durch Custom Hooks gekapselt. Dies ermöglicht eine saubere Trennung von UI und Logik sowie die Wiederverwendbarkeit von State-Management-Logik.

### Datenmodelle

Die App verwendet stark typisierte TypeScript-Interfaces für alle Datenstrukturen:

**Menu**: Repräsentiert einen Menüplan mit Datum, Mahlzeittyp und zugehörigen Gerichten.

**Dish**: Enthält alle Informationen zu einem Gericht inklusive Name, Beschreibung, Kategorie, Preise, Nährwertinformationen, Allergene und Labels.

**UserPreferences**: Speichert Nutzerpräferenzen wie Ernährungseinschränkungen, Allergene, bevorzugte Kategorien und Benachrichtigungseinstellungen.

### KI-Integration

Die KI-Funktionalität nutzt die OpenAI API mit dem GPT-4.1-mini Modell. Implementierte Features umfassen:

**Personalisierte Empfehlungen**: Basierend auf Nutzerpräferenzen und verfügbaren Gerichten generiert die KI maßgeschneiderte Vorschläge.

**Nährwertanalyse**: Automatische Analyse von Gerichten mit detaillierten Nährwertinformationen und Gesundheitsbewertungen.

**Conversational Interface**: Ein Chat-basiertes Interface ermöglicht natürlichsprachliche Interaktion für Fragen zu Gerichten, Zutaten und Ernährung.

## Implementierungsdetails

### Navigation

Die App verwendet Expo Router mit file-based routing. Die Tab-Navigation ermöglicht schnellen Zugriff auf die Hauptfunktionen: Home, Menüplan, KI-Assistent, Favoriten und Einstellungen.

### State Management

Lokaler State wird durch React Hooks verwaltet. Für komplexere State-Logik kommen Custom Hooks zum Einsatz, die die Zustandsverwaltung kapseln und wiederverwendbar machen.

### API-Integration

Alle API-Aufrufe sind in Service-Klassen gekapselt. Error-Handling und Retry-Logik sind zentral implementiert. Die Konfiguration erfolgt über `config/api.config.ts`.

### Styling

Die App nutzt React Native's StyleSheet API für performantes Styling. Theming wird durch die `ThemedView` und `ThemedText` Komponenten unterstützt, die automatisch zwischen Light- und Dark-Mode wechseln.

## Entwicklungsrichtlinien

### Code-Organisation

Jede Datei sollte eine klare, einzelne Verantwortlichkeit haben. Komponenten sollten klein und fokussiert bleiben. Komplexe Logik sollte in Custom Hooks oder Service-Klassen ausgelagert werden.

### TypeScript-Nutzung

Alle Funktionen und Komponenten sollten vollständig typisiert sein. Verwendung von `any` sollte vermieden werden. Interfaces sollten für alle Datenstrukturen definiert werden.

### Testing

Unit-Tests für Services und Hooks sollten mit Jest implementiert werden. Component-Tests sollten die React Native Testing Library nutzen. Integration-Tests sollten kritische User-Flows abdecken.

### Performance-Optimierung

Verwendung von `React.memo` für teure Komponenten. Implementierung von Lazy Loading für große Listen. Caching von API-Responses wo sinnvoll.

## Deployment

### iOS (Xcode)

Die App kann direkt in Xcode geöffnet und auf iOS-Simulatoren oder physischen Geräten getestet werden. Für den App Store Deployment sollte Expo's Build-Service genutzt werden.

### Android (IntelliJ IDEA / Android Studio)

Das Projekt kann in IntelliJ IDEA oder Android Studio geöffnet werden. Der Android SDK muss konfiguriert sein. Für Production-Builds sollte Expo's Build-Service verwendet werden.

## Sicherheit

### API-Keys

Alle API-Keys müssen in Umgebungsvariablen gespeichert werden. Die `.env` Datei darf nicht in Git committed werden. Für Production sollten Keys über sichere Umgebungsvariablen-Management-Systeme verwaltet werden.

### Datenschutz

Nutzerdaten sollten lokal mit Expo SecureStore verschlüsselt gespeichert werden. Keine sensiblen Daten sollten in Logs ausgegeben werden. DSGVO-Konformität muss gewährleistet sein.

## Zukünftige Erweiterungen

### Geplante Features

**Offline-Modus**: Caching von Menüdaten für Offline-Zugriff.

**Push-Benachrichtigungen**: Tägliche Benachrichtigungen über das aktuelle Menü.

**Bildererkennung**: KI-basierte Erkennung von Gerichten durch Kamera.

**Social Features**: Bewertungen, Kommentare und Teilen von Gerichten.

**Mehrsprachigkeit**: Unterstützung für Englisch und weitere Sprachen.

### Technische Verbesserungen

**State Management**: Migration zu Redux oder Zustand für komplexere State-Verwaltung.

**Backend Integration**: Entwicklung eines eigenen Backends für erweiterte Features.

**Analytics**: Integration von Analytics für Nutzerverhalten-Tracking.

**A/B Testing**: Framework für Feature-Testing.

## Kontakt und Support

Bei Fragen oder Problemen wenden Sie sich bitte an das Entwicklerteam der Gruppe 04.

---

**Letzte Aktualisierung**: Dezember 2025  
**Version**: 1.0.0  
**Team**: Gruppe 04, HTW Berlin
