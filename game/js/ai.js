// EMBERFALL DUEL - rival AI. Readable priorities a player can counter:
// finish a lethal, shield against a threatening hand, refuel when empty,
// otherwise spend energy on the strongest affordable play.

export function planEnemyTurn(duel) {
  const plan = [];
  const me = duel.enemy;
  const foe = duel.player;
  const hand = [...me.hand];
  let energy = duel.enemyEnergy;

  const affordable = () => hand.filter((c) => c.cost <= energy);
  const take = (card) => {
    if (!card) return;
    plan.push(card.uid);
    energy -= card.cost;
    hand.splice(hand.indexOf(card), 1);
  };

  // 1) Lethal first: total affordable strike damage past the shield.
  const strikes = affordable().filter((c) => c.kind === "strike").sort((a, b) => b.value - a.value);
  let damage = 0;
  for (const s of strikes) damage += s.value;
  if (damage - foe.shield >= foe.life && strikes.length) {
    for (const s of strikes) take(s);
    return plan;
  }

  // 2) Empty or tiny hand: Kindling before anything else.
  if (me.hand.length <= 2) {
    take(affordable().filter((c) => c.kind === "kindling").sort((a, b) => a.cost - b.cost)[0]);
  }

  // 3) Player threatens a big swing: answer with the best Guard.
  const playerThreat = foe.hand.filter((c) => c.kind === "strike").reduce((n, c) => Math.max(n, c.value), 0);
  if (playerThreat >= 5 && me.shield < 4) {
    take(affordable().filter((c) => c.kind === "guard").sort((a, b) => b.value - a.value)[0]);
  }

  // 4) Wildfire while none is burning.
  if (foe.burnTurns === 0) {
    take(affordable().filter((c) => c.kind === "wildfire").sort((a, b) => a.cost - b.cost)[0]);
  }

  // 5) Spend the rest on strikes, biggest first, then a Guard if energy remains.
  let guardDone = false;
  for (;;) {
    const next = affordable().filter((c) => c.kind === "strike").sort((a, b) => b.value - a.value)[0];
    if (next) { take(next); continue; }
    if (!guardDone) {
      const g = affordable().filter((c) => c.kind === "guard").sort((a, b) => b.value - a.value)[0];
      if (g) { take(g); guardDone = true; continue; }
    }
    const k = affordable().filter((c) => c.kind === "kindling").sort((a, b) => a.cost - b.cost)[0];
    if (k) { take(k); continue; }
    break;
  }
  return plan;
}
