(function(){

    "use strict";

    const GAMES = [
    "2048",
    "adjustme",
    "bubbles",
    "bugsmash",
    "can-you-guess-indian-mom",
    "chaotic-fortune-teller",
    "checklist",
    "draw-a-circle",
    "emojis-2-movies",
    "everything-is-progressing",
    "flash-memory",
    "focus",
    "guess-the-lie",
    "hardword",
    "jokes-if-you-handle",
    "lets-settle",
    "mastermind",
    "memory-tiles",
    "onelightday",
    "paddleclub",
    "snake",
    "spend-bill-gates-money",
    "spot",
    "stacking",
    "sudoko",
    "tetris",
    "tower-of-hanoi",
    "under-limit",
    "which-number",
    "wordle",
    "would-you-press-the-button",
    "xo",
    "your-life-in-numbers"
];

    function currentSlug(){

        const parts=
            window.location.pathname
            .split("/")
            .filter(Boolean);

        const i=
            parts.lastIndexOf("games");

        return i>=0
            ? parts[i+1]
            : "";
    }

    function shuffle(a){

        return [...a]
        .sort(()=>Math.random()-0.5);
    }

    function createFooter(){

        if(
            document.querySelector(
                ".vatsal-related"
            )
        ){
            return;
        }

        const slug=currentSlug();

        const picks=
            shuffle(
                GAMES.filter(
                    g=>g!==slug
                )
            ).slice(0,2);

        const section=
            document.createElement(
                "section"
            );

        section.className=
            "vatsal-related";

        section.hidden=true;

        section.innerHTML=`

            <h2
            class="vatsal-related-title">

                You May Like

            </h2>

            <div
            class="vatsal-related-grid">

                ${picks.map(game=>`

                    <a
                    href="../${game}/"
                    class="related-card">

                        <img
                        src="../../assets/thumbnails/${game}.webp"
                        alt="${game}"
                        width="320"
                        height="180"
                        loading="lazy"
                        decoding="async">

                    </a>

                `).join("")}

            </div>

            <footer
            class="vatsal-footer">

                <a href="/">

                    by vatsal.lol

                </a>

            </footer>

        `;

        document.body.appendChild(
            section
        );
    }

    function reveal(){

        document
        .querySelector(
            ".vatsal-related"
        )
        ?.removeAttribute(
            "hidden"
        );
    }

    createFooter();

    window
    .VatsalLolGameComplete=
    reveal;

})();