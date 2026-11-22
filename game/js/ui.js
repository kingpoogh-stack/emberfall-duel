// EMBERFALL DUEL - page wiring: HUD, screens, input, turn flow.

import { Duel } from "./duel.js";
import { planEnemyTurn } from "./ai.js";
import { Table3D } from "./table3d.js";
import { makeSeededRandom, cardById } from "./cards.js";

const params = new URLSearchParams(location.search);
const seed = Number(params.get("seed") || "7") || 7;
const shotMode = params.get("shot") || "";

const canvas = document.getElementById("gl");
const table = new Table3D(canvas);
const duel = new Duel(makeSeededRandom(seed));
let phase = "title"; // title | duel | over
let busy = false;

const el = (id) => document.getElementById(id);
const titleScreen = el("title-screen");
const endScreen = el("end-screen");

function pips() {
  let s = "";
  for (let i = 0; i < duel.maxEnergy; i++) s += i < duel.energy ? "●" : "○";
  return s;
}

function refreshHud() {
  el("enemy-life").innerHTML = duel.enemy.life + ' <small>/ 20 LIFE</small>';
  el("enemy-sub").textContent = "Shield " + duel.enemy.shield + " · Hand " + duel.enemy.hand.length + " · Deck " + duel.enemy.deck.length + (duel.enemy.burnTurns ? " · BURNING " + duel.enemy.burn : "");
  el("player-life").innerHTML = duel.player.life + ' <small>/ 20 LIFE</small>';
  el("player-sub").textContent = "Shield " + duel.player.shield + " · Deck " + duel.player.deck.length + (duel.player.burnTurns ? " · BURNING " + duel.player.burn : "");
  el("energy-pips").textContent = pips();
  el("energy-label").textContent = "ENERGY " + duel.energy + " / " + duel.maxEnergy;
  el("turn-big").textContent = phase === "over" ? "Duel Over" : (duel.turn === "player" ? "Your Turn" : "Rival's Turn");
  el("turn-small").textContent = "Round " + duel.round + " · Your hand: " + duel.player.hand.length + " cards";
  el("log-lines").innerHTML = duel.log.map((l) => "<div>• " + l + "</div>").join("");
  el("end-turn").disabled = phase !== "duel" || duel.turn !== "player" || busy;
}

function syncAll() { table.syncHands(duel, null); refreshHud(); }

function finishIfEnded() {
  if (!duel.winner) return false;
  if (phase === "over") return true; // end screen already shown; never re-fire the flourish
  phase = "over";
  const won = duel.winner === "player";
  el("end-title").textContent = won ? "VICTORY!" : "DEFEAT";
  el("end-text").textContent = won
    ? "The Ash Sorcerer falls. Golden embers rain over the Emberfall table — the duel is yours, " + duel.player.life + " Life to spare."
    : "Your flame gutters out. The Ash Sorcerer keeps the table — gather fresh kindling and try again.";
  endScreen.classList.remove("hidden");
  if (won) table.burst(true);
  refreshHud();
  return true;
}

function playPlayerCard(uid) {
  if (phase !== "duel" || duel.turn !== "player" || busy) return;
  const card = duel.player.hand.find((c) => c.uid === uid);
  if (!card) return;
  if (card.cost > duel.energy) { duel.note("Not enough Energy for " + card.name + " (needs " + card.cost + ")."); refreshHud(); return; }
  duel.playCard("player", uid);
  syncAll();
  if (!finishIfEnded() && card.kind === "strike") table.burst(false);
}

function runEnemyTurn() {
  if (phase !== "duel" || duel.winner) return;
  busy = true; refreshHud();
  duel.startEnemyTurn(); syncAll();
  if (finishIfEnded()) { busy = false; return; }
  const plan = planEnemyTurn(duel);
  let i = 0;
  const step = () => {
    if (phase !== "duel") { busy = false; return; }
    if (i < plan.length && !duel.winner) {
      duel.playCard("enemy", plan[i]); i++; syncAll();
      setTimeout(step, 420);
    } else {
      if (!finishIfEnded()) {
        duel.startPlayerTurn(); busy = false; syncAll(); finishIfEnded();
      } else busy = false;
      refreshHud();
    }
  };
  setTimeout(step, 450);
}

function startDuel() {
  duel.reset(); phase = "duel"; busy = false;
  titleScreen.classList.add("hidden"); endScreen.classList.add("hidden");
  syncAll();
}

el("start-btn").addEventListener("click", startDuel);
el("again-btn").addEventListener("click", startDuel);
el("end-turn").addEventListener("click", () => { if (phase === "duel" && duel.turn === "player" && !busy) runEnemyTurn(); });
window.addEventListener("keydown", (ev) => {
  if (ev.code === "Space" && phase === "duel" && duel.turn === "player" && !busy) { ev.preventDefault(); runEnemyTurn(); }
});
canvas.addEventListener("click", (ev) => {
  const uid = table.pickAt(ev.clientX, ev.clientY, canvas);
  if (uid) playPlayerCard(uid);
});

// Deterministic screenshot states.
function setupShot() {
  if (!shotMode) return;
  if (shotMode === "title") { phase = "title"; syncAll(); return; }
  phase = "duel"; titleScreen.classList.add("hidden");
  // A believable mid-duel: a few cards leave each hand, Life is uneven.
  duel.player.hand = [cardById("flame-lance"), cardById("obsidian-wall"), cardById("stoke-flames"), cardById("wildfire-hex"), cardById("ember-slash")];
  duel.enemy.hand = [cardById("cinder-jab"), cardById("ashen-shield"), cardById("pyre-cleaver")];
  duel.player.life = 14; duel.player.shield = 4; duel.enemy.life = 11; duel.enemy.shield = 0;
  duel.round = 3; duel.maxEnergy = 5; duel.energy = 4; duel.turn = "player";
  duel.player.deck.splice(0, 9); duel.enemy.deck.splice(0, 11);
  duel.lastPlayed = { card: cardById("inferno-hammer"), side: "player" };
  duel.log = ["You played Inferno Hammer: 8 damage.", "Rival raised Ashen Shield: +4 Shield.", "You used Stoke Flames and stoked the fire.", "Round 3 — your move, Ember Knight."];
  if (shotMode === "win") {
    duel.enemy.life = 0; duel.winner = "player"; finishIfEnded();
  } else if (shotMode === "lose") {
    duel.player.life = 0; duel.winner = "enemy"; finishIfEnded();
  }
  syncAll(); refreshHud();
}

function resize() {
  const w = window.innerWidth, h = window.innerHeight;
  table.resize(w, h);
}
window.addEventListener("resize", resize);
resize();
setupShot();
syncAll();

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  table.frame(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// Hooks for automated play-testing.
window.__emberfall = { duel, startDuel, playPlayerCard, runEnemyTurn, getPhase: () => phase };
