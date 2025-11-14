// js/renderer.js
// Etap 3: renderer rysuje siatkę, obiekty środowiskowe i populację.
import { CELL_OBJECT } from './world.js';

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

  drawEnvironment(world) {
    const ctx = this.ctx;
    const size = this.cellSize;
    const margin = size * 0.2;
    const cells = typeof world.getCellObjects === 'function' ? world.getCellObjects() : world.cellsObjects;

    for (let y = 0; y < world.height; y++) {
      for (let x = 0; x < world.width; x++) {
        const cellObject = cells[y][x];
        if (!cellObject) continue;

        const px = x * size + margin;
        const py = y * size + margin;
        const rectSize = size - margin * 2;

        if (cellObject === CELL_OBJECT.FOOD) {
          ctx.fillStyle = '#6dd16b';
          ctx.strokeStyle = '#0f380f';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.rect(px, py, rectSize, rectSize);
          ctx.fill();
          ctx.stroke();
        } else if (cellObject === CELL_OBJECT.POISON) {
          ctx.fillStyle = '#ff5252';
          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.rect(px, py, rectSize, rectSize);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#7f1d1d';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + rectSize, py + rectSize);
          ctx.moveTo(px + rectSize, py);
          ctx.lineTo(px, py + rectSize);
          ctx.stroke();
        }
      }
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
    this.drawEnvironment(world);
    this.drawCreatures(world);
  }
}
