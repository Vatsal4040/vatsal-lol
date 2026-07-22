# V4 SDK Architecture (`vatsal-sdk.js`)

## Overview
`assets/vatsal-sdk.js` is a lightweight (<10KB), framework-free JavaScript file included by every game on VATSAL.LOL.

## Responsibilities
- Dynamically injects top-left `vatsal.lol` branding link anchored to `/`.
- Dynamically loads `assets/suggest-footer-v4.css` and `assets/suggest-footer-v4.js`.
- Exposes `window.VatsalLolGameComplete()` callback.

## Public API Specification
```javascript
window.VatsalLolGameComplete()
```
Calling this method notifies the platform that the current gameplay session has ended. The platform then presents the recommendation footer.

## Isolation Policy
The SDK does **not** inspect game DOM elements, variables, state, score, or event loops. Games remain 100% decoupled from the SDK.
