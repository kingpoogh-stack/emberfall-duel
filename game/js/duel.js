// EMBERFALL DUEL - duel state and rules. Pure logic, no rendering.

import { buildDeck } from "./cards.js";

function freshDuelist(name) {
  return { name, life: 20, shield: 0, deck: [], hand: [], burn: 0, burnTurns: 0 };
}

export class Duel {
  constructor(random) {
    this.random = random;
    this.reset();
  }

  reset() {
    this.player = freshDuelist("You — Ember Knight");
    this.enemy = freshDuelist("Rival — Ash Sorcerer");
    this.player.deck = buildDeck(this.random);
    this.enemy.deck = buildDeck(this.random);
    this.round = 1;
    this.maxEnergy = 3;
    this.energy = 3;
    this.enemyEnergy = 3;
    this.turn = "player";
    this.winner = null;
    this.log = ["The duel begins. Draw your opening hand."];
    this.lastPlayed = null;
    for (let i = 0; i < 4; i++) { this.drawCard(this.player); this.drawCard(this.enemy); }
  }

  note(message) {
    this.log.unshift(message);
    if (this.log.length > 5) this.log.length = 5;
  }

  drawCard(who) {
    if (who.deck.length === 0) return null;
    const card = who.deck.pop();
    who.hand.push(card);
    return card;
  }

  energyCapForRound() { return Math.min(6, 2 + this.round); }

  applyDamage(target, amount) {
    const blocked = Math.min(target.shield, amount);
    target.shield -= blocked;
    const through = amount - blocked;
    target.life -= through;
    return { blocked, through };
  }

  tickBurn(who, label) {
    if (who.burnTurns > 0 && who.burn > 0) {
      who.life -= who.burn;
      who.burnTurns -= 1;
      this.note(label + " burns for " + who.burn + ".");
      if (who.burnTurns === 0) who.burn = 0;
    }
  }

  checkEnd() {
    if (this.enemy.life <= 0 && this.player.life > 0) this.winner = "player";
    else if (this.player.life <= 0) this.winner = "enemy";
    if (this.winner) {
      this.enemy.life = Math.max(0, this.enemy.life);
      this.player.life = Math.max(0, this.player.life);
    }
    return this.winner;
  }

  // Play a card for `side` ("player" | "enemy"). Returns true when legal.
  playCard(side, uid) {
    if (this.winner) return false;
    const me = side === "player" ? this.player : this.enemy;
    const foe = side === "player" ? this.enemy : this.player;
    const energy = side === "player" ? this.energy : this.enemyEnergy;
    const idx = me.hand.findIndex((c) => c.uid === uid);
    if (idx < 0) return false;
    const card = me.hand[idx];
    if (card.cost > energy) return false;
    me.hand.splice(idx, 1);
    if (side === "player") this.energy -= card.cost; else this.enemyEnergy -= card.cost;
    this.lastPlayed = { card, side };
    if (card.kind === "strike") {
      const r = this.applyDamage(foe, card.value);
      this.note(me.name.split(" ")[0] + " played " + card.name + ": " + r.through + " damage" + (r.blocked ? " (" + r.blocked + " blocked)" : "") + ".");
    } else if (card.kind === "guard") {
      me.shield += card.value;
      this.note(me.name.split(" ")[0] + " raised " + card.name + ": +" + card.value + " Shield.");
    } else if (card.kind === "kindling") {
      if (card.id === "gather-embers") {
        if (side === "player") this.energy += 1; else this.enemyEnergy += 1;
        this.drawCard(me);
      } else {
        for (let i = 0; i < card.value; i++) this.drawCard(me);
      }
      this.note(me.name.split(" ")[0] + " used " + card.name + " and stoked the fire.");
    } else if (card.kind === "wildfire") {
      foe.burn = card.value; foe.burnTurns = 2;
      this.note(me.name.split(" ")[0] + " set a Wildfire: rival burns " + card.value + " for 2 turns.");
    }
    this.checkEnd();
    return true;
  }

  startPlayerTurn() {
    this.round += 1;
    this.turn = "player";
    this.maxEnergy = this.energyCapForRound();
    this.energy = this.maxEnergy;
    this.tickBurn(this.player, "You");
    if (!this.checkEnd()) this.drawCard(this.player);
  }

  startEnemyTurn() {
    this.turn = "enemy";
    this.enemyEnergy = this.energyCapForRound();
    this.tickBurn(this.enemy, "Rival");
    if (!this.checkEnd()) this.drawCard(this.enemy);
  }
}
