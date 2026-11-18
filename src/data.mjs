// Dati del sito. Le foto delle camere sono ancora quelle di locandaelisa.it (OLD):
// quando arrivano quelle nuove vanno messe in src/assets/img/ e aggiornati i percorsi qui.
export const PUBLIC_URL = (process.env.SITE || 'https://garnidellalocanda.it').replace(/\/$/, '') + '/';
// In modalità "in arrivo" il sito completo vive in /anteprima/
export const SITE_URL = process.env.COMING_SOON ? `${PUBLIC_URL}anteprima/` : PUBLIC_URL;
export const REQUEST_EMAIL = 'info@locandaelisa.it';
export const PHONE = '+39 377 3591831';
export const PHONE_HREF = 'tel:+393773591831';
export const MAPS_URL = 'https://www.google.com/maps/search/?api=1&query=Piazza+Centrale+11+38025+Dimaro+Folgarida+TN';

export const LANGS = [
  { code: 'it', path: '', label: 'IT' },
  { code: 'en', path: 'en/', label: 'EN' },
  { code: 'de', path: 'de/', label: 'DE' },
  { code: 'pl', path: 'pl/', label: 'PL' },
];

const OLD = 'https://locandaelisa.it/wp-content/uploads/';

// Foto: percorsi locali (assets/...) o indirizzi completi
export const IMG = {
  hero: 'assets/img/ingresso-garni.webp',
  breakfast: 'assets/img/sala-colazione.webp',
  croissant: 'assets/img/colazione-croissant.webp',
  bar: 'assets/img/ingresso-bottega-moderna.webp',
  rooms: OLD + '2024/01/072-Locanda-Elisa-Dic-2023-jpg.webp',
  view: OLD + '2024/01/076-Locanda-Elisa-Dic-2023-jpg.webp',
};

// Le camere (key = chiave dei testi in rooms.types)
export const ROOMS = [
  { slug: 'doppia', key: 'double', size: 17, beds: 2,
    photos: [OLD + '2024/01/063-Locanda-Elisa-Dic-2023-1-jpg.webp', OLD + '2024/01/065-Locanda-Elisa-Dic-2023-jpg.webp', OLD + '2024/03/074-Locanda-Elisa-Dic-2023-jpg.webp', OLD + '2024/01/066-Locanda-Elisa-Dic-2023-jpg.webp'] },
  { slug: 'tripla', key: 'triple', size: 23, beds: 3,
    photos: [OLD + '2024/03/057-Locanda-Elisa-Dic-2023-jpg.webp', OLD + '2024/01/072-Locanda-Elisa-Dic-2023-jpg.webp', OLD + '2024/03/074-Locanda-Elisa-Dic-2023-jpg.webp', OLD + '2024/01/076-Locanda-Elisa-Dic-2023-jpg.webp'] },
  // Quadrupla: superficie da confermare (size: null = non mostrata); foto provvisorie, in attesa di quelle della camera
  { slug: 'quadrupla', key: 'quad', size: null, beds: 4,
    photos: [OLD + '2024/01/066-Locanda-Elisa-Dic-2023-jpg.webp', OLD + '2024/01/065-Locanda-Elisa-Dic-2023-jpg.webp', OLD + '2024/03/074-Locanda-Elisa-Dic-2023-jpg.webp', OLD + '2024/01/076-Locanda-Elisa-Dic-2023-jpg.webp'] },
];

// Orari del bar Bottega Moderna (tutti i giorni, aperto anche al pubblico)
export const BAR_HOURS = [['09:30', '13:30'], ['17:00', '22:00']];

// Pagine: chiave -> percorso (uguale in tutte le lingue)
export const PAGES = {
  home: '',
  rooms: 'camere/',
  bar: 'bar/',
  valdisole: 'val-di-sole/',
  request: 'richiesta/',
};
