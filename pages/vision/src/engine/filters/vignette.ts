/**
 * Applies radial vignette and field-of-view edge falloff.
 */
export function applyVignette(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  strength: number
): void {
  if (strength <= 0) return;

  const centerX = width / 2;
  const centerY = height / 2;
  const outerRadius = Math.hypot(centerX, centerY);

  const gradient = ctx.createRadialGradient(
    centerX, centerY, outerRadius * (1 - strength * 0.7),
    centerX, centerY, outerRadius
  );

  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.7, `rgba(0, 0, 0, ${strength * 0.5})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, ${Math.min(1.0, strength * 1.3)})`);

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}
