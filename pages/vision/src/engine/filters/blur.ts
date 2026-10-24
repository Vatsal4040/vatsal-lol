/**
 * Fast box blur on ImageData pixel buffer.
 */
export function applyFastBlur(
  imageData: ImageData,
  radius: number
): void {
  if (radius <= 0) return;

  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const rad = Math.round(radius);

  // Horizontal pass
  const copy = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0, count = 0;

      for (let dx = -rad; dx <= rad; dx++) {
        const nx = x + dx;
        if (nx >= 0 && nx < width) {
          const idx = (y * width + nx) * 4;
          rSum += copy[idx];
          gSum += copy[idx + 1];
          bSum += copy[idx + 2];
          count++;
        }
      }

      const outIdx = (y * width + x) * 4;
      data[outIdx]     = rSum / count;
      data[outIdx + 1] = gSum / count;
      data[outIdx + 2] = bSum / count;
    }
  }

  // Vertical pass
  const copy2 = new Uint8ClampedArray(data);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let rSum = 0, gSum = 0, bSum = 0, count = 0;

      for (let dy = -rad; dy <= rad; dy++) {
        const ny = y + dy;
        if (ny >= 0 && ny < height) {
          const idx = (ny * width + x) * 4;
          rSum += copy2[idx];
          gSum += copy2[idx + 1];
          bSum += copy2[idx + 2];
          count++;
        }
      }

      const outIdx = (y * width + x) * 4;
      data[outIdx]     = rSum / count;
      data[outIdx + 1] = gSum / count;
      data[outIdx + 2] = bSum / count;
    }
  }
}
