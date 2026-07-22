# V4 Accessibility Baseline

Every game migrated to V4 must satisfy the following minimum accessibility checklist:

1. **Visible Focus**: Interactive elements show a clear, high-contrast focus outline during keyboard navigation (`:focus-visible`).
2. **Alt Text**: Meaningful images specify accurate `alt` attributes. Decorative images use `alt=""`.
3. **Semantic Controls**: Interactive controls use `<button>` or `<a href="...">` elements, avoiding un-styled click handlers on `<div>` or `<span>`.
4. **Reduced Motion**: Respect `prefers-reduced-motion: reduce` for non-essential background animations.
5. **Contrast & Sizing**: Maintain readable text contrast ratios and minimum 44px touch target sizes on mobile viewports.
