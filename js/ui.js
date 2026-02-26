// ui.js — DOM creation and rendering helpers for Mü Scoring App

import { getTeamTarget, getMaxBid, getPotentialBonus } from './scoring.js';
import { t, getLang } from './i18n.js';

function trumpOptions() {
  return [
    { value: '', label: t('select_placeholder') },
    { value: 'red', label: t('trump_red') },
    { value: 'blue', label: t('trump_blue') },
    { value: 'purple', label: t('trump_purple') },
    { value: 'yellow', label: t('trump_yellow') },
    { value: 'green', label: t('trump_green') },
    { value: '0', label: '0' },
    { value: '1', label: '1' },
    { value: '2', label: '2' },
    { value: '3', label: '3' },
    { value: '4', label: '4' },
    { value: '5', label: '5' },
    { value: '6', label: '6' },
    { value: '7', label: '7' },
    { value: '8', label: '8' },
    { value: '9', label: '9' },
    { value: 'none', label: t('trump_none') },
  ];
}

function el(tag, attrs = {}, children = []) {
  const elem = document.createElement(tag);
  for (const [key, val] of Object.entries(attrs)) {
    if (key === 'className') elem.className = val;
    else if (key === 'textContent') elem.textContent = val;
    else if (key === 'innerHTML') elem.innerHTML = val;
    else if (key.startsWith('on')) elem.addEventListener(key.slice(2).toLowerCase(), val);
    else elem.setAttribute(key, val);
  }
  for (const child of Array.isArray(children) ? children : [children]) {
    if (typeof child === 'string') elem.appendChild(document.createTextNode(child));
    else if (child) elem.appendChild(child);
  }
  return elem;
}

function createSelect(options, selectedValue, onChange) {
  const select = el('select', { onChange });
  for (const opt of options) {
    const option = el('option', { value: opt.value, textContent: opt.label });
    if (String(opt.value) === String(selectedValue)) option.selected = true;
    select.appendChild(option);
  }
  return select;
}

function playerOptions(players, includeNone = false) {
  const opts = [{ value: '', label: t('select_placeholder') }];
  players.forEach((name, i) => opts.push({ value: String(i), label: name }));
  if (includeNone) opts.push({ value: 'none_player', label: t('none') });
  return opts;
}

function bidOptions(numPlayers) {
  const max = getMaxBid(numPlayers);
  const opts = [{ value: '', label: t('dash_placeholder') }];
  for (let i = 1; i <= max; i++) opts.push({ value: String(i), label: String(i) });
  return opts;
}

// ── Player Setup ──

export function renderPlayerSetup(container, onStart) {
  const wrapper = el('div', { className: 'player-setup' });

  const title = el('h2', { textContent: t('new_game') });
  wrapper.appendChild(title);

  const countLabel = el('label', { textContent: t('num_players') + ' ' });
  const countSelect = createSelect(
    [3, 4, 5, 6].map(n => ({ value: String(n), label: String(n) })),
    '5',
    () => renderFields()
  );
  countLabel.appendChild(countSelect);
  wrapper.appendChild(countLabel);

  const fieldsDiv = el('div', { className: 'player-fields' });
  wrapper.appendChild(fieldsDiv);

  function renderFields() {
    const count = parseInt(countSelect.value, 10);
    fieldsDiv.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const row = el('div', { className: 'player-name-row' });
      const label = el('label', { textContent: t('player_n', i + 1) + ' ' });
      const input = el('input', { type: 'text', placeholder: t('player_n_placeholder', i + 1), className: 'player-name-input' });
      label.appendChild(input);
      row.appendChild(label);
      fieldsDiv.appendChild(row);
    }
  }

  renderFields();

  const startBtn = el('button', {
    textContent: t('start_game'),
    className: 'btn btn-primary',
    onClick: () => {
      const inputs = fieldsDiv.querySelectorAll('.player-name-input');
      const names = Array.from(inputs).map((inp, i) => inp.value.trim() || t('player_n_default', i + 1));
      onStart(names);
    },
  });
  wrapper.appendChild(startBtn);

  container.appendChild(wrapper);
}

// ── Banner ──

export function renderBanner(onLangChange) {
  const banner = document.getElementById('banner');
  if (!banner) return;
  banner.innerHTML = '';
  const logo = el('img', { src: 'img/mue-and-more_logo_placeholder.svg', alt: 'Mü Logo', className: 'banner-logo' });
  const title = el('span', { className: 'banner-title' }, t('scoring_app'));
  const ghLink = el('a', {
    href: 'https://github.com/stgrue/MueClassicApp',
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'banner-github',
    title: 'View on GitHub',
  });
  ghLink.appendChild(el('img', { src: 'img/github-mark.svg', alt: 'GitHub', width: 28, height: 28 }));

  const langSelect = createSelect(
    [
      { value: 'en', label: 'EN' },
      { value: 'de', label: 'DE' },
    ],
    getLang(),
    (e) => { if (onLangChange) onLangChange(e.target.value); }
  );
  langSelect.className = 'banner-lang';

  banner.appendChild(logo);
  banner.appendChild(title);
  banner.appendChild(ghLink);
  banner.appendChild(langSelect);
}

// ── Reset Button ──

export function renderResetButton(container, onReset, onPrint) {
  const wrapper = el('div', { className: 'reset-wrapper' });
  if (onPrint) {
    wrapper.appendChild(el('button', {
      textContent: t('print_version'),
      className: 'btn btn-print',
      onClick: onPrint,
    }));
  }
  const btn = el('button', {
    textContent: t('reset_game'),
    className: 'btn btn-reset',
    onClick: onReset,
  });
  wrapper.appendChild(btn);
  container.appendChild(wrapper);
}

// ── Normal Round Card ──

export function renderRoundCard(container, roundIndex, round, players, result, { onUpdate, onRemove }) {
  const numPlayers = players.length;
  const is3Player = numPlayers === 3;

  const card = el('div', { className: 'round-card' });

  // Header
  const header = el('div', { className: 'round-header' });
  header.appendChild(el('h3', { textContent: t('round_n', roundIndex + 1) }));
  const trashBtn = el('button', {
    className: 'btn-trash',
    title: t('delete_round'),
    onClick: onRemove,
  });
  trashBtn.appendChild(el('img', { src: 'img/trash.svg', alt: 'Delete' }));
  header.appendChild(trashBtn);
  card.appendChild(header);

  // Round info form (3-column grid)
  const form = el('div', { className: 'round-form round-grid' });

  // Row 1: Chief / Partner / Vice
  form.appendChild(labeledSelect(t('chief'), playerOptions(players), round.chief, v => onUpdate('chief', v)));
  if (!is3Player) {
    form.appendChild(labeledSelect(t('partner'), playerOptions(players), round.partner, v => onUpdate('partner', v)));
    form.appendChild(labeledSelect(t('vice'), playerOptions(players, true), round.vice, v => onUpdate('vice', v)));
  } else {
    form.appendChild(el('span'));
    form.appendChild(el('span'));
  }

  // Row 2: Chief's Trump / Vice's Trump / (empty)
  form.appendChild(labeledSelect(t('chief_trump'), trumpOptions(), round.chiefTrump, v => onUpdate('chiefTrump', v)));
  if (!is3Player) {
    if (round.vice === 'none_player') {
      form.appendChild(labeledSelect(t('vice_trump'), [{ value: 'none', label: t('trump_none') }], 'none', () => {}));
    } else {
      form.appendChild(labeledSelect(t('vice_trump'), trumpOptions(), round.viceTrump, v => onUpdate('viceTrump', v)));
    }
  } else {
    form.appendChild(el('span'));
  }
  form.appendChild(el('span'));

  // Row 3: Bid / Target / Bonus
  form.appendChild(labeledSelect(t('bid'), bidOptions(numPlayers), round.chiefBid, v => onUpdate('chiefBid', v)));

  const targetSpan = el('span', {
    className: 'info-display',
    textContent: `${t('target')} ${result.target !== null && result.target !== undefined ? result.target : '\u2014'}`,
  });
  form.appendChild(targetSpan);

  const potentialBonus = getPotentialBonus(round.chiefTrump, round.chiefBid);
  const bonusSpan = el('span', {
    className: 'info-display',
    textContent: `${t('bonus')} ${potentialBonus !== null ? potentialBonus : '\u2014'}`,
  });
  form.appendChild(bonusSpan);

  card.appendChild(form);

  // Score table
  const table = el('table', { className: 'score-table' });

  // Header row
  const thead = el('thead');
  const headRow = el('tr');
  headRow.appendChild(el('th', { textContent: '' }));
  for (const name of players) {
    headRow.appendChild(el('th', { textContent: name }));
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');

  // Points row (editable)
  const pointsRow = el('tr');
  pointsRow.appendChild(el('td', { textContent: t('points'), className: 'row-label' }));
  for (let p = 0; p < numPlayers; p++) {
    const td = el('td');
    const input = el('input', {
      type: 'text',
      inputMode: 'numeric',
      pattern: '-?[0-9]*',
      className: 'pips-input',
      value: round.pips[p] !== '' ? String(round.pips[p]) : '',
      onInput: (e) => {
        const raw = e.target.value;
        if (raw === '' || raw === '-') {
          onUpdate(`pips.${p}`, raw === '-' ? '-' : '');
        } else {
          const num = Number(raw);
          if (!isNaN(num)) onUpdate(`pips.${p}`, num);
        }
      },
    });
    td.appendChild(input);
    pointsRow.appendChild(td);
  }
  tbody.appendChild(pointsRow);

  // Bonus row (computed)
  const bonusRow = el('tr');
  bonusRow.appendChild(el('td', { textContent: t('bonus_row'), className: 'row-label' }));
  for (let p = 0; p < numPlayers; p++) {
    const val = result.bonus[p];
    const td = el('td', {
      textContent: val !== 0 ? String(val) : '\u2014',
      className: val > 0 ? 'positive' : val < 0 ? 'negative' : '',
    });
    bonusRow.appendChild(td);
  }
  tbody.appendChild(bonusRow);

  // Sum row (computed)
  const sumRow = el('tr', { className: 'sum-row' });
  sumRow.appendChild(el('td', { textContent: t('sum'), className: 'row-label' }));
  for (let p = 0; p < numPlayers; p++) {
    const val = result.sum[p];
    sumRow.appendChild(el('td', { textContent: String(val) }));
  }
  tbody.appendChild(sumRow);

  table.appendChild(tbody);
  card.appendChild(table);

  // Validation errors
  if (result.errors.length > 0) {
    const errDiv = el('div', { className: 'validation-errors' });
    for (const err of result.errors) {
      errDiv.appendChild(el('div', { textContent: t(err.key, ...err.args), className: 'error-msg' }));
    }
    card.appendChild(errDiv);
  }

  container.appendChild(card);
}

// ── Stalemate Round Card ──

export function renderStalemateCard(container, roundIndex, round, players, result, { onUpdate, onRemove }) {
  const numPlayers = players.length;
  const card = el('div', { className: 'round-card stalemate-card' });

  // Header
  const header = el('div', { className: 'round-header' });
  header.appendChild(el('h3', { textContent: t('round_n_stalemate', roundIndex + 1) }));
  const trashBtn = el('button', {
    className: 'btn-trash',
    title: t('delete_round'),
    onClick: onRemove,
  });
  trashBtn.appendChild(el('img', { src: 'img/trash.svg', alt: 'Delete' }));
  header.appendChild(trashBtn);
  card.appendChild(header);

  // Tied players checkboxes
  const form = el('div', { className: 'round-form' });

  const tiedLabel = el('div', { className: 'form-label', textContent: t('tied_players') });
  form.appendChild(tiedLabel);

  const checkboxRow = el('div', { className: 'checkbox-row' });
  for (let i = 0; i < numPlayers; i++) {
    const label = el('label', { className: 'checkbox-label' });
    const cb = el('input', {
      type: 'checkbox',
      value: String(i),
      onChange: () => {
        const checked = Array.from(checkboxRow.querySelectorAll('input[type=checkbox]:checked'))
          .map(c => Number(c.value));
        onUpdate('tiedPlayers', checked);
      },
    });
    if (round.tiedPlayers.includes(i)) cb.checked = true;
    label.appendChild(cb);
    label.appendChild(document.createTextNode(' ' + players[i]));
    checkboxRow.appendChild(label);
  }
  form.appendChild(checkboxRow);

  // Provocateur dropdown (from tied players)
  const provocateurOpts = [{ value: '', label: t('select_placeholder') }];
  for (const idx of round.tiedPlayers) {
    provocateurOpts.push({ value: String(idx), label: players[idx] });
  }
  const provRow = el('div', { className: 'form-row' });
  provRow.appendChild(labeledSelect(t('provocateur'), provocateurOpts, round.provocateur, v => onUpdate('provocateur', v)));

  // Cards bid dropdown
  const cardsBidOpts = [{ value: '', label: t('dash_placeholder') }];
  for (let i = 0; i <= 15; i++) {
    cardsBidOpts.push({ value: String(i), label: String(i) });
  }
  provRow.appendChild(labeledSelect(t('cards_bid'), cardsBidOpts, String(round.cardsBid), v => onUpdate('cardsBid', v === '' ? '' : Number(v))));

  form.appendChild(provRow);
  card.appendChild(form);

  // Score table (sum only)
  const table = el('table', { className: 'score-table' });
  const thead = el('thead');
  const headRow = el('tr');
  headRow.appendChild(el('th', { textContent: '' }));
  for (const name of players) {
    headRow.appendChild(el('th', { textContent: name }));
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = el('tbody');
  const bonusRow = el('tr');
  bonusRow.appendChild(el('td', { textContent: t('sum'), className: 'row-label' }));
  for (let p = 0; p < numPlayers; p++) {
    const val = result.bonus[p];
    bonusRow.appendChild(el('td', {
      textContent: val !== 0 ? String(val) : '\u2014',
      className: val > 0 ? 'positive' : val < 0 ? 'negative' : '',
    }));
  }
  tbody.appendChild(bonusRow);
  table.appendChild(tbody);
  card.appendChild(table);

  // Validation errors
  if (result.errors.length > 0) {
    const errDiv = el('div', { className: 'validation-errors' });
    for (const err of result.errors) {
      errDiv.appendChild(el('div', { textContent: t(err.key, ...err.args), className: 'error-msg' }));
    }
    card.appendChild(errDiv);
  }

  container.appendChild(card);
}

// ── Subtotal Row ──

export function renderSubtotalRow(container, players, subtotals) {
  const table = el('table', { className: 'subtotal-table' });
  const headerRow = el('tr');
  headerRow.appendChild(el('td', { className: 'row-label' }));
  for (let p = 0; p < players.length; p++) {
    headerRow.appendChild(el('td', { textContent: players[p], className: 'subtotal-name' }));
  }
  table.appendChild(headerRow);
  const row = el('tr');
  row.appendChild(el('td', { textContent: t('total'), className: 'row-label subtotal-label' }));
  for (let p = 0; p < players.length; p++) {
    row.appendChild(el('td', { textContent: String(subtotals[p]), className: 'subtotal-val' }));
  }
  table.appendChild(row);
  container.appendChild(table);
}

// ── Action Buttons ──

export function renderButtons(container, { onNextRound, onNextStalemate, disabled }) {
  const wrapper = el('div', { className: 'action-buttons' });
  const attrs = disabled
    ? { className: 'btn btn-primary', disabled: 'true', title: t('btn_disabled_title') }
    : { className: 'btn btn-primary' };
  const roundBtn = el('button', { textContent: t('add_round'), ...attrs });
  const stalemateBtn = el('button', { textContent: t('add_round_stalemate'), ...attrs });
  if (!disabled) {
    roundBtn.addEventListener('click', onNextRound);
    stalemateBtn.addEventListener('click', onNextStalemate);
  }
  wrapper.appendChild(roundBtn);
  wrapper.appendChild(stalemateBtn);
  container.appendChild(wrapper);
}

// ── Helpers ──

function labeledSelect(labelText, options, selectedValue, onChange) {
  const wrapper = el('label', { className: 'form-field' });
  wrapper.appendChild(document.createTextNode(labelText + ' '));
  wrapper.appendChild(createSelect(options, selectedValue, (e) => onChange(e.target.value)));
  return wrapper;
}
