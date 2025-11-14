// js/renderer.js
// Etap 1: renderer rysuje siatkę i statyczną populację.

export class WorldRenderer {
  constructor(canvas, cellSize = 15) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cellSize = cellSize;
  }

  clearCanvas(width, height) {
    this.canvas.width = width * this.cellSize;
    this.canvas.height = height * this.cellSize;

    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  drawGrid(width, height) {
    const ctx = this.ctx;
    const size = this.cellSize;

    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1;

    for (let x = 0; x <= width; x++) {
      const px = x * size + 0.5;
      ctx.beginPath();
      ctx.moveTo(px, 0);
      ctx.lineTo(px, this.canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y <= height; y++) {
      const py = y * size + 0.5;
      ctx.beginPath();
      ctx.moveTo(0, py);
      ctx.lineTo(this.canvas.width, py);
      ctx.stroke();
    }
  }

  drawCreatures(world) {
    const ctx = this.ctx;
    const size = this.cellSize;
    const radius = (size * 0.6) / 2;

    world.creatures.forEach((creature) => {
      if (!creature.alive) return;
      const centerX = creature.x * size + size / 2;
      const centerY = creature.y * size + size / 2;

      let fillColor = '#cccccc';
      if (creature.sex === 'M') {
        fillColor = '#4da3ff';
      } else if (creature.sex === 'F') {
        fillColor = '#ff70d1';
      }

      ctx.beginPath();
      ctx.fillStyle = fillColor;
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }

  renderPlaceholder(width, height) {
    this.clearCanvas(width, height);
    this.drawGrid(width, height);
  }

  renderWorld(world) {
    if (!world) {
      console.warn('[renderer] renderWorld() – brak świata do narysowania.');
      return;
    }

    this.clearCanvas(world.width, world.height);
    this.drawGrid(world.width, world.height);
    this.drawCreatures(world);
  }
}
