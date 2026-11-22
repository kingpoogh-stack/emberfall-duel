// EMBERFALL DUEL - Three.js table: a real 3D scene with a charcoal
// table, gold trim, lit card meshes with canvas faces, drifting ember
// particles, shadows, and slide / flip / snap card animation.

import { KIND_STYLE } from "./cards.js";

function drawGlyph(ctx, glyph, x, y, size, colour) {
  ctx.save(); ctx.translate(x, y); ctx.fillStyle = colour; ctx.strokeStyle = colour;
  ctx.lineWidth = size * 0.16; ctx.lineCap = "round";
  if (glyph === "sword") {
    ctx.beginPath(); ctx.moveTo(-size * 0.35, size * 0.35); ctx.lineTo(size * 0.35, -size * 0.35); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(size * 0.12, -size * 0.42); ctx.lineTo(size * 0.44, -size * 0.1); ctx.lineTo(size * 0.1, -size * 0.08); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-size * 0.18, size * 0.05); ctx.lineTo(-size * 0.05, size * 0.18); ctx.stroke();
  } else if (glyph === "shield") {
    ctx.beginPath(); ctx.moveTo(0, -size * 0.45); ctx.lineTo(size * 0.38, -size * 0.25);
    ctx.lineTo(size * 0.38, size * 0.12); ctx.quadraticCurveTo(size * 0.38, size * 0.4, 0, size * 0.5);
    ctx.quadraticCurveTo(-size * 0.38, size * 0.4, -size * 0.38, size * 0.12);
    ctx.lineTo(-size * 0.38, -size * 0.25); ctx.closePath(); ctx.fill();
  } else if (glyph === "spark") {
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2; const r = i % 2 ? size * 0.16 : size * 0.44;
      const px = Math.cos(a) * r, py = Math.sin(a) * r;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath(); ctx.fill();
  } else {
    ctx.beginPath(); ctx.moveTo(0, -size * 0.5);
    ctx.quadraticCurveTo(size * 0.4, -size * 0.05, size * 0.26, size * 0.28);
    ctx.quadraticCurveTo(size * 0.16, size * 0.5, 0, size * 0.5);
    ctx.quadraticCurveTo(-size * 0.16, size * 0.5, -size * 0.26, size * 0.28);
    ctx.quadraticCurveTo(-size * 0.4, -size * 0.05, 0, -size * 0.5); ctx.fill();
  }
  ctx.restore();
}

export function makeCardTexture(card, faceDown) {
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 384;
  const ctx = cv.getContext("2d");
  if (faceDown) {
    const backGrad = ctx.createLinearGradient(0, 0, 0, 384);
    backGrad.addColorStop(0, "#ffc44d"); backGrad.addColorStop(1, "#e05a08");
    ctx.fillStyle = backGrad; ctx.fillRect(0, 0, 256, 384);
    ctx.strokeStyle = "#3d1204"; ctx.lineWidth = 12; ctx.strokeRect(12, 12, 232, 360);
    ctx.strokeStyle = "#fff3d6"; ctx.lineWidth = 4; ctx.strokeRect(30, 30, 196, 324);
    drawGlyph(ctx, "flame", 128, 175, 130, "#7a2703");
    ctx.fillStyle = "#3d1204"; ctx.font = "bold 27px Georgia, serif"; ctx.textAlign = "center";
    ctx.fillText("EMBERFALL", 128, 302);
    const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; return tex;
  }
  const style = KIND_STYLE[card.kind];
  const grad = ctx.createLinearGradient(0, 0, 0, 384);
  grad.addColorStop(0, "#fff6e3"); grad.addColorStop(1, "#f3dfba");
  ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 384);
  ctx.strokeStyle = style.colour; ctx.lineWidth = 12; ctx.strokeRect(6, 6, 244, 372);
  ctx.fillStyle = style.dark; ctx.fillRect(18, 18, 220, 62);
  ctx.fillStyle = "#ffffff"; ctx.font = "bold 25px Georgia, serif"; ctx.textAlign = "center";
  const name = card.name.length > 15 ? card.name.slice(0, 15) : card.name;
  ctx.fillText(name, 128, 58);
  // Cost orb, top-left.
  ctx.beginPath(); ctx.arc(42, 108, 27, 0, Math.PI * 2); ctx.fillStyle = "#ff5a1f"; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = "#7a2703"; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "bold 34px Arial"; ctx.fillText(String(card.cost), 42, 120);
  ctx.fillStyle = style.colour; ctx.font = "bold 20px Arial"; ctx.textAlign = "right";
  ctx.fillText(style.label, 232, 118);
  drawGlyph(ctx, style.glyph, 128, 205, 105, style.colour);
  // Big value badge.
  ctx.beginPath(); ctx.arc(128, 302, 40, 0, Math.PI * 2); ctx.fillStyle = style.colour; ctx.fill();
  ctx.lineWidth = 5; ctx.strokeStyle = style.dark; ctx.stroke();
  ctx.fillStyle = "#fff"; ctx.font = "bold 52px Arial"; ctx.textAlign = "center";
  ctx.fillText(String(card.value), 128, 320);
  ctx.fillStyle = "#4a2c12"; ctx.font = "16px Georgia, serif";
  ctx.fillText(card.text, 128, 362);
  const tex = new THREE.CanvasTexture(cv); tex.anisotropy = 4; return tex;
}

export class Table3D {
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
    this.renderer.setPixelRatio(1);
    this.renderer.shadowMap.enabled = true;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x120b08);
    this.scene.fog = new THREE.Fog(0x120b08, 16, 30);
    this.camera = new THREE.PerspectiveCamera(42, 1280 / 800, 0.1, 100);
    this.camera.position.set(0, 7.4, 8.6);
    this.camera.lookAt(0, 0, 0.4);
    this.cardMeshes = new Map();
    this.anims = [];
    this.bursts = [];
    this.buildRoom();
    this.buildEmbers();
    this.clock = 0;
  }

  buildRoom() {
    const amb = new THREE.AmbientLight(0xffd9a8, 0.55); this.scene.add(amb);
    const key = new THREE.DirectionalLight(0xffe2b0, 1.15);
    key.position.set(4, 9, 5); key.castShadow = true; this.scene.add(key);
    const glow = new THREE.PointLight(0xff5a1f, 1.6, 18); glow.position.set(0, 2.2, 0); this.scene.add(glow);
    this.glow = glow;
    const tableMat = new THREE.MeshStandardMaterial({ color: 0x241611, roughness: 0.85 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(13, 0.5, 8.6), tableMat);
    table.position.y = -0.28; table.receiveShadow = true; this.scene.add(table);
    const felt = new THREE.Mesh(new THREE.PlaneGeometry(11.6, 7.2),
      new THREE.MeshStandardMaterial({ color: 0x332016, roughness: 0.95 }));
    felt.rotation.x = -Math.PI / 2; felt.position.y = 0.01; felt.receiveShadow = true; this.scene.add(felt);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xc9971f, metalness: 0.7, roughness: 0.35 });
    for (const [w, d, x, z] of [[12.2, 0.18, 0, -3.9], [12.2, 0.18, 0, 3.9], [0.18, 7.9, -6.05, 0], [0.18, 7.9, 6.05, 0]]) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.14, d), trimMat);
      bar.position.set(x, 0.03, z); this.scene.add(bar);
    }
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.15, 1.32, 48),
      new THREE.MeshBasicMaterial({ color: 0xff7a2f, side: THREE.DoubleSide, transparent: true, opacity: 0.85 }));
    ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; this.scene.add(ring);
    this.ring = ring;
  }

  buildEmbers() {
    const count = 260; const pos = new Float32Array(count * 3); this.emberSeeds = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 13; pos[i * 3 + 1] = Math.random() * 5; pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
      this.emberSeeds.push(0.2 + Math.random() * 0.7);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    this.embers = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffa63d, size: 0.09, transparent: true, opacity: 0.9 }));
    this.scene.add(this.embers);
  }

  cardMesh(card, faceDown) {
    const front = makeCardTexture(card, faceDown);
    const back = makeCardTexture(card, true);
    const edge = new THREE.MeshStandardMaterial({ color: 0x1c120a, roughness: 0.6 });
    // The card lies in the XZ plane, so its faces are the +Y (front) and
    // -Y (back) sides of the box — putting the art on +Z would show only
    // the thin edge to the camera.
    const mats = [edge, edge,
      new THREE.MeshStandardMaterial({ map: front, roughness: 0.55 }),
      // The rival's backs sit far from the key light; an unlit material
      // keeps the gold-and-flame back design readable across the table.
      new THREE.MeshBasicMaterial({ map: back }),
      edge, edge];
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.18, 0.05, 1.72), mats);
    mesh.castShadow = true;
    return mesh;
  }

  syncHands(duel, onPick) {
    const wanted = new Set();
    const place = (card, x, y, z, rx, rz, faceDown, key) => {
      wanted.add(key);
      let mesh = this.cardMeshes.get(key);
      if (!mesh) {
        mesh = this.cardMesh(card, faceDown);
        mesh.position.set(x, y + 2.4, z); mesh.rotation.set(rx, 0, rz);
        this.scene.add(mesh); this.cardMeshes.set(key, mesh);
        mesh.userData.cardUid = card.uid; mesh.userData.pickable = !faceDown;
      }
      this.animateTo(mesh, { x, y, z, rx, rz }, 0.45);
    };
    duel.player.hand.forEach((card, i) => {
      const spread = (i - (duel.player.hand.length - 1) / 2);
      place(card, spread * 1.32, 0.5, 3.0, -0.62, spread * -0.05, false, "p-" + card.uid);
    });
    duel.enemy.hand.forEach((card, i) => {
      const spread = (i - (duel.enemy.hand.length - 1) / 2);
      // Face-down meshes are built with the back design as their top
      // (+Y) face, so they only need a tilt away from the camera — a
      // full PI flip would bury that face against the table.
      place(card, spread * 1.25, 0.45, -3.0, 0.5, 0, true, "e-" + card.uid);
    });
    if (duel.lastPlayed) {
      const lp = duel.lastPlayed;
      place(lp.card, 0, 0.35, lp.side === "player" ? 0.55 : -0.55, -0.1, 0, false, "played-" + lp.side);
    }
    for (const [key, mesh] of [...this.cardMeshes]) {
      if (!wanted.has(key)) { this.scene.remove(mesh); this.cardMeshes.delete(key); }
    }
    this.onPick = onPick;
  }

  animateTo(mesh, target, seconds) {
    this.anims = this.anims.filter((a) => a.mesh !== mesh);
    this.anims.push({ mesh, from: { x: mesh.position.x, y: mesh.position.y, z: mesh.position.z, rx: mesh.rotation.x, rz: mesh.rotation.z }, to: target, t: 0, seconds });
  }

  burst(golden) {
    for (let i = 0; i < 70; i++) {
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 6),
        new THREE.MeshBasicMaterial({ color: golden ? 0xffd34d : 0xff6a1f }));
      m.position.set(0, 0.6, 0);
      m.userData.v = new THREE.Vector3((Math.random() - 0.5) * 4, 2 + Math.random() * 3.4, (Math.random() - 0.5) * 4);
      this.scene.add(m); this.bursts.push({ mesh: m, life: 1.6 });
    }
  }

  resize(w, h) { this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix(); }

  frame(dt) {
    this.clock += dt;
    this.glow.intensity = 1.45 + Math.sin(this.clock * 2.2) * 0.25;
    this.ring.material.opacity = 0.6 + Math.sin(this.clock * 3) * 0.25;
    const pos = this.embers.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) + dt * this.emberSeeds[i];
      if (y > 5.2) y = 0;
      pos.setY(i, y); pos.setX(i, pos.getX(i) + Math.sin(this.clock + i) * dt * 0.12);
    }
    pos.needsUpdate = true;
    this.anims = this.anims.filter((a) => {
      a.t += dt / a.seconds; const k = a.t >= 1 ? 1 : 1 - Math.pow(1 - a.t, 3);
      a.mesh.position.set(a.from.x + (a.to.x - a.from.x) * k, a.from.y + (a.to.y - a.from.y) * k + Math.sin(k * Math.PI) * 0.35, a.from.z + (a.to.z - a.from.z) * k);
      a.mesh.rotation.x = a.from.rx + (a.to.rx - a.from.rx) * k;
      a.mesh.rotation.z = a.from.rz + (a.to.rz - a.from.rz) * k;
      return a.t < 1;
    });
    this.bursts = this.bursts.filter((b) => {
      b.life -= dt; b.mesh.position.addScaledVector(b.mesh.userData.v, dt);
      b.mesh.userData.v.y -= dt * 2.4; b.mesh.material.opacity = Math.max(0, b.life);
      if (b.life <= 0) this.scene.remove(b.mesh);
      return b.life > 0;
    });
    this.renderer.render(this.scene, this.camera);
  }

  pickAt(clientX, clientY, canvas) {
    const rect = canvas.getBoundingClientRect();
    const mouse = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
    const ray = new THREE.Raycaster(); ray.setFromCamera(mouse, this.camera);
    const hits = ray.intersectObjects([...this.cardMeshes.values()].filter((m) => m.userData.pickable));
    return hits.length ? hits[0].object.userData.cardUid : null;
  }
}
