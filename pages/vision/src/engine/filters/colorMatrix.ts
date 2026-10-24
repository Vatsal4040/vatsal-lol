/**
 * Applies a 3x3 matrix transformation to an RGBA pixel buffer.
 * matrix = [rR, rG, rB, gR, gG, gB, bR, bG, bB]
 */
export function applyColorMatrix(
  data: Uint8ClampedArray,
  matrix: [number, number, number, number, number, number, number, number, number],
  brightness: number = 1.0,
  contrast: number = 1.0,
  saturation: number = 1.0
): void {
  const m0 = matrix[0], m1 = matrix[1], m2 = matrix[2];
  const m3 = matrix[3], m4 = matrix[4], m5 = matrix[5];
  const m6 = matrix[6], m7 = matrix[7], m8 = matrix[8];

  const len = data.length;
  for (let i = 0; i < len; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // 1. Matrix multiplication
    let nr = (r * m0) + (g * m1) + (b * m2);
    let ng = (r * m3) + (g * m4) + (b * m5);
    let nb = (r * m6) + (g * m7) + (b * m8);

    // 2. Brightness
    nr *= brightness;
    ng *= brightness;
    nb *= brightness;

    // 3. Contrast adjustment: (x - 128) * contrast + 128
    if (contrast !== 1.0) {
      nr = (nr - 128) * contrast + 128;
      ng = (ng - 128) * contrast + 128;
      nb = (nb - 128) * contrast + 128;
    }

    // 4. Saturation adjustment
    if (saturation !== 1.0) {
      const gray = 0.299 * nr + 0.587 * ng + 0.114 * nb;
      nr = gray + (nr - gray) * saturation;
      ng = gray + (ng - gray) * saturation;
      nb = gray + (nb - gray) * saturation;
    }

    // Clamp values [0, 255]
    data[i]     = nr < 0 ? 0 : nr > 255 ? 255 : nr;
    data[i + 1] = ng < 0 ? 0 : ng > 255 ? 255 : ng;
    data[i + 2] = nb < 0 ? 0 : nb > 255 ? 255 : nb;
  }
}
