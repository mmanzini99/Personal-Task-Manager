# Task: gestione task personale

Web app (PWA) per gestire le task da PC e da iPhone, con i dati sincronizzati tra i dispositivi.

**Indirizzo dell'app:** https://personaltaskmanager-five.vercel.app

- **Frontend:** React + Vite, installabile su iPhone dalla schermata Home
- **Backend:** Supabase (database, login, storage dei loghi), regione UE (Francoforte)
- **Hosting:** Vercel (piano gratuito Hobby), con aggiornamento automatico a ogni modifica su GitHub

---

## 1. Configurazione iniziale (una volta sola)

### 1.1 Supabase
1. Su https://supabase.com crea un progetto nella regione **Central EU (Frankfurt)**.
2. Vai su **Authentication → Sign In / Providers** e disattiva **Allow new users to sign up**.
3. Vai su **Authentication → Users → Add user → Create new user**, inserisci email e password e lascia attivo **Auto Confirm User**.
4. Vai su **SQL Editor → New query**, incolla tutto il contenuto del file [`supabase/schema.sql`](supabase/schema.sql) e premi **Run**. Deve comparire "Success. No rows returned".
5. Clicca **Connect** in alto oppure vai su **Project Settings → API Keys** e copia il **Project URL** e la chiave **publishable** (o "anon public").

### 1.2 Chiavi nell'app
Le due chiavi vanno nel file `.env.production` alla radice del progetto:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_KEY=sb_publishable_xxxxxxxx
```

La chiave *publishable/anon* è pubblica per definizione: i dati sono protetti dal login e dalle regole del database. **Non inserire mai** la chiave *secret/service_role*.

### 1.3 Vercel
1. Su https://vercel.com scegli **Sign Up → Continue with GitHub** (piano **Hobby**).
2. Clicca **Add New… → Project**, scegli il repository `Personal-Task-Manager` e premi **Import**.
3. Lascia le impostazioni proposte (Framework: **Vite**) e premi **Deploy**.
4. Dopo circa un minuto ottieni l'indirizzo dell'app, del tipo `https://personal-task-manager-xxx.vercel.app`.
5. Vai su **Settings → Environments → Production → Branch Tracking** e indica il branch da pubblicare: `claude/task-management-pwa-kf7jco`.

---

## 2. Installare l'app sull'iPhone
1. Apri **Safari** sull'iPhone e vai a **https://personaltaskmanager-five.vercel.app**. Deve essere Safari, non Chrome.
2. Tocca il pulsante **Condividi** (il quadrato con la freccia verso l'alto).
3. Scorri e tocca **Aggiungi alla schermata Home**, poi **Aggiungi**.
4. Apri l'app dall'icona sulla Home: si apre a schermo intero, senza la barra di Safari.

Sul PC puoi usarla direttamente dal browser. Con Chrome o Edge puoi anche installarla con l'icona "Installa" nella barra degli indirizzi.

## 3. Primo login
1. Apri l'app (sull'iPhone dall'icona sulla Home).
2. Inserisci l'email e la password dell'utente creato su Supabase e tocca **Accedi**.
3. Il login resta memorizzato: non viene più richiesto su quel dispositivo, salvo un logout manuale (⚙️ → **Esci**).

Su iPhone l'app installata ha una memoria separata da Safari: se hai fatto il login in Safari, va ripetuto una volta nell'app installata.

## 4. Caricare i loghi delle aree
1. Nella schermata principale tocca l'icona **⚙️** in alto a destra.
2. Tocca l'area da modificare.
3. Tocca **Carica logo** e scegli l'immagine: dal PC un file, dall'iPhone **Libreria foto**, **Scatta foto** o **Scegli file**.
4. Il logo viene ridimensionato e salvato subito, e compare su tutti i dispositivi.

Da qui puoi anche cambiare nome e colore dell'area (poi tocca **Salva**) o rimuovere il logo. Senza logo l'app mostra un cerchio con l'iniziale nel colore dell'area.

## 5. Aggiornare l'app in futuro
- Ogni modifica pubblicata sul branch di produzione su GitHub viene messa online da Vercel in automatico, in circa un minuto.
- Sull'iPhone e sul PC l'app scarica l'aggiornamento da sola. Per vederlo chiudi l'app (sull'iPhone scorri verso l'alto dal multitasking) e riaprila; a volte servono due riaperture.
- I dati restano su Supabase e non vengono toccati dagli aggiornamenti.
- **Nota sul piano gratuito di Supabase:** se il progetto non riceve richieste per 7 giorni consecutivi, Supabase lo mette in pausa e ti avvisa via email. Si riattiva dal pannello con **Restore project** e i dati non si perdono.

---

## Sviluppo locale (facoltativo)
```
npm install
npm run dev      # http://localhost:5173
npm run build    # crea la versione di produzione in dist/
```
