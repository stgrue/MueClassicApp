// ui.js — DOM creation and rendering helpers for Mü Scoring App

import { getTeamTarget, getMaxBid, getPotentialBonus } from './scoring.js';

const TRUMP_OPTIONS = [
  { value: '', label: '— select —' },
  { value: 'red', label: 'Red' },
  { value: 'blue', label: 'Blue' },
  { value: 'purple', label: 'Purple' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'green', label: 'Green' },
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
  { value: 'none', label: 'None' },
];

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
  const opts = [{ value: '', label: '— select —' }];
  players.forEach((name, i) => opts.push({ value: String(i), label: name }));
  if (includeNone) opts.push({ value: 'none_player', label: 'None' });
  return opts;
}

function bidOptions(numPlayers) {
  const max = getMaxBid(numPlayers);
  const opts = [{ value: '', label: '—' }];
  for (let i = 1; i <= max; i++) opts.push({ value: String(i), label: String(i) });
  return opts;
}

// ── Player Setup ──

export function renderPlayerSetup(container, onStart) {
  const wrapper = el('div', { className: 'player-setup' });

  const title = el('h2', { textContent: 'New Game' });
  wrapper.appendChild(title);

  const countLabel = el('label', { textContent: 'Number of players: ' });
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
      const label = el('label', { textContent: `Player ${i + 1}: ` });
      const input = el('input', { type: 'text', placeholder: `Player ${i + 1}`, className: 'player-name-input' });
      label.appendChild(input);
      row.appendChild(label);
      fieldsDiv.appendChild(row);
    }
  }

  renderFields();

  const startBtn = el('button', {
    textContent: 'Start Game',
    className: 'btn btn-primary',
    onClick: () => {
      const inputs = fieldsDiv.querySelectorAll('.player-name-input');
      const names = Array.from(inputs).map((inp, i) => inp.value.trim() || `Player ${i + 1}`);
      onStart(names);
    },
  });
  wrapper.appendChild(startBtn);

  container.appendChild(wrapper);
}

// ── Banner ──

export function renderBanner() {
  const banner = document.getElementById('banner');
  if (!banner) return;
  banner.innerHTML = '';
  const logo = el('img', { src: 'img/mue-and-more_logo_placeholder.svg', alt: 'Mü Logo', className: 'banner-logo' });
  const title = el('span', { className: 'banner-title' }, 'Scoring App');
  const ghLink = el('a', {
    href: 'https://github.com/stgrue/MueClassicApp',
    target: '_blank',
    rel: 'noopener noreferrer',
    className: 'banner-github',
    title: 'View on GitHub',
  });
  ghLink.appendChild(el('img', { src: 'img/github-mark.svg', alt: 'GitHub', width: 28, height: 28 }));
  banner.appendChild(logo);
  banner.appendChild(title);
  banner.appendChild(ghLink);
}

// ── Reset Button ──

export function renderResetButton(container, onReset, onPrint) {
  const wrapper = el('div', { className: 'reset-wrapper' });
  if (onPrint) {
    wrapper.appendChild(el('button', {
      textContent: 'Print version',
      className: 'btn btn-print',
      onClick: onPrint,
    }));
  }
  const btn = el('button', {
    textContent: 'Reset Game',
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
  header.appendChild(el('h3', { textContent: `Round ${roundIndex + 1}` }));
  const trashBtn = el('button', {
    className: 'btn-trash',
    title: 'Delete round',
    onClick: onRemove,
  });
  trashBtn.appendChild(el('img', { src: 'img/trash.svg', alt: 'Delete' }));
  header.appendChild(trashBtn);
  card.appendChild(header);

  // Round info form (3-column grid)
  const form = el('div', { className: 'round-form round-grid' });

  // Row 1: Chief / Partner / Vice
  form.appendChild(labeledSelect('Chief:', playerOptions(players), round.chief, v => onUpdate('chief', v)));
  if (!is3Player) {
    form.appendChild(labeledSelect('Partner:', playerOptions(players), round.partner, v => onUpdate('partner', v)));
    form.appendChild(labeledSelect('Vice:', playerOptions(players, true), round.vice, v => onUpdate('vice', v)));
  } else {
    form.appendChild(el('span'));
    form.appendChild(el('span'));
  }

  // Row 2: Chief's Trump / Vice's Trump / (empty)
  form.appendChild(labeledSelect("Chief's Trump:", TRUMP_OPTIONS, round.chiefTrump, v => onUpdate('chiefTrump', v)));
  if (!is3Player) {
    if (round.vice === 'none_player') {
      form.appendChild(labeledSelect("Vice's Trump:", [{ value: 'none', label: 'None' }], 'none', () => {}));
    } else {
      form.appendChild(labeledSelect("Vice's Trump:", TRUMP_OPTIONS, round.viceTrump, v => onUpdate('viceTrump', v)));
    }
  } else {
    form.appendChild(el('span'));
  }
  form.appendChild(el('span'));

  // Row 3: Bid / Target / Bonus
  form.appendChild(labeledSelect('Bid:', bidOptions(numPlayers), round.chiefBid, v => onUpdate('chiefBid', v)));

  const targetSpan = el('span', {
    className: 'info-display',
    textContent: `Target: ${result.target !== null && result.target !== undefined ? result.target : '—'}`,
  });
  form.appendChild(targetSpan);

  const potentialBonus = getPotentialBonus(round.chiefTrump, round.chiefBid);
  const bonusSpan = el('span', {
    className: 'info-display',
    textContent: `Bonus: ${potentialBonus !== null ? potentialBonus : '—'}`,
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
  pointsRow.appendChild(el('td', { textContent: 'Points', className: 'row-label' }));
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
  bonusRow.appendChild(el('td', { textContent: 'Bonus', className: 'row-label' }));
  for (let p = 0; p < numPlayers; p++) {
    const val = result.bonus[p];
    const td = el('td', {
      textContent: val !== 0 ? String(val) : '—',
      className: val > 0 ? 'positive' : val < 0 ? 'negative' : '',
    });
    bonusRow.appendChild(td);
  }
  tbody.appendChild(bonusRow);

  // Sum row (computed)
  const sumRow = el('tr', { className: 'sum-row' });
  sumRow.appendChild(el('td', { textContent: 'Sum', className: 'row-label' }));
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
      errDiv.appendChild(el('div', { textContent: err, className: 'error-msg' }));
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
  header.appendChild(el('h3', { textContent: `Round ${roundIndex + 1} (Stalemate)` }));
  const trashBtn = el('button', {
    className: 'btn-trash',
    title: 'Delete round',
    onClick: onRemove,
  });
  trashBtn.appendChild(el('img', { src: 'img/trash.svg', alt: 'Delete' }));
  header.appendChild(trashBtn);
  card.appendChild(header);

  // Tied players checkboxes
  const form = el('div', { className: 'round-form' });

  const tiedLabel = el('div', { className: 'form-label', textContent: 'Tied players:' });
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
  const provocateurOpts = [{ value: '', label: '— select —' }];
  for (const idx of round.tiedPlayers) {
    provocateurOpts.push({ value: String(idx), label: players[idx] });
  }
  const provRow = el('div', { className: 'form-row' });
  provRow.appendChild(labeledSelect('Provocateur:', provocateurOpts, round.provocateur, v => onUpdate('provocateur', v)));

  // Cards bid dropdown
  const cardsBidOpts = [{ value: '', label: '—' }];
  for (let i = 0; i <= 15; i++) {
    cardsBidOpts.push({ value: String(i), label: String(i) });
  }
  provRow.appendChild(labeledSelect('Cards bid:', cardsBidOpts, String(round.cardsBid), v => onUpdate('cardsBid', v === '' ? '' : Number(v))));

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
  bonusRow.appendChild(el('td', { textContent: 'Sum', className: 'row-label' }));
  for (let p = 0; p < numPlayers; p++) {
    const val = result.bonus[p];
    bonusRow.appendChild(el('td', {
      textContent: val !== 0 ? String(val) : '—',
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
      errDiv.appendChild(el('div', { textContent: err, className: 'error-msg' }));
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
  row.appendChild(el('td', { textContent: 'Total', className: 'row-label subtotal-label' }));
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
    ? { className: 'btn btn-primary', disabled: 'true', title: 'Please fix incomplete or incorrect rounds first' }
    : { className: 'btn btn-primary' };
  const roundBtn = el('button', { textContent: 'Add Round', ...attrs });
  const stalemateBtn = el('button', { textContent: 'Add Round (Stalemate)', ...attrs });
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

// ── Print HTML Generator ──

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatTrump(val) {
  if (!val || val === 'none') return val === 'none' ? 'None' : '—';
  const colors = ['red', 'blue', 'purple', 'yellow', 'green'];
  if (colors.includes(val)) return val.charAt(0).toUpperCase() + val.slice(1);
  return val; // numbers as-is
}

export function generatePrintHTML(players, rounds, computeRoundFn) {
  const esc = escapeHTML;
  const n = players.length;
  const is3Player = n === 3;
  const cols = n + 1; // label column + player columns
  const totals = new Array(n).fill(0);

  // Table header with player names
  let rows = `<thead><tr><th></th>`;
  for (const name of players) rows += `<th>${esc(name)}</th>`;
  rows += `</tr></thead><tbody>`;

  for (let i = 0; i < rounds.length; i++) {
    const round = rounds[i];
    const result = computeRoundFn(round);
    const hasErrors = result.errors.length > 0;

    if (round.type === 'stalemate') {
      // Info row spanning all columns
      const tiedNames = (round.tiedPlayers || []).map(idx => esc(players[idx])).join(', ');
      const provName = round.provocateur !== '' && round.provocateur !== null && round.provocateur !== undefined
        ? esc(players[Number(round.provocateur)]) : '—';
      const cards = round.cardsBid !== '' && round.cardsBid !== null && round.cardsBid !== undefined
        ? round.cardsBid : '—';
      rows += `<tr class="round-info"><td colspan="${cols}">`;
      rows += `<strong>Round ${i + 1} (Stalemate)</strong> — `;
      rows += `Tied: ${tiedNames || '—'} — Provocateur: ${provName} — Cards bid: ${cards}`;
      rows += `</td></tr>`;

      // Sum row
      rows += `<tr class="sum-row"><td class="label">Sum</td>`;
      for (let p = 0; p < n; p++) {
        const val = hasErrors ? '—' : (result.bonus[p] !== 0 ? result.bonus[p] : '—');
        rows += `<td>${val}</td>`;
      }
      rows += `</tr>`;

      if (!hasErrors) {
        for (let p = 0; p < n; p++) totals[p] += result.sum[p];
      }
    } else {
      // Info row spanning all columns
      const chiefName = round.chief !== '' ? esc(players[Number(round.chief)]) : '—';
      let info = `<strong>Round ${i + 1}</strong> — Chief: ${chiefName}`;
      if (!is3Player) {
        const partnerName = round.partner !== '' ? esc(players[Number(round.partner)]) : '—';
        const viceName = round.vice === 'none_player' ? 'None' : (round.vice !== '' ? esc(players[Number(round.vice)]) : '—');
        info += ` — Partner: ${partnerName} — Vice: ${viceName}`;
      }
      info += ` — Chief's trump: ${formatTrump(round.chiefTrump)}`;
      if (!is3Player) {
        info += ` — Vice's trump: ${formatTrump(round.viceTrump)}`;
      }
      const bid = round.chiefBid !== '' ? round.chiefBid : '—';
      info += ` — Bid: ${bid}`;
      rows += `<tr class="round-info"><td colspan="${cols}">${info}</td></tr>`;

      // Points row
      rows += `<tr><td class="label">Points</td>`;
      for (let p = 0; p < n; p++) {
        const val = round.pips[p] !== '' && round.pips[p] !== undefined ? round.pips[p] : '—';
        rows += `<td>${val}</td>`;
      }
      rows += `</tr>`;

      // Bonus row
      rows += `<tr><td class="label">Bonus</td>`;
      for (let p = 0; p < n; p++) {
        const val = hasErrors ? '—' : (result.bonus[p] !== 0 ? result.bonus[p] : '—');
        rows += `<td>${val}</td>`;
      }
      rows += `</tr>`;

      // Sum row
      rows += `<tr class="sum-row"><td class="label">Sum</td>`;
      for (let p = 0; p < n; p++) {
        const val = hasErrors ? '—' : result.sum[p];
        rows += `<td>${val}</td>`;
      }
      rows += `</tr>`;

      if (!hasErrors) {
        for (let p = 0; p < n; p++) totals[p] += result.sum[p];
      }
    }
  }

  // Total row
  rows += `<tr class="total-row"><td class="label">Total</td>`;
  for (let p = 0; p < n; p++) rows += `<td>${totals[p]}</td>`;
  rows += `</tr>`;

  rows += `</tbody>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Mü Score Sheet</title>
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #222; }
  h1 { text-align: center; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { padding: 5px 10px; text-align: center; border: 1px solid #bbb; }
  th { background: #e0e0e0; font-weight: 600; font-size: 0.95rem; }
  .label { text-align: left; font-weight: 500; }
  .round-info { background: #e8f0fe; }
  .round-info td { text-align: left; font-size: 0.82rem; color: #333; padding: 6px 10px; border-top: 2px solid #999; }
  .sum-row { font-weight: 600; }
  .total-row { background: #d4e6fc; font-weight: 700; font-size: 1rem; }
  .total-row td { border-top: 3px solid #555; padding: 8px 10px; }
</style>
</head><body>
<h1>Mü Score Sheet</h1>
<table>${rows}</table>
</body></html>`;
}
