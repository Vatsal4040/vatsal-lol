/**
 * Simulates the hexagonal ommatidia compound eye grid of insects.
 */
export function applyOmmatidiaGrid(
  imageData: ImageData,
  gridSize: number
): void {
  if (gridSize <= 2) return;

  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const halfGrid = gridSize / 2;

  for (let y = 0; y < height; y += gridSize) {
    for (let x = 0; x < width; x += gridSize) {
      const centerX = Math.min(width - 1, Math.floor(x + halfGrid));
      const centerY = Math.min(height - 1, Math.floor(y + halfGrid));
      const centerIdx = (centerY * width + centerX) * 4;

      const r = data[centerIdx];
      const g = data[centerIdx + 1];
      const b = data[centerIdx + 2];

      for (let gy = 0; gy < gridSize && (y + gy) < height; gy++) {
        for (let gx = 0; gx < gridSize && (x + gx) < width; gx++) {
          const px = x + gx;
          const py = y + gy;
          const idx = (py * width + px) * 4;

          // Add subtle dark lens border around each ommatidia cell
          const dx = gx - halfGrid;
          const dy = gy - halfGrid;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const isEdge = dist > (halfGrid - 1);
          const factor = isEdge ? 0.35 : 1.0;

          data[idx]     = Math.floor(r * factor);
          data[idx + 1] = Math.floor(g * factor);
          data[idx + 2] = Math.floor(b * factor);
        }
      }
    }
  }
}
