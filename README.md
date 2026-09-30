# Locanda Elisa — sito nuovo

Landing page statica in tre lingue (italiano, inglese, tedesco) per l'Hotel diffuso Locanda Elisa, Dimaro Folgarida (Val di Sole).
Stessa struttura, stesso CSS/JS e stesso processo del sito nuovo dell'Hotel Belfiore (`andrei90br/hotel-belfiore-sito-nuovo`):
cambiano solo `src/template.html` (sezioni, foto, contatti) e i testi in `src/lang/*.json`.
Testi e foto sono quelli del sito attuale (locandaelisa.it); il layout segue quello di riferimento di
atlantis.com/dubai/atlantis-the-royal (solo studio di struttura e misure: non è incluso alcun asset di Atlantis).

## Struttura

```
src/template.html      template unico con segnaposto {{chiave}}
src/lang/*.json        testi in it / en / de (stesse chiavi)
src/assets/            style.css, main.js (identici a Belfiore, più la preselezione della sistemazione nel modulo)
build.ps1              genera site/ (IT in radice, /en/, /de/)
serve.ps1              anteprima locale su http://localhost:5173/
.github/workflows/     deploy su GitHub Pages
```

Sezioni della pagina: hero · 4 prove (15 camere, 6 appartamenti, km 0, bistrot) · 4 pannelli a scorrimento
(hotel diffuso, camere, appartamenti, bistrot) · carosello del bistrot (prodotti, bar, giardino, business) ·
camere e appartamenti (doppia, tripla, appartamenti fino a 4 e fino a 6/7) · FAQ · richiesta di soggiorno.

## Comandi (Windows PowerShell)

```powershell
# genera il sito
powershell -ExecutionPolicy Bypass -File build.ps1

# anteprima locale
powershell -ExecutionPolicy Bypass -File serve.ps1
```

Parametri di `build.ps1`: `-Site` (URL finale per canonical e hreflang), `-Img` (base delle immagini),
`-NoIndex` (aggiunge `noindex`, usato dal deploy di anteprima).

## Deploy

Ogni push su `main` o `sito-nuovo` avvia il workflow che rigenera il sito e lo pubblica su GitHub Pages
(`https://<utente>.github.io/<repository>/`). L'anteprima è marcata `noindex`.

## Prima del go-live

- Le foto sono collegate direttamente da locandaelisa.it/wp-content/uploads: vanno scaricate, ottimizzate e servite dal nuovo
  dominio (cambiare `-Img` in `build.ps1`). Le foto sono state scelte dai nomi dei file e dalle pagine in cui compaiono:
  controllare che ogni immagine corrisponda alla sezione (in particolare hero `132-…`, pannello hotel `180-…`, bistrot `Asporto-…`).
- Il modulo di richiesta apre il programma di posta con `mailto:`. Per un invio vero serve un endpoint (es. Formspree).
  La prenotazione online resta sul motore RoomCloud già in uso (`hotel=16315`).
- Cambiare `-Site` con il dominio definitivo e togliere `-NoIndex`.
- Confermare con la struttura:
  - orari del bistrot: la home del sito attuale dice ristorante 12-14 | 18-22:30, pizzeria 18-23; la pagina contatti dice
    12-22 continuato e pizzeria 15-22:30. Qui sono usati quelli della home.
  - animali: il sito dice pet-friendly solo per gli appartamenti; per le camere la FAQ rimanda alla richiesta.
  - Wi-Fi: la pagina camere lo indica sia "nelle aree comuni" sia tra i servizi di tutte le camere.
  - la Val di Sole Guest Card non è citata: sul sito attuale le condizioni sono ferme al 2022.
- Le pagine interne in tedesco per camere e appartamenti non sono state trovate: i link DE puntano alla pagina "Unterkunft".
