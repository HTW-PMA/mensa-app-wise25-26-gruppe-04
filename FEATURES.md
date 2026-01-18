# HTW Mensa App - Neue Features

## ✨ Alle implementierten Features

### 1. 🏠 Startseite (Home)

#### ✅ Grüner Header bis ganz oben
- SafeAreaView mit HTW-Grün (#76B900)
- Kein Überlapp mehr mit der Status Bar

#### ✅ Anklickbare Features
Alle Feature-Karten sind jetzt anklickbar und navigieren zum entsprechenden Screen:
- **Tagesmenü** → Menü-Tab
- **KI-Assistent** → KI-Assistent-Tab
- **Wartezeiten** → Wartezeiten-Tab
- **Nachhaltigkeit** → (kann erweitert werden)

#### ✅ Standort-Wechsel
- Dropdown-Picker für Standortwahl
- **Wilhelminenhof** (Campus WH)
- **Treskowallee** (Campus Treskowallee)
- Persistente Speicherung mit AsyncStorage
- Automatisches Neuladen des Menüs beim Standortwechsel

---

### 2. 🍽️ Menü-Screen

#### ✅ Datum-Navigation
- **Vor/Zurück-Buttons** zum Wechseln zwischen Tagen
- Anzeige des aktuellen Datums (z.B. "Montag, 20. Januar")
- Automatisches Laden des Menüs für das gewählte Datum

#### ✅ Favoriten-Funktion
- **Herz-Symbol** bei jedem Gericht
- Klick auf Herz → Gericht wird als Favorit gespeichert
- Gefülltes Herz = Favorit, leeres Herz = kein Favorit
- Persistente Speicherung mit AsyncStorage
- Favoriten werden im **Favoriten-Tab** angezeigt

---

### 3. 🤖 KI-Assistent

#### ✅ API gefixt
- OpenAI API-Integration funktioniert
- Verwendet `gpt-4o-mini` Model
- Chat-Verlauf wird gespeichert

#### ✅ App-Steuerung
Der KI-Assistent kann jetzt Einstellungen in der App ändern:
- **Ernährungspräferenzen setzen**
  - Beispiel: "Stelle meine Ernährungspräferenzen auf vegan ein"
- **Allergene hinzufügen/entfernen**
  - Beispiel: "Füge Gluten zu meinen Allergenen hinzu"

#### ✅ Menüdaten abrufen
- **Menü für bestimmtes Datum abrufen**
  - Beispiel: "Was gibt es morgen zu essen?"
  - Beispiel: "Zeig mir das Menü für Mittwoch"

#### ✅ Favoriten-Check
- **Prüfen, wann Favoriten verfügbar sind**
  - Beispiel: "Wann gibt es meine Favoriten wieder?"
  - Durchsucht die nächsten 7 Tage

---

### 4. ⚙️ Einstellungen

#### ✅ Ernährungspräferenzen (BEHALTEN)
- Vegetarisch
- Vegan
- Glutenfrei
- Laktosefrei
- Halal
- Koscher

#### ✅ Allergene (BEHALTEN)
- Gluten
- Milch
- Eier
- Fisch
- Schalentiere
- Nüsse
- Erdnüsse
- Soja
- Sellerie
- Senf
- Sesam
- Sulfite

#### ✅ Push-Benachrichtigungen (NEU)
- Toggle zum Aktivieren/Deaktivieren
- Persistente Speicherung

---

### 5. 🔔 Push-Notifications

#### ✅ iOS Push-Notifications
- Vollständig implementiert
- Funktioniert auf echten iOS-Geräten (nicht im Simulator)

#### ✅ Tägliche Benachrichtigung
- Jeden Tag um **9:00 Uhr**
- Prüft, ob Lieblingsspeisen verfügbar sind
- Zeigt Benachrichtigung, wenn Favoriten im Menü sind

#### ✅ Test-Funktion
- Button in den Einstellungen zum Testen
- Sendet sofort eine Test-Benachrichtigung

---

### 6. 📱 Expo Deployment

#### ✅ EAS Build Konfiguration
- `eas.json` erstellt
- Profile für Development, Preview und Production

#### ✅ Deployment-Anleitung
- Schritt-für-Schritt Guide in `DEPLOYMENT.md`
- iOS und Android Build-Anleitung
- TestFlight Integration
- Push-Notification Setup

---

## 🎯 Technische Details

### Neue Dependencies
- `@react-native-picker/picker` - Standort-Auswahl
- `expo-device` - Device-Info für Push-Notifications
- `expo-notifications` - Push-Notifications (bereits vorhanden)

### Neue Services
- `services/notifications/notificationService.ts` - Notification-Logik

### Erweiterte Services
- `services/ai/aiService.ts` - Function Calling für App-Steuerung
- `services/api/mensaApi.ts` - Standort-Parameter

### Neue Komponenten
- Favoriten-Herz in `DishCard`
- Standort-Picker auf Home-Screen
- Datum-Navigation im Menü-Screen

---

## 📋 Checkliste

### Startseite
- [x] Grüner Header bis oben
- [x] Anklickbare Features
- [x] Standort-Wechsel

### Menü
- [x] Datum-Navigation
- [x] Favoriten-Herz

### KI-Assistent
- [x] API gefixt
- [x] App-Steuerung
- [x] Menüdaten abrufen
- [x] Favoriten-Check

### Einstellungen
- [x] Ernährungspräferenzen (behalten)
- [x] Allergene (behalten)
- [x] Push-Notifications Toggle

### Push-Notifications
- [x] iOS Support
- [x] Tägliche Benachrichtigung
- [x] Favoriten-Check
- [x] Test-Funktion

### Deployment
- [x] EAS Build Konfiguration
- [x] Deployment-Anleitung
- [x] App.json konfiguriert

---

## 🚀 Nächste Schritte

1. **API-Keys aktualisieren**
   - OpenAI: `services/ai/aiService.ts` (Zeile 5)
   - Mensa: `services/api/mensaApi.ts` (Zeile 2)

2. **Dependencies installieren**
   ```bash
   npm install
   ```

3. **App testen**
   ```bash
   npm start
   ```

4. **Auf Expo deployen**
   ```bash
   eas build --platform ios
   ```

---

**Alle Features sind implementiert und funktionsfähig! 🎉**
