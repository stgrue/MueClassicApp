// scoring.js — Pure scoring/bonus logic for Mü

// Chief Team's Target table: targetTable[numPlayers][bidIndex]
// bidIndex 0 = bid 1, bidIndex 1 = bid 2, etc.
const TARGET_TABLE = {
  3: [12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34],
  4: [30, 32, 34, 36, 38, 40, 42, 44, 46, 48, 50, 52, 54, 56, 58],
  5: [24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57],
  6: [20, 24, 28, 32, 36, 40, 44, 48, 52, 56],
};

/**
 * Classify the Chief's trump choice into a category.
 * @param {string} trumpChoice - one of: "red","blue","purple","yellow","green","0"-"9","none"
 * @returns {"color"|"1or7"|"otherNumber"|"none"}
 */
export function classifyTrump(trumpChoice) {
  if (trumpChoice === 'none') return 'none';
  const colors = ['red', 'blue', 'purple', 'yellow', 'green'];
  if (colors.includes(trumpChoice)) return 'color';
  if (trumpChoice === '1' || trumpChoice === '7') return '1or7';
  return 'otherNumber';
}

/**
 * Get the maximum valid bid for a given player count.
 */
export function getMaxBid(numPlayers) {
  return TARGET_TABLE[numPlayers].length;
}

/**
 * Get the Chief Team's target points.
 * @param {number} numPlayers - 3–6
 * @param {number} chiefBid - 1–15 (number of cards bid)
 * @returns {number|null} target points, or null if bid is out of range
 */
export function getTeamTarget(numPlayers, chiefBid) {
  const row = TARGET_TABLE[numPlayers];
  if (!row) return null;
  const idx = chiefBid - 1;
  if (idx < 0 || idx >= row.length) return null;
  return row[idx];
}

/**
 * Determine the "rank achieved" by the Chief's team based on their points.
 * This is the highest bid level whose target the team meets or exceeds.
 * Returns 0 if they don't even meet bid-1 target.
 * @param {number} numPlayers
 * @param {number} teamPoints - combined points of Chief + Partner
 * @returns {number} rank achieved (0 means below bid 1)
 */
export function getRankAchieved(numPlayers, teamPoints) {
  const row = TARGET_TABLE[numPlayers];
  if (!row) return 0;
  let rank = 0;
  for (let i = 0; i < row.length; i++) {
    if (teamPoints >= row[i]) {
      rank = i + 1; // bid level = index + 1
    } else {
      break;
    }
  }
  return rank;
}

/**
 * Starting rank for bonus calculation based on trump type.
 * "Color" → rank starts at 1, "1or7" → 2, "otherNumber" → 3, "none" → 4
 */
function getBonusStartRank(trumpCategory) {
  switch (trumpCategory) {
    case 'color': return 0;
    case '1or7': return 1;
    case 'otherNumber': return 2;
    case 'none': return 3;
    default: return 0;
  }
}

/**
 * Compute the fulfillment bonus for the Chief's team.
 * @param {string} chiefTrumpChoice - the Chief's trump selection
 * @param {number} chiefBid - number of cards bid by Chief
 * @param {number} teamPoints - combined pips of Chief + Partner
 * @param {number} numPlayers
 * @returns {number} bonus points (0 if target not met, 10–100 otherwise)
 */
export function getFulfillmentBonus(chiefTrumpChoice, chiefBid, teamPoints, numPlayers) {
  const target = getTeamTarget(numPlayers, chiefBid);
  if (target === null) return 0;
  if (teamPoints < target) return 0; // target not met — no bonus (penalty handled separately)

  const trumpCat = classifyTrump(chiefTrumpChoice);
  const startRank = getBonusStartRank(trumpCat);

  // Bonus rank = Chief's bid offset by the trump category start
  // For "color": rank achieved directly maps to bonus (rank 1 → 10, rank 2 → 20, ...)
  // For "1or7": rank achieved gets increased by 1
  // For "other Number": rank achieved gets increased by 2
  // For "none": rank achieved gets increased by 3
  const bonusRank = chiefBid + startRank;

  return Math.min(bonusRank * 10, 100);
}

/**
 * Compute lost-game penalty scores.
 * @param {number} chiefBid
 * @param {number} teamPoints - combined pips of Chief + Partner
 * @param {number} numPlayers
 * @returns {{ ranksShort: number, chiefPenalty: number, opponentBonus: number }}
 */
export function computeLostGamePenalty(chiefBid, teamPoints, numPlayers) {
  const target = getTeamTarget(numPlayers, chiefBid);
  if (target === null) return { ranksShort: 0, chiefPenalty: 0, opponentBonus: 0 };

  if (teamPoints >= target) {
    return { ranksShort: 0, chiefPenalty: 0, opponentBonus: 0 };
  }

  // Find which rank they actually achieved
  const rankAchieved = getRankAchieved(numPlayers, teamPoints);
  const ranksShort = chiefBid - rankAchieved;

  return {
    ranksShort,
    chiefPenalty: -10 * ranksShort,
    opponentBonus: 5 * ranksShort,
  };
}

/**
 * Compute stalemate scores for all players.
 * @param {number} numPlayers
 * @param {number[]} tiedPlayerIndices - indices of tied players
 * @param {number} provocateurIndex - index of the provocateur
 * @param {number} cardsBid - number of cards bid by tied players
 * @returns {number[]} per-player bonus/penalty array
 */
export function computeStalemateScores(numPlayers, tiedPlayerIndices, provocateurIndex, cardsBid) {
  const scores = new Array(numPlayers).fill(0);
  for (const idx of tiedPlayerIndices) {
    if (idx === provocateurIndex) {
      scores[idx] = -10 * cardsBid;
    } else {
      scores[idx] = 5 * cardsBid;
    }
  }
  return scores;
}

/**
 * Compute all scores for a normal round.
 * @param {object} round - round data
 * @param {number} numPlayers
 * @returns {{ points: number[], bonus: number[], sum: number[], target: number|null, errors: string[] }}
 */
export function computeNormalRoundScores(round, numPlayers) {
  const errors = [];
  const points = round.pips ? [...round.pips] : new Array(numPlayers).fill(0);
  const bonus = new Array(numPlayers).fill(0);

  const { chief, vice, partner, chiefTrump, chiefBid } = round;

  // Validation
  if (chief === null || chief === undefined || chief === '') {
    errors.push('Chief must be selected.');
  }
  if (numPlayers > 3 && (vice === null || vice === undefined || vice === '')) {
    errors.push('Vice must be selected.');
  }
  if (numPlayers > 3 && (partner === null || partner === undefined || partner === '')) {
    errors.push('Partner must be selected.');
  }

  // Check distinctness
  const roles = [];
  if (chief !== null && chief !== undefined && chief !== '') roles.push({ name: 'Chief', val: Number(chief) });
  if (numPlayers > 3 && vice !== null && vice !== undefined && vice !== '') roles.push({ name: 'Vice', val: Number(vice) });
  if (numPlayers > 3 && partner !== null && partner !== undefined && partner !== '') roles.push({ name: 'Partner', val: Number(partner) });

  const vals = roles.map(r => r.val);
  if (new Set(vals).size !== vals.length && vals.length > 1) {
    errors.push('Chief, Vice, and Partner must be different players.');
  }

  if (!chiefTrump) {
    errors.push('Chief\'s trump must be selected.');
  }
  if (chiefBid === null || chiefBid === undefined || chiefBid === '') {
    errors.push('Chief\'s bid must be selected.');
  }

  const bid = Number(chiefBid);
  const maxBid = getMaxBid(numPlayers);
  if (bid && (bid < 1 || bid > maxBid)) {
    errors.push(`Chief's bid must be between 1 and ${maxBid}.`);
  }

  // Check pips sum
  const expectedSum = numPlayers === 3 ? 36 : 60;
  const pipsSum = points.reduce((a, b) => a + (Number(b) || 0), 0);
  const allPipsFilled = points.every(p => p !== '' && p !== null && p !== undefined);
  if (allPipsFilled && pipsSum !== expectedSum) {
    errors.push(`Card points must sum to ${expectedSum} (currently ${pipsSum}).`);
  }
  if (!allPipsFilled) {
    errors.push('All card points must be filled in.');
  }

  const target = (bid >= 1 && bid <= maxBid) ? getTeamTarget(numPlayers, bid) : null;

  if (errors.length > 0) {
    const sum = points.map((p, i) => (Number(p) || 0) + bonus[i]);
    return { points, bonus, sum, target, errors };
  }

  // Compute team points
  const chiefIdx = Number(chief);
  const partnerIdx = numPlayers > 3 ? Number(partner) : null;
  let teamPoints = Number(points[chiefIdx]) || 0;
  if (partnerIdx !== null) {
    teamPoints += Number(points[partnerIdx]) || 0;
  }

  // Check if target met
  if (teamPoints >= target) {
    // Fulfillment bonus for Chief and Partner
    const bonusVal = getFulfillmentBonus(chiefTrump, bid, teamPoints, numPlayers);
    bonus[chiefIdx] = bonusVal;
    if (partnerIdx !== null) {
      bonus[partnerIdx] = bonusVal;
    }
  } else {
    // Lost game penalty
    const penalty = computeLostGamePenalty(bid, teamPoints, numPlayers);
    bonus[chiefIdx] = penalty.chiefPenalty;
    if (partnerIdx !== null) {
      bonus[partnerIdx] = 0;
    }
    // Opponents get bonus
    for (let i = 0; i < numPlayers; i++) {
      if (i !== chiefIdx && i !== partnerIdx) {
        bonus[i] = penalty.opponentBonus;
      }
    }
  }

  const sum = points.map((p, i) => (Number(p) || 0) + bonus[i]);
  return { points, bonus, sum, target, errors };
}
