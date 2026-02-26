// i18n.js — Localization module for Mü Scoring App

const translations = {
  en: {
    // Banner
    scoring_app: 'Scoring App',

    // Player setup
    new_game: 'New Game',
    num_players: 'Number of players:',
    player_n: (n) => `Player ${n}:`,
    player_n_placeholder: (n) => `Player ${n}`,
    player_n_default: (n) => `Player ${n}`,
    start_game: 'Start Game',

    // Round header
    round_n: (n) => `Round ${n}`,
    round_n_stalemate: (n) => `Round ${n} (Stalemate)`,
    delete_round: 'Delete round',

    // Round form labels
    chief: 'Chief:',
    partner: 'Partner:',
    vice: 'Vice:',
    chief_trump: "Chief's Trump:",
    vice_trump: "Vice's Trump:",
    bid: 'Bid:',
    target: 'Target:',
    bonus: 'Bonus:',

    // Stalemate labels
    tied_players: 'Tied players:',
    provocateur: 'Provocateur:',
    cards_bid: 'Cards bid:',

    // Dropdown placeholders
    select_placeholder: '\u2014 select \u2014',
    dash_placeholder: '\u2014',
    none: 'None',

    // Trump color names
    trump_red: 'Red',
    trump_blue: 'Blue',
    trump_purple: 'Purple',
    trump_yellow: 'Yellow',
    trump_green: 'Green',
    trump_none: 'None',

    // Table row labels
    points: 'Points',
    bonus_row: 'Bonus',
    sum: 'Sum',
    total: 'Total',

    // Buttons
    add_round: 'Add Round',
    add_round_stalemate: 'Add Round (Stalemate)',
    reset_game: 'Reset Game',
    print_version: 'Print version',
    btn_disabled_title: 'Please fix incomplete or incorrect rounds first',

    // Confirm dialogs
    confirm_delete_round: (n) => `Delete Round ${n}? This cannot be undone.`,
    confirm_reset: 'Reset the entire game? All scores will be lost.',
    alert_popup_blocked: 'Please allow popups to print.',

    // Print page
    print_title: 'Mü Score Sheet',
    print_chief: 'Chief',
    print_partner: 'Partner',
    print_vice: 'Vice',
    print_chief_trump: "Chief's trump",
    print_vice_trump: "Vice's trump",
    print_bid: 'Bid',
    print_tied: 'Tied',
    print_provocateur: 'Provocateur',
    print_cards_bid: 'Cards bid',

    // Validation errors (from scoring.js)
    err_chief_required: 'Chief must be selected.',
    err_vice_required: 'Vice must be selected.',
    err_partner_required: 'Partner must be selected.',
    err_roles_distinct: 'Chief, Vice, and Partner must be different players.',
    err_chief_trump_required: "Chief's trump must be selected.",
    err_vice_trump_required: "Vice's trump must be selected.",
    err_vice_trump_none_required: "Vice's trump must be None when Vice is None.",
    err_vice_trump_none_forbidden: "Vice's trump can only be None when Vice is None.",
    err_vice_trump_same: "Vice's trump must be different from Chief's trump.",
    err_bid_required: "Chief's bid must be selected.",
    err_bid_range: (max) => `Chief's bid must be between 1 and ${max}.`,
    err_pips_sum: (expected, actual) => `Card points must sum to ${expected} (currently ${actual}).`,
    err_pips_incomplete: 'All card points must be filled in.',

    // Stalemate validation errors (from app.js)
    err_tied_min: 'At least two tied players must be selected.',
    err_provocateur_required: 'Provocateur must be selected.',
    err_provocateur_not_tied: 'Provocateur must be one of the tied players.',
    err_cards_bid_required: 'Number of cards bid must be entered.',
  },

  de: {
    // Banner
    scoring_app: 'Punkte-App',

    // Player setup
    new_game: 'Neues Spiel',
    num_players: 'Anzahl Spieler:',
    player_n: (n) => `Spieler ${n}:`,
    player_n_placeholder: (n) => `Spieler ${n}`,
    player_n_default: (n) => `Spieler ${n}`,
    start_game: 'Spiel starten',

    // Round header
    round_n: (n) => `Runde ${n}`,
    round_n_stalemate: (n) => `Runde ${n} (Eklat)`,
    delete_round: 'Runde löschen',

    // Round form labels
    chief: 'Chef:',
    partner: 'Partner:',
    vice: 'Vize:',
    chief_trump: 'Chef-Trumpf:',
    vice_trump: 'Vize-Trumpf:',
    bid: 'Gebot:',
    target: 'Ziel:',
    bonus: 'Bonus:',

    // Stalemate labels
    tied_players: 'Gleichstand:',
    provocateur: 'Provokateur:',
    cards_bid: 'Gebotene Karten:',

    // Dropdown placeholders
    select_placeholder: '\u2014 wählen \u2014',
    dash_placeholder: '\u2014',
    none: 'Keiner',

    // Trump color names
    trump_red: 'Rot',
    trump_blue: 'Blau',
    trump_purple: 'Lila',
    trump_yellow: 'Gelb',
    trump_green: 'Grün',
    trump_none: 'Kein Trumpf',

    // Table row labels
    points: 'Punkte',
    bonus_row: 'Bonus',
    sum: 'Summe',
    total: 'Gesamtsumme',

    // Buttons
    add_round: 'Nächste Runde',
    add_round_stalemate: 'Nächste Runde (Eklat)',
    reset_game: 'Spiel zurücksetzen',
    print_version: 'Druckversion',
    btn_disabled_title: 'Bitte zuerst unvollständige oder fehlerhafte Runden korrigieren',

    // Confirm dialogs
    confirm_delete_round: (n) => `Runde ${n} löschen? Dies kann nicht rückgängig gemacht werden.`,
    confirm_reset: 'Spiel zurücksetzen? Alle Punkte gehen verloren.',
    alert_popup_blocked: 'Bitte Popups erlauben, um zu drucken.',

    // Print page
    print_title: 'Mü-Punkteblatt',
    print_chief: 'Chef',
    print_partner: 'Partner',
    print_vice: 'Vize',
    print_chief_trump: 'Chef-Trumpf',
    print_vice_trump: 'Vize-Trumpf',
    print_bid: 'Gebot',
    print_tied: 'Gleichstand',
    print_provocateur: 'Provokateur',
    print_cards_bid: 'Gebotene Karten',

    // Validation errors (from scoring.js)
    err_chief_required: 'Chef muss ausgewählt werden.',
    err_vice_required: 'Vize muss ausgewählt werden.',
    err_partner_required: 'Partner muss ausgewählt werden.',
    err_roles_distinct: 'Chef, Vize und Partner müssen verschiedene Spieler sein.',
    err_chief_trump_required: 'Chef-Trumpf muss ausgewählt werden.',
    err_vice_trump_required: 'Vize-Trumpf muss ausgewählt werden.',
    err_vice_trump_none_required: 'Vize-Trumpf muss Kein Trumpf sein, wenn Vize Keiner ist.',
    err_vice_trump_none_forbidden: 'Vize-Trumpf kann nur Kein Trumpf sein, wenn Vize Keiner ist.',
    err_vice_trump_same: 'Vize-Trumpf muss sich vom Chef-Trumpf unterscheiden.',
    err_bid_required: 'Gebot des Chefs muss ausgewählt werden.',
    err_bid_range: (max) => `Das Gebot des Chefs muss zwischen 1 und ${max} liegen.`,
    err_pips_sum: (expected, actual) => `Kartenpunkte müssen ${expected} ergeben (aktuell ${actual}).`,
    err_pips_incomplete: 'Alle Kartenpunkte müssen ausgefüllt sein.',

    // Stalemate validation errors (from app.js)
    err_tied_min: 'Mindestens zwei Spieler im Gleichstand müssen ausgewählt werden.',
    err_provocateur_required: 'Provokateur muss ausgewählt werden.',
    err_provocateur_not_tied: 'Provokateur muss einer der Spieler im Gleichstand sein.',
    err_cards_bid_required: 'Anzahl gebotener Karten muss eingegeben werden.',
  },
};

let currentLang = 'en';

export function initLang() {
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  if (urlLang && translations[urlLang]) {
    currentLang = urlLang;
  } else {
    const stored = localStorage.getItem('mue_lang');
    if (stored && translations[stored]) {
      currentLang = stored;
    } else {
      currentLang = 'en';
    }
  }
  localStorage.setItem('mue_lang', currentLang);
  document.documentElement.lang = currentLang;
}

export function getLang() {
  return currentLang;
}

export function setLang(code) {
  if (!translations[code]) return;
  currentLang = code;
  localStorage.setItem('mue_lang', currentLang);
  document.documentElement.lang = currentLang;
  const url = new URL(window.location);
  url.searchParams.set('lang', code);
  history.replaceState(null, '', url);
}

export function t(key, ...args) {
  const entry = translations[currentLang]?.[key] ?? translations.en?.[key];
  if (typeof entry === 'function') return entry(...args);
  if (entry !== undefined) return entry;
  return key;
}
