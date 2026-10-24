/**
 * Applies unsharp mask / edge sharpening filter for raptors (Eagles, Falcons).
 */
export function applySharpen(imageData: ImageData, amount: number = 0.5): void {
  const width = imageData.width;
  const height = imageData.height;
  const data = imageData.data;
  const copy = new Uint8ClampedArray(data);

  // 3x3 sharpen kernel
  //  0  -1   0
  // -1   5  -1
  //  0  -1   0
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;

      for (let c = 0; c < 3; c++) {
        const center = copy[idx + c];
        const top    = copy[((y - 1) * width + x) * 4 + c];
        const bottom = copy[((y + 1) * width + x) * 4 + c];
        const left   = copy[(y * width + (x - 1)) * 4 + c];
        const right  = copy[(y * width + (x + 1)) * 4 + c];

        const sharp = center * 5 - (top + bottom + left + right);
        const val = center + (sharp - center) * amount;

        data[idx + c] = val < 0 ? 0 : val > 255 ? 255 : val;
      }
    }
  }
}
