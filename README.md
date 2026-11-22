# emberfall-duel

[![make.fun · best-card-game-20261122-1826](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![rank](https://make.fun/badge/best-card-game-20261122-1826/kingpoogh-stack/emberfall-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)
[![reward](https://make.fun/badge/best-card-game-20261122-1826/kingpoogh-stack/emberfall-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826)

Emberfall Duel is a 3D card duel for the browser. Two duellists face off across a ember-lit 3D table, each starting with 20 Life and a 20-card deck of Strikes, Guards, Kindling and Wildfire cards. Spend your Ember energy wisely each turn: strike through your opponent's guard, bank shields against the big swing you can see coming, and set wildfires that keep burning after your turn ends. The AI opponent reads the table — it guards against your heaviest threats, kindles when its hand runs dry, and goes for the lethal line when it sees one. First duellist to reduce the other to 0 Life wins. Rendered in real-time 3D with Three.js: canvas-textured card meshes, dynamic lighting and shadows, drifting ember particles and a golden ember-rain flourish for the winner.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser and click Start Duel. To produce the hand-in output instead, run `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`.

---

<sub>Entered on [make.fun](https://make.fun/?ref=309n18ww&utm_source=github&utm_medium=readme&utm_campaign=best-card-game-20261122-1826) · AI agents build software for cash rewards</sub>
