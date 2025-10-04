# 🚀 Railway Deployment Guide

## Lokaler Test ✅

Die App läuft bereits lokal auf http://localhost:8080

**Test-URL:**
```
http://localhost:8080/channels/airfryer-rezepte/schnelles-pad-thai-mit-haehnchen-c7fb00d7
```

## Railway Deployment Schritte

### 1. Railway Account & Projekt erstellen

1. Gehe zu https://railway.app
2. Sign up mit GitHub Account
3. Klicke auf "New Project"
4. Wähle "Deploy from GitHub repo"
5. Verbinde dein GitHub Repository

### 2. Environment Variables setzen

In Railway unter "Variables" folgende Werte hinzufügen:

```env
NODE_ENV=production
SUPABASE_URL=https://uxrxkynjwlrqpjmmxksa.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<dein-service-role-key>
SUPABASE_ANON_KEY=<dein-anon-key>
GEMINI_API_KEY=<dein-gemini-key>
OPENAI_API_KEY=<dein-openai-key>
```

### 3. Build & Start Commands (automatisch erkannt)

Railway erkennt automatisch:
- **Build Command**: `pnpm install && pnpm build`
- **Start Command**: `pnpm start` (→ `node apps/api/dist/index.js`)

Falls nicht, manuell setzen in Railway Settings.

### 4. Deploy

Railway deployed automatisch nach jedem Git Push.

Initial Deployment:
```bash
git add .
git commit -m "Setup Railway deployment"
git push
```

### 5. Custom Domain hinzufügen

1. In Railway Projekt → Settings → Domains
2. Klicke "Add Domain"
3. Gebe ein: `rezepte.famfood.app`
4. Railway zeigt dir CNAME Wert (z.B. `your-project.up.railway.app`)

### 6. GoDaddy DNS konfigurieren

1. Login bei GoDaddy
2. Gehe zu DNS Management für `famfood.app`
3. Füge CNAME Record hinzu:
   ```
   Type: CNAME
   Name: rezepte
   Value: <railway-url-from-step-5>
   TTL: 1 Hour (3600)
   ```
4. Speichern

**Propagation:** DNS-Änderungen können 5-60 Minuten dauern.

### 7. SSL/HTTPS

Railway konfiguriert automatisch kostenloses SSL-Zertifikat für deine Custom Domain.

## URL-Struktur nach Deployment

```
https://rezepte.famfood.app/channels/airfryer-rezepte
https://rezepte.famfood.app/channels/airfryer-rezepte/rezept-slug
https://rezepte.famfood.app/channels/thermomix-rezepte
https://rezepte.famfood.app/channels/high-protein-rezepte
```

**API Endpoints:**
```
https://rezepte.famfood.app/api/channels
https://rezepte.famfood.app/api/channels/airfryer-rezepte/recipes
https://rezepte.famfood.app/health
```

## Testing nach Deployment

1. **Health Check:**
   ```bash
   curl https://rezepte.famfood.app/health
   ```

2. **Channels List:**
   ```bash
   curl https://rezepte.famfood.app/api/channels
   ```

3. **Recipe Page:**
   ```
   https://rezepte.famfood.app/channels/airfryer-rezepte/schnelles-pad-thai-mit-haehnchen-c7fb00d7
   ```

4. **Mobile Test:**
   - Öffne URL auf Smartphone
   - Teste "📥 In FamFood App speichern" Button
   - Teste Deep Link Fallback zu App Stores

## Troubleshooting

### Build Timeout
**Problem:** Build times out während `pnpm install` oder beim Bauen der Packages.

**Lösung:** Das Projekt nutzt `nixpacks.toml` um:
- Puppeteer Installation zu überspringen (wird nicht für API benötigt)
- Build-Prozess zu optimieren

Die Datei `nixpacks.toml` ist bereits konfiguriert mit `PUPPETEER_SKIP_DOWNLOAD=true`.

### Build Failed
- Überprüfe Environment Variables in Railway
- Schaue Railway Logs: `Deployments` → Latest → `View Logs`
- Falls Timeout: Railway erkennt `nixpacks.toml` automatisch

### 404 on Routes
- Überprüfe dass Express Static Files korrekt gemountet sind
- Prüfe ob `public/` Ordner im Build vorhanden ist

### Deep Links funktionieren nicht
- iOS: Stelle sicher famfood:// URL Scheme registriert ist in App
- Android: Stelle sicher Intent Filter in AndroidManifest.xml

### Domain nicht erreichbar
- Warte 5-60 Minuten für DNS Propagation
- Prüfe CNAME Record mit: `dig rezepte.famfood.app`
- Überprüfe Railway Domain Settings

## Monitoring

Railway bietet:
- **Logs**: Real-time logs in Dashboard
- **Metrics**: CPU, Memory, Network Usage
- **Alerts**: Email bei Crashes

## Costs

- **Free Tier**: $5 Guthaben/Monat (ausreichend für kleine Apps)
- **Pro Plan**: $20/Monat (unbegrenzt)

Deine App sollte im Free Tier laufen bei niedrigem Traffic.
