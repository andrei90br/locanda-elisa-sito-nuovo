# Locanda Elisa — sito nuovo

Landing page statica in tre lingue (italiano, inglese, tedesco) per il Garnì Locanda Elisa, Dimaro Folgarida (Val di Sole).
La pagina presenta solo il garnì (le camere): appartamenti e bistrot pizzeria sono stati tolti su richiesta.
Stessa struttura, stesso CSS/JS e stesso processo del sito nuovo dell'Hotel Belfiore (`andrei90br/hotel-belfiore-sito-nuovo`):
cambiano solo `src/template.html` (sezioni, foto, contatti) e i testi in `src/lang/*.json`.
Testi e foto sono quelli del sito attuale (locandaelisa.it); il layout segue quello di riferimento di
atlantis.com/dubai/atlantis-the-royal (solo studio di struttura e misure: non è incluso alcun asset di Atlantis).

## Struttura

```
src/template.html      template unico con segnaposto {{chiave}}
src/lang/*.json        testi in it / en / de (stesse chiavi)
src/assets/            style.css, main.js (come Belfiore, più la preselezione della camera nel modulo e la griglia a 2 card)
build.ps1              genera site/ (IT in radice, /en/, /de/)
serve.ps1              anteprima locale su http://localhost:5173/
.github/workflows/     deploy su GitHub Pages
```

Sezioni della pagina: hero · 4 prove (15 camere, 17–23 m², colazione, check-in 14–23) · 3 pannelli a scorrimento
(il garnì, le camere, dove siamo) · carosello "In camera" (legno, bagno, vista, Wi-Fi e TV) ·
camere (doppia e tripla) · FAQ · richiesta di soggiorno.

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
  controllare che ogni immagine corrisponda alla sezione (in particolare hero `132-…`, pannelli `180-…` e `045-…`, carosello `065/048/050/032-…`).
- Il modulo di richiesta apre il programma di posta con `mailto:`. Per un invio vero serve un endpoint (es. Formspree).
  La prenotazione online resta sul motore RoomCloud già in uso (`hotel=16315`): verificare che mostri solo le camere del garnì.
- Cambiare `-Site` con il dominio definitivo e togliere `-NoIndex`.
- Confermare con la struttura:
  - la mezza pensione (citata sulla pagina camere del sito attuale): verificare che sia ancora offerta.
  - Wi-Fi: la pagina camere lo indica sia "nelle aree comuni" sia tra i servizi di tutte le camere.
  - la Val di Sole Guest Card non è citata: sul sito attuale le condizioni sono ferme al 2022.
- La pagina interna in tedesco per le camere non è stata trovata: i link DE puntano alla pagina "Unterkunft".
