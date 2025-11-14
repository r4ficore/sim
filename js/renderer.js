// js/renderer.js

export class WorldRenderer {
  constructor(canvas, cellSize = 15) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.cellSize = cellSize;
    this.worldWidth = 0;
    this.worldHeight = 0;
  }

  renderEmptyGrid(width, height) {
    this.worldWidth = width;
    this.worldHeight = height;

    this.canvas.width = width * this.cellSize;
    this.canvas.height = height * this.cellSize;

    const ctx = this.ctx;
    const cs = this.cellSize;

    // tło
    ctx.fillStyle = '#111';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // siatka
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;

    // pionowe
    for (let x = 0; x <= width; x++) {
      const px = x * cs + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, this.canvas.height);
      ctx.stroke();
    }

    // poziome
    for (let y = 0; y <= height; y++) {
      const py = y * cs + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(this.canvas.width, py);
      ctx.stroke();
    }
  }

  renderWorld(world) {
    if (!world) return;

    // najpierw tło + siatka
    this.renderEmptyGrid(world.width, world.height);

    const ctx = this.ctx;
    const cs = this.cellSize;

    // ludziki
    for (const creature of world.creatures) {
      if (!creature.alive) continue;

      const cx = creature.x * cs + cs / 2;
      const cy = creature.y * cs + cs / 2;

      ctx.beginPath();
      ctx.arc(cx, cy, cs * 0.35, 0, Math.PI * 2);

      ctx.fillStyle = creature.sex === 'M' ? '#4da6ff' : '#ff79c6';
      ctx.fill();
    }
  }
}
