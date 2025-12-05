# KI-Integration - Komplette Fix-Anleitung ✅

## Alle Fehler behoben! 

### Was wurde gefixt:

1. ✅ **axios entfernt** - Nutzt jetzt natives `fetch()`
2. ✅ **process.env entfernt** - API-Key direkt im Code
3. ✅ **TypeScript-Fehler behoben** - Korrekte Exports
4. ✅ **Model-Name korrigiert** - `gpt-4o-mini` statt `gpt-4.1-mini`
5. ✅ **useAIChat Hook repariert** - Korrekte Signatur

## So bringst du es zum Laufen:

### Schritt 1: OpenAI API-Key holen

1. Gehe zu [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Erstelle einen Account (falls nötig)
3. Klicke "Create new secret key"
4. Kopiere den Key (beginnt mit `sk-...`)

### Schritt 2: API-Key einfügen

Öffne `services/ai/aiService.ts` und ersetze in **Zeile 2**:

```typescript
const OPENAI_API_KEY = 'DEIN_API_KEY_HIER';
```

mit deinem echten Key:

```typescript
const OPENAI_API_KEY = 'sk-proj-abc123...';
```

### Schritt 3: App neu starten

```bash
# Metro Bundler stoppen (Ctrl+C)
npm start -- --clear
```

Oder im laufenden Metro: Drücke `r` für Reload

### Schritt 4: Testen

1. Öffne den **KI-Assistent** Tab
2. Schreibe "Hallo"
3. Der Mensa-Bot sollte antworten! 🎉

## Fehlerbehebung

### "API-Key ungültig"
- Stelle sicher, dass der Key mit `sk-` beginnt
- Prüfe auf OpenAI ob der Key aktiv ist
- Keine Leerzeichen vor/nach dem Key

### "Model nicht gefunden"
- Der Code nutzt jetzt `gpt-4o-mini` (korrekt)
- Falls du ein anderes Model willst, ändere `MODEL_NAME` in Zeile 3

### "Zu viele Anfragen"
- OpenAI hat Rate Limits
- Warte 1 Minute
- Prüfe dein OpenAI-Guthaben

### TypeScript-Fehler bleiben
```bash
# Cache leeren
rm -rf node_modules .expo
npm install
npm start -- --clear
```

## Wichtig für Production

⚠️ **Niemals API-Keys ins Git pushen!**

Für Production:
1. Nutze Backend-Proxy
2. API-Keys auf Server speichern
3. Rate-Limiting implementieren

Für jetzt (Development):
- API-Key im Code ist OK zum Testen
- Achte darauf, nicht zu committen!

## Kosten

- **gpt-4o-mini**: ~$0.15 pro 1M Input-Tokens
- Für Testing: sehr günstig (< $1)
- Eine Chat-Nachricht: ~0.0001$

## Support

Falls es immer noch nicht läuft:
1. Schicke Screenshot vom Fehler
2. Zeige den Code in `aiService.ts` Zeile 1-10
3. Prüfe ob `axios` wirklich installiert ist: `npm list axios`
