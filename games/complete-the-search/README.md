# Complete the Search

Independent search-completion guessing game using the locked JSON data library.

## Run

Because browsers restrict `fetch()` when opening local JSON files directly with `file://`, run the included server:

1. Double-click `start.bat` on Windows.
2. Open `http://localhost:5500`.

VS Code Live Server also works.

## Structure

- `index.html` — screens and UI structure
- `style.css` — visual design
- `app.js` — game logic
- `data/` — the 8 category JSON files; source of truth for prompts, answers and scoring

## Gameplay

- 8 categories
- 15 rounds per category
- 10 completions per round
- Correct answers reveal immediately and add their irregular point value
- Wrong guesses cause a strike; 3 strikes end the round
- Already-found answers do not consume a strike
- Give Up reveals the remaining answers
- Finding all 10 answers completes the round
