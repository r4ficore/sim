// js/renderer.js
// Etap 0: renderer potrafi narysować pustą siatkę.

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

  renderPlaceholder(width, height) {
    this.clearCanvas(width, height);
    this.drawGrid(width, height);
  }

  renderWorld(world) {
    console.warn('[renderer] renderWorld() zostanie uzupełnione w Etapie 1.');
    if (!world) return;
    this.renderPlaceholder(world.width, world.height);
  }
}
