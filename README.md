# Locanda Elisa — sito nuovo

Landing page statica in tre lingue (italiano, inglese, tedesco) per il Garnì Locanda Elisa, Dimaro Folgarida (Val di Sole).
La pagina presenta solo il garnì (le camere): appartamenti e bistrot pizzeria sono stati tolti su richiesta.
Stessa struttura, stesso CSS/JS e stesso processo del sito nuovo dell'Hotel Belfiore (`andrei90br/hotel-belfiore-sito-nuovo`):
cambiano solo `src/template.html` (sezioni, foto, contatti) e i testi in `src/lang/*.json`.
Testi e foto sono quelli del sito attuale (locandaelisa.it); il layout segue quello di riferimento di
atlantis.com/dubai/atlantis-the-royal (solo studio di struttura e misure: non è incluso alcun asset di Atlantis).

## Struttura

Struttura e grafica riprese dal sito della Locanda dei Gemelli (`andrei90br/locandadeigemelli`, branch `sviluppo`).
Sito su più pagine, in italiano (radice), inglese (`/en/`) e tedesco (`/de/`), con gli stessi percorsi in tutte le lingue:

```
/                 home (con barra di prenotazione)
/camere/          le camere
/camere/doppia/   camera doppia
/camere/tripla/   camera tripla
/colazione/       colazione
/bar/             bar Bottega Moderna (aperto anche al pubblico, 9:30–13:30 e 17–22)
/val-di-sole/     cosa fare in Val di Sole
/richiesta/       modulo di richiesta (FormSubmit verso info@locandaelisa.it)
```

```
src/data.mjs           dati: dominio, contatti, foto, camere, orari del bar, pagine
src/render.mjs         layout e pagine
src/i18n/*.json        testi in it / en / de (stesse chiavi)
src/assets/            css/style.css, js/main.js, img/ (foto proprie, logo, favicon)
src/coming-soon.html   avviso "il nuovo sito è in arrivo"
build.mjs              genera site/
serve.ps1              anteprima locale di site/ su http://localhost:5173/
```

Il modulo di richiesta usa FormSubmit: la prima richiesta inviata fa arrivare a info@locandaelisa.it
un'email di attivazione da confermare, poi le richieste arrivano normalmente.

## Comandi

```
node build.mjs                    # sito completo in site/
COMING_SOON=1 node build.mjs      # avviso in radice, sito in site/anteprima/
```

## Deploy

Ogni push su `main` avvia il workflow che rigenera il sito e lo pubblica su GitHub Pages sul dominio
https://garnidellalocanda.it (DNS su IONOS, file `CNAME` generato dal build).
Per ora il workflow usa `COMING_SOON=1`: in radice c'è l'avviso e il sito completo è in `/anteprima/` (noindex).
Al go-live basta togliere `COMING_SOON` da `.github/workflows/pages.yml`: il sito torna in radice, indicizzabile, con `sitemap.xml`.

## Prima del go-live

- Le foto sono collegate direttamente da locandaelisa.it/wp-content/uploads: vanno scaricate, ottimizzate e servite dal nuovo
  dominio (cambiare `IMG` in `build.mjs`). Le foto sono state scelte dai nomi dei file e dalle pagine in cui compaiono:
  controllare che ogni immagine corrisponda alla sezione (in particolare hero `132-…`, pannelli `180-…` e `045-…`, carosello `065/048/050/032-…`).
- Il modulo di richiesta apre il programma di posta con `mailto:`. Per un invio vero serve un endpoint (es. Formspree).
  La prenotazione online resta sul motore RoomCloud già in uso (`hotel=16315`): verificare che mostri solo le camere del garnì.
- Confermare con la struttura:
  - la mezza pensione (citata sulla pagina camere del sito attuale): verificare che sia ancora offerta.
  - Wi-Fi: la pagina camere lo indica sia "nelle aree comuni" sia tra i servizi di tutte le camere.
  - la Val di Sole Guest Card non è citata: sul sito attuale le condizioni sono ferme al 2022.
- La pagina interna in tedesco per le camere non è stata trovata: i link DE puntano alla pagina "Unterkunft".
