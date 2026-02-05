# HTW Mensa App - Deployment Anleitung

## 📱 Expo Deployment

Diese App kann auf [Expo.dev](https://expo.dev) deployed und auf echten Geräten ausgeführt werden.

---

## 🚀 Schritt-für-Schritt Anleitung

Bitte beachten Sie, dass zuerst lokal eine .env Datei mit folgendem Inhalt erstellt werden muss:

EXPO_PUBLIC_MENSA_API_KEY=lylDptJVKMnASYr0Equ4Wk3lAtHdSmKBcuVHRL5h3Czlj6/BllEEo58Imkbj5M3f+wJwbnkLTMEEM/UHsRlPUSfCMfaf8Bi0zGYzuIAWbGnUtJNFs3f9j1LvJzJy6x+bNuvMqi5h632L2MdJ81NXnfnb1gI12bKtKxLqFTNAHmHLiEx72uh0uATs0xyrewHOujMv9JFIqfdjFIi3YCT0+6zMmkS6pedLvilyMJLy9f/BCMd2Ow7+3rEMbXjuLMJ6lXGofPbt3S1KILzZ7XrxVCxNpye9WSCj1KQdjceLyjX1CPqbXhiexhoTo3lcgQsCTy9S11G5NuAvgtrSMYx4hg==

### 1. Expo Account erstellen

1. Gehe zu [expo.dev](https://expo.dev)
2. Erstelle einen kostenlosen Account
3. Bestätige deine E-Mail-Adresse

### 2. Expo CLI installieren

```bash
npm install -g eas-cli
```

### 3. Bei Expo anmelden

```bash
eas login
```

Gib deine Expo-Zugangsdaten ein.

### 4. Projekt konfigurieren

```bash
eas build:configure
```

Dies erstellt automatisch die `eas.json` Datei (bereits vorhanden).

### 5. iOS Build erstellen

#### Option A: Für echtes iPhone (TestFlight)

```bash
eas build --platform ios --profile production
```

**Hinweis:** Du benötigst einen **Apple Developer Account** ($99/Jahr)

#### Option B: Für iOS Simulator (kostenlos)

```bash
eas build --platform ios --profile development
```

### 6. Android Build erstellen

```bash
eas build --platform android --profile production
```

Dies erstellt eine APK-Datei, die du direkt auf Android-Geräten installieren kannst.

### 7. Build-Status prüfen

Nach dem Start des Builds:

1. Gehe zu [expo.dev/accounts/[username]/projects/htw-mensa-app/builds](https://expo.dev)
2. Warte, bis der Build abgeschlossen ist (~10-20 Minuten)
3. Lade die App herunter

---

## 📲 App auf dem Handy installieren

### iOS (mit TestFlight)

1. Lade TestFlight aus dem App Store
2. Öffne den Link, den Expo dir nach dem Build schickt
3. Installiere die App über TestFlight

### iOS (Simulator)

1. Lade die `.app` Datei herunter
2. Entpacke sie
3. Ziehe sie in den iOS-Simulator

### Android

1. Lade die APK-Datei herunter
2. Übertrage sie auf dein Android-Gerät
3. Installiere die APK (erlaube "Installation aus unbekannten Quellen")

---

## 🔔 Push-Notifications einrichten

### Für iOS

1. Gehe zu [Apple Developer Portal](https://developer.apple.com)
2. Erstelle ein Push-Notification-Zertifikat
3. Lade es in Expo hoch:
   ```bash
   eas credentials
   ```

### Für Android

Push-Notifications funktionieren automatisch mit Firebase Cloud Messaging (FCM).

---

## 🌐 Expo Go App (Entwicklung)

Für schnelles Testen während der Entwicklung:

1. Installiere **Expo Go** aus dem App Store / Play Store
2. Starte die App lokal:
   ```bash
   npm start
   ```
3. Scanne den QR-Code mit Expo Go

**Hinweis:** Push-Notifications funktionieren **nicht** in Expo Go, nur in echten Builds!

---

## 📝 Wichtige Hinweise

### API-Keys aktualisieren

Vor dem Deployment **unbedingt** die API-Keys aktualisieren:

1. **OpenAI API-Key** in `services/ai/aiService.ts` (Zeile 5)
2. **Mensa API-Key** in `services/api/mensaApi.ts` (Zeile 2)

### App-Version erhöhen

Vor jedem neuen Build in `app.json`:

```json
{
  "expo": {
    "version": "1.0.1"  // Erhöhen!
  }
}
```

### Bundle Identifier

Für iOS und Android sind bereits Bundle Identifiers gesetzt:

- **iOS:** `de.htw-berlin.mensa-app`
- **Android:** `de.htwberlin.mensaapp`

Diese können in `app.json` geändert werden.

---

## 🆘 Troubleshooting

### Build schlägt fehl

```bash
eas build --platform ios --profile development --clear-cache
```

### Push-Notifications funktionieren nicht

1. Prüfe, ob Benachrichtigungen in den Einstellungen aktiviert sind
2. Prüfe, ob die App Berechtigung für Notifications hat
3. Teste mit dem "Test-Benachrichtigung"-Button in den Einstellungen

### App startet nicht

1. Lösche die App und installiere sie neu
2. Prüfe die Logs:
   ```bash
   eas build:list
   ```

---

## 📚 Weitere Ressourcen

- [Expo Documentation](https://docs.expo.dev)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Push Notifications Guide](https://docs.expo.dev/push-notifications/overview/)
- [TestFlight Guide](https://developer.apple.com/testflight/)

---

## ✅ Checkliste vor Deployment

- [ ] API-Keys aktualisiert
- [ ] App-Version erhöht
- [ ] Alle Features getestet
- [ ] Expo Account erstellt
- [ ] EAS CLI installiert
- [ ] Bei Expo angemeldet
- [ ] Build gestartet
- [ ] Build erfolgreich abgeschlossen
- [ ] App auf Testgerät installiert
- [ ] Push-Notifications getestet

---

**Viel Erfolg beim Deployment! 🚀**
