// app.js — App state, initialization, event wiring for Mü Scoring App

import { computeNormalRoundScores, computeStalemateScores } from './scoring.js';
import {
  renderPlayerSetup,
  renderBanner,
  renderRoundCard,
  renderStalemateCard,
  renderSubtotalRow,
  renderButtons,
  renderResetButton,
} from './ui.js';

const state = {
  players: [],
  rounds: [],
};

function getNumPlayers() {
  return state.players.length;
}

/** Compute cumulative subtotals through a given round index. */
function getSubtotals(upToRound) {
  const n = getNumPlayers();
  const totals = new Array(n).fill(0);
  for (let i = 0; i <= upToRound && i < state.rounds.length; i++) {
    const round = state.rounds[i];
    const result = computeRound(round);
    if (result.errors.length === 0) {
      for (let p = 0; p < n; p++) {
        totals[p] += result.sum[p];
      }
    }
  }
  return totals;
}

/** Compute scores for a single round. */
function computeRound(round) {
  const n = getNumPlayers();
  if (round.type === 'stalemate') {
    const errors = [];
    if (!round.tiedPlayers || round.tiedPlayers.length < 2) {
      errors.push('At least two tied players must be selected.');
    }
    if (round.provocateur === null || round.provocateur === undefined || round.provocateur === '') {
      errors.push('Provocateur must be selected.');
    }
    if (round.tiedPlayers && round.provocateur !== '' && round.provocateur !== null && round.provocateur !== undefined) {
      if (!round.tiedPlayers.includes(Number(round.provocateur))) {
        errors.push('Provocateur must be one of the tied players.');
      }
    }
    if (round.cardsBid === null || round.cardsBid === undefined || round.cardsBid === '' || Number(round.cardsBid) < 0) {
      errors.push('Number of cards bid must be entered.');
    }

    if (errors.length > 0) {
      return { bonus: new Array(n).fill(0), sum: new Array(n).fill(0), errors };
    }

    const bonus = computeStalemateScores(
      n,
      round.tiedPlayers,
      Number(round.provocateur),
      Number(round.cardsBid)
    );
    return { bonus, sum: [...bonus], errors: [] };
  }

  // Normal round
  return computeNormalRoundScores(round, n);
}

function addRound(type) {
  const n = getNumPlayers();
  if (type === 'stalemate') {
    state.rounds.push({
      type: 'stalemate',
      tiedPlayers: [],
      provocateur: '',
      cardsBid: '',
    });
  } else {
    state.rounds.push({
      type: 'normal',
      chief: '',
      vice: '',
      partner: '',
      chiefTrump: '',
      viceTrump: '',
      chiefBid: '',
      pips: new Array(n).fill(''),
    });
  }
  renderGame();
  // Scroll to the new round
  requestAnimationFrame(() => {
    const cards = document.querySelectorAll('.round-card');
    if (cards.length > 0) {
      cards[cards.length - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
}

function updateRound(roundIndex, field, value) {
  const round = state.rounds[roundIndex];
  if (!round) return;

  if (field === 'tiedPlayers') {
    round.tiedPlayers = value;
  } else if (field.startsWith('pips.')) {
    const playerIdx = parseInt(field.split('.')[1], 10);
    round.pips[playerIdx] = value;
  } else {
    round[field] = value;
  }

  // Auto-sync Vice's trump when Vice changes
  if (field === 'vice') {
    if (value === 'none_player') {
      round.viceTrump = 'none';
    } else if (round.viceTrump === 'none') {
      round.viceTrump = '';
    }
  }

  renderGame();
}

function removeRound(roundIndex) {
  if (!confirm(`Delete Round ${roundIndex + 1}? This cannot be undone.`)) return;
  state.rounds.splice(roundIndex, 1);
  renderGame();
}

function resetGame() {
  if (!confirm('Reset the entire game? All scores will be lost.')) return;
  state.players = [];
  state.rounds = [];
  init();
}

function startGame(playerNames) {
  state.players = playerNames;
  state.rounds = [];
  renderGame();
}

function renderGame() {
  const app = document.getElementById('app');

  // Save focus state before re-render
  const activeEl = document.activeElement;
  let focusInfo = null;
  if (activeEl && app.contains(activeEl)) {
    const card = activeEl.closest('.round-card');
    if (card) {
      const cardIndex = Array.from(app.querySelectorAll('.round-card')).indexOf(card);
      const inputs = Array.from(card.querySelectorAll('input, select'));
      const inputIndex = inputs.indexOf(activeEl);
      const selStart = activeEl.selectionStart;
      const selEnd = activeEl.selectionEnd;
      focusInfo = { cardIndex, inputIndex, selStart, selEnd };
    }
  }

  app.innerHTML = '';

  renderResetButton(app, resetGame);

  const n = getNumPlayers();

  for (let i = 0; i < state.rounds.length; i++) {
    const round = state.rounds[i];
    const result = computeRound(round);

    if (round.type === 'stalemate') {
      renderStalemateCard(app, i, round, state.players, result, {
        onUpdate: (field, value) => updateRound(i, field, value),
        onRemove: () => removeRound(i),
      });
    } else {
      renderRoundCard(app, i, round, state.players, result, {
        onUpdate: (field, value) => updateRound(i, field, value),
        onRemove: () => removeRound(i),
      });
    }

  }

  // Total row above buttons
  if (state.rounds.length > 0) {
    const totals = getSubtotals(state.rounds.length - 1);
    renderSubtotalRow(app, state.players, totals);
  }

  renderButtons(app, {
    onNextRound: () => addRound('normal'),
    onNextStalemate: () => addRound('stalemate'),
  });

  // Restore focus after re-render
  if (focusInfo) {
    const cards = app.querySelectorAll('.round-card');
    const card = cards[focusInfo.cardIndex];
    if (card) {
      const inputs = card.querySelectorAll('input, select');
      const target = inputs[focusInfo.inputIndex];
      if (target && target.tagName !== 'SELECT') {
        target.focus();
        if (focusInfo.selStart !== null) {
          try { target.setSelectionRange(focusInfo.selStart, focusInfo.selEnd); } catch(e) {}
        }
      }
    }
  }
}

function init() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  if (state.players.length === 0) {
    renderPlayerSetup(app, startGame);
  } else {
    renderGame();
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  renderBanner();
  init();
});
