# KI-Integration Setup

## Problem behoben ✅

**Was war das Problem?**
- Falscher Model-Name: `gpt-4.1-mini` existiert nicht
- Hardcodierter (abgelaufener) API-Key im Code
- Fehlende Fehlerbehandlung

**Was wurde gefixt:**
- ✅ Korrekter Model-Name: `gpt-4o-mini`
- ✅ API-Key aus Umgebungsvariable
- ✅ Detaillierte Fehlermeldungen
- ✅ Timeout-Handling (30s)

## Setup-Anleitung

### 1. OpenAI API-Key besorgen

1. Gehe zu [platform.openai.com](https://platform.openai.com/api-keys)
2. Erstelle einen Account (falls noch nicht vorhanden)
3. Klicke auf "Create new secret key"
4. Kopiere den Key (beginnt mit `sk-...`)

### 2. .env Datei erstellen

```bash
# Im Projektverzeichnis
cp .env.example .env
```

Öffne `.env` und füge deinen API-Key ein:
```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-dein-echter-api-key-hier
```

**Wichtig:** `.env` ist in `.gitignore` und wird NICHT ins Git-Repo gepusht!

### 3. App neu starten

```bash
# Metro Bundler stoppen (Ctrl+C)
npm start -- --clear
```

### 4. KI-Assistent testen

1. Öffne den "KI-Assistent" Tab
2. Stelle eine Frage, z.B.: "Was gibt es heute zu essen?"
3. Der Mensa-Bot sollte antworten

## Fehlerbehebung

### "API-Key ungültig"
- Überprüfe ob `.env` Datei existiert
- Stelle sicher, dass der Key mit `sk-` beginnt
- Prüfe ob der Key auf OpenAI aktiv ist

### "Model nicht gefunden"
- Der Code nutzt jetzt `gpt-4o-mini` (kosteneffizient)
- Falls du ein anderes Model nutzen willst, ändere `MODEL_NAME` in `aiService.ts`

### "Zu viele Anfragen"
- OpenAI hat Rate Limits
- Warte 1 Minute und versuche es erneut
- Prüfe dein OpenAI-Guthaben

### App lädt nicht neu
```bash
# Cache leeren
npm start -- --clear

# Oder im laufenden Metro:
# Drücke 'r' für Reload
```

## Kosten

- **gpt-4o-mini**: ~$0.15 pro 1M Input-Tokens
- Für Entwicklung/Testing: sehr günstig
- Für Production: Backend-Proxy empfohlen

## Sicherheit

⚠️ **Niemals API-Keys ins Git pushen!**

Für Production:
- Backend-Proxy verwenden
- API-Keys auf Server speichern
- Rate-Limiting implementieren
