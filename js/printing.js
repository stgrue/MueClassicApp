// printing.js — Print HTML generation for Mü Scoring App

import { t } from './i18n.js';

function escapeHTML(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function formatTrump(val) {
  if (!val || val === 'none') return val === 'none' ? t('trump_none') : '\u2014';
  const colorKeys = { red: 'trump_red', blue: 'trump_blue', purple: 'trump_purple', yellow: 'trump_yellow', green: 'trump_green' };
  if (colorKeys[val]) return t(colorKeys[val]);
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
        ? esc(players[Number(round.provocateur)]) : '\u2014';
      const cards = round.cardsBid !== '' && round.cardsBid !== null && round.cardsBid !== undefined
        ? round.cardsBid : '\u2014';
      rows += `<tr class="round-info"><td colspan="${cols}">`;
      rows += `<strong>${esc(t('round_n_stalemate', i + 1))}</strong> \u2014 `;
      rows += `${esc(t('print_tied'))}: ${tiedNames || '\u2014'} \u2014 ${esc(t('print_provocateur'))}: ${provName} \u2014 ${esc(t('print_cards_bid'))}: ${cards}`;
      rows += `</td></tr>`;

      // Sum row
      rows += `<tr class="sum-row"><td class="label">${esc(t('sum'))}</td>`;
      for (let p = 0; p < n; p++) {
        const val = hasErrors ? '\u2014' : (result.bonus[p] !== 0 ? result.bonus[p] : '\u2014');
        rows += `<td>${val}</td>`;
      }
      rows += `</tr>`;

      if (!hasErrors) {
        for (let p = 0; p < n; p++) totals[p] += result.sum[p];
      }
    } else {
      // Info row spanning all columns
      const chiefName = round.chief !== '' ? esc(players[Number(round.chief)]) : '\u2014';
      let info = `<strong>${esc(t('round_n', i + 1))}</strong> \u2014 ${esc(t('print_chief'))}: ${chiefName}`;
      if (!is3Player) {
        const partnerName = round.partner !== '' ? esc(players[Number(round.partner)]) : '\u2014';
        const viceName = round.vice === 'none_player' ? esc(t('none')) : (round.vice !== '' ? esc(players[Number(round.vice)]) : '\u2014');
        info += ` \u2014 ${esc(t('print_partner'))}: ${partnerName} \u2014 ${esc(t('print_vice'))}: ${viceName}`;
      }
      info += ` \u2014 ${esc(t('print_chief_trump'))}: ${esc(formatTrump(round.chiefTrump))}`;
      if (!is3Player) {
        info += ` \u2014 ${esc(t('print_vice_trump'))}: ${esc(formatTrump(round.viceTrump))}`;
      }
      const bid = round.chiefBid !== '' ? round.chiefBid : '\u2014';
      info += ` \u2014 ${esc(t('print_bid'))}: ${bid}`;
      rows += `<tr class="round-info"><td colspan="${cols}">${info}</td></tr>`;

      // Points row
      rows += `<tr><td class="label">${esc(t('points'))}</td>`;
      for (let p = 0; p < n; p++) {
        const val = round.pips[p] !== '' && round.pips[p] !== undefined ? round.pips[p] : '\u2014';
        rows += `<td>${val}</td>`;
      }
      rows += `</tr>`;

      // Bonus row
      rows += `<tr><td class="label">${esc(t('bonus_row'))}</td>`;
      for (let p = 0; p < n; p++) {
        const val = hasErrors ? '\u2014' : (result.bonus[p] !== 0 ? result.bonus[p] : '\u2014');
        rows += `<td>${val}</td>`;
      }
      rows += `</tr>`;

      // Sum row
      rows += `<tr class="sum-row"><td class="label">${esc(t('sum'))}</td>`;
      for (let p = 0; p < n; p++) {
        const val = hasErrors ? '\u2014' : result.sum[p];
        rows += `<td>${val}</td>`;
      }
      rows += `</tr>`;

      if (!hasErrors) {
        for (let p = 0; p < n; p++) totals[p] += result.sum[p];
      }
    }
  }

  // Total row
  rows += `<tr class="total-row"><td class="label">${esc(t('total'))}</td>`;
  for (let p = 0; p < n; p++) rows += `<td>${totals[p]}</td>`;
  rows += `</tr>`;

  rows += `</tbody>`;

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${esc(t('print_title'))}</title>
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
<h1>${esc(t('print_title'))}</h1>
<table>${rows}</table>
</body></html>`;
}
