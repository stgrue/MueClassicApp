// printing.js — Print HTML generation for Mü Scoring App

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
