# V4 Branding & Styling (`vatsal-v4.css`)

## Overview
`assets/vatsal-v4.css` manages platform branding typography, fixed top-left logo positioning, and shared CSS resets.

## Top-Left Branding Link
- Element: `<a id="vatsal-v4-logo" class="vatsal-v4-branding" href="/">vatsal.lol</a>`
- Style: `position: fixed; top: 16px; left: 16px; z-index: 99999;`
- Font: `vatsal-logo-font.woff2`

## Visibility Control
Games display `vatsal.lol` on the start screen. Games can toggle `.vatsal-v4-hidden` on `#vatsal-v4-logo` during gameplay if desired.
