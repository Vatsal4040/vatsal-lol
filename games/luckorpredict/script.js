/**
 * Luck or Predict | Standalone V2 (3-file standard)
 */

const CONFIG = {
    RANKS: ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'],
    SUITS: ['♠', '♥', '♦', '♣'],
    COLORS: { '♠': 'black', '♣': 'black', '♥': 'red', '♦': 'red' },
    INITIAL_BAL: 1000
};

let game, ui, audio, storage;

class GameEngine {
    constructor() {
        this.deck = [];
        this.balance = CONFIG.INITIAL_BAL;
        this.stats = { played: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0 };
        this.currentBet = 50;
        this.mode = 'classic';
        this.gameState = 'IDLE'; 
        this.middleCard = null;
        this.activeDealTimeout = null;
        this.init();
    }

    init() {
        storage.checkDailyReset();
        this.balance = storage.get('balance');
        this.stats = storage.get('stats');
        ui.updateBalance(this.balance, false);
        ui.populateSelectors();
    }

    initMode(mode) {
        this.mode = mode;
        this.gameState = 'IDLE';
        ui.showScreen('game-board');
        ui.toggleCharmUI(mode === 'charm');
        this.resetRound();
    }

    resetRound() {
        this.cancelActiveDealing();
        this.gameState = 'IDLE';
        this.middleCard = null;
        
        ui.clearTable();
        ui.hideModals();
        
        this.deck = this.createDeck();
        this.shuffleDeck();

        if (this.mode === 'charm') {
            this.gameState = 'BETTING';
            ui.toggleControls(true);
            ui.updateTargetPreview();
        } else {
            this.setupMiddleCard();
        }
    }

    createDeck() {
        let d = [];
        CONFIG.SUITS.forEach(s => {
            CONFIG.RANKS.forEach(r => {
                d.push({ rank: r, suit: s, color: CONFIG.COLORS[s] });
            });
        });
        return d;
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    setupMiddleCard() {
        this.middleCard = this.deck.pop();
        ui.dealMiddleFaceDown();
        this.gameState = 'REVEAL';
    }

    handleMiddleClick() {
        if (this.gameState !== 'REVEAL') return;
        audio.play('flip');
        ui.revealMiddleCard(this.middleCard);
        this.gameState = 'BETTING';
        ui.toggleControls(true);
    }

    setBet(val) {
        if (this.gameState !== 'BETTING') return;
        this.currentBet = val;
        ui.updateActiveBet(val);
    }

    cancelActiveDealing() {
        if (this.activeDealTimeout) {
            clearTimeout(this.activeDealTimeout);
            this.activeDealTimeout = null;
        }
    }

    predict(side) {
        if (this.gameState !== 'BETTING') return;
        if (this.balance < this.currentBet) { 
            alert("Insufficient virtual balance."); 
            return; 
        }

        this.gameState = 'DEALING';
        ui.toggleControls(false);
        this.balance -= this.currentBet;
        ui.updateBalance(this.balance, true);

        let winnerSide = null;
        let sequence = [];
        
        // Use a clean 52-card shuffle for Charm/Jinx to verify exact targeting
        const dealDeck = this.mode === 'charm' ? this.createDeck() : [...this.deck];
        if (this.mode === 'charm') {
            for (let i = dealDeck.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [dealDeck[i], dealDeck[j]] = [dealDeck[j], dealDeck[i]];
            }
        }

        const tRank = document.getElementById('charm-rank').value;
        const tSuit = document.getElementById('charm-suit').value;

        let i = 0;
        while (dealDeck.length > 0) {
            let card = dealDeck.pop();
            let curSide = i % 2 === 0 ? 'andar' : 'bahar';
            sequence.push({ card, side: curSide });
            
            if (this.mode === 'charm') {
                if (card.rank === tRank && card.suit === tSuit) { 
                    winnerSide = curSide; 
                    break; 
                }
            } else {
                if (card.rank === this.middleCard.rank) { 
                    winnerSide = curSide; 
                    break; 
                }
            }
            i++;
        }

        let currentStep = 0;
        const dealLoop = () => {
            if (currentStep >= sequence.length) {
                this.resolveRound(side === winnerSide, winnerSide);
                return;
            }

            const step = sequence[currentStep];
            ui.dealToStack(step.card, step.side, currentStep);
            audio.play('deal');

            currentStep++;
            const delay = sequence.length > 12 ? 750 : 900;
            this.activeDealTimeout = setTimeout(dealLoop, delay);
        };

        dealLoop();
    }

    resolveRound(isWin, winnerSide) {
        let payout = 0;
        if (isWin) {
            payout = this.mode === 'charm' ? this.currentBet * 10 : this.currentBet * 2;
            this.balance += payout;
            this.stats.wins++;
            this.stats.streak++;
            this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.streak);
            audio.play('win');
        } else {
            this.stats.losses++;
            this.stats.streak = 0;
            audio.play('lose');
        }

        this.stats.played++;
        storage.save(this.balance, this.stats);

        setTimeout(() => {
            ui.showResult(isWin, payout);
            ui.updateBalance(this.balance, true);
        }, 600);
    }

    exitToMenu() {
        this.cancelActiveDealing();
        this.gameState = 'IDLE';
        ui.hideModals();
        ui.clearTable();
        ui.showScreen('start-screen');
    }
}

class UIController {
    showScreen(id) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(id).classList.add('active');
    }

    toggleControls(show) { 
        document.getElementById('controls-panel').classList.toggle('hidden', !show); 
    }

    toggleCharmUI(show) {
        document.getElementById('charm-selection').classList.toggle('hidden', !show);
        document.getElementById('charm-target-indicator').classList.toggle('hidden', !show);
        if (show) {
            document.getElementById('charm-rank').onchange = () => this.updateTargetPreview();
            document.getElementById('charm-suit').onchange = () => this.updateTargetPreview();
            this.updateTargetPreview();
        }
    }

    updateTargetPreview() {
        const r = document.getElementById('charm-rank').value;
        const s = document.getElementById('charm-suit').value;
        
        // Update selection prompt helper
        document.getElementById('target-preview').innerText = `Target: ${s} ${r}`;
        
        // Update prominent card indicator above middle card container (Priority 2 / Request)
        const indicatorVal = document.getElementById('charm-target-value');
        indicatorVal.innerText = `${s} ${r}`;
        
        // Apply suit color
        if (CONFIG.COLORS[s] === 'red') {
            indicatorVal.style.color = '#d63031';
        } else {
            indicatorVal.style.color = '#ffffff';
        }
    }

    updateBalance(val, anim) {
        const el = document.getElementById('balance-val');
        if (!anim) { 
            el.innerText = `₹${val}`; 
            return; 
        }
        let start = parseInt(el.innerText.replace('₹', '')) || 0;
        let duration = 500;
        let startTime = null;
        
        const step = (now) => {
            if (!startTime) startTime = now;
            let prog = Math.min((now - startTime) / duration, 1);
            el.innerText = `₹${Math.floor(prog * (val - start) + start)}`;
            if (prog < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }

    updateActiveBet(val) {
        document.querySelectorAll('.chip').forEach(c => {
            c.classList.toggle('active', parseInt(c.innerText) === val);
        });
    }

    clearTable() {
        document.getElementById('andar-stack').innerHTML = '';
        document.getElementById('bahar-stack').innerHTML = '';
        document.getElementById('middle-card-container').innerHTML = '<div id="tap-prompt" class="hidden">Tap to Reveal</div>';
    }

    dealMiddleFaceDown() {
        const container = document.getElementById('middle-card-container');
        const card = document.createElement('div');
        card.className = 'card';
        card.id = 'middle-card-obj';
        card.innerHTML = `<div class="card-face card-back"></div><div class="card-face card-front"></div>`;
        container.appendChild(card);
        document.getElementById('tap-prompt').classList.remove('hidden');
    }

    revealMiddleCard(data) {
        const card = document.getElementById('middle-card-obj');
        card.className = `card ${data.color}`;
        card.querySelector('.card-front').innerHTML = `
            <div class="rank-top">${data.rank}<br>${data.suit}</div>
            <div class="suit-main">${data.suit}</div>
            <div class="rank-top" style="transform:rotate(180deg)">${data.rank}<br>${data.suit}</div>
        `;
        card.classList.add('flipped');
        document.getElementById('tap-prompt').classList.add('hidden');
    }

    dealToStack(data, side, index) {
        const stack = document.getElementById(`${side}-stack`);
        const card = document.createElement('div');
        card.className = `card ${data.color}`;
        
        // Auto stacking & overlapping algorithm (Priority 3)
        // Limits depth and offsets gracefully to prevent cards from escaping the viewport
        const stepY = index > 15 ? Math.max(3, 140 / index) : 8;
        const topOffset = index * stepY;
        const leftOffset = (index % 2 === 0 ? 1 : -1) * Math.min(index * 0.4, 3);
        
        card.style.top = `${topOffset}px`;
        card.style.left = `calc(50% + ${leftOffset}px)`;
        card.style.zIndex = 10 + index;
        
        card.innerHTML = `
            <div class="card-face card-back"></div>
            <div class="card-face card-front">
                <div class="rank-top">${data.rank}<br>${data.suit}</div>
                <div class="suit-main">${data.suit}</div>
                <div class="rank-top" style="transform:rotate(180deg)">${data.rank}<br>${data.suit}</div>
            </div>
        `;
        stack.appendChild(card);
        setTimeout(() => card.classList.add('flipped'), 30);
    }

    showResult(isWin, payout) {
        const modal = document.getElementById('result-modal');
        modal.classList.remove('hidden');
        document.getElementById('result-status').innerText = isWin ? "YOU WON!" : "TRY AGAIN";
        document.getElementById('result-status').style.color = isWin ? "var(--gold)" : "#ff4757";
        document.getElementById('result-payout').innerText = isWin ? `+₹${payout}` : `-₹${game.currentBet}`;
        document.getElementById('result-payout').style.color = isWin ? "var(--gold-bright)" : "#ff4757";
        document.getElementById('result-icon').innerText = isWin ? "🎉" : "🃏";
        document.getElementById('result-balance').innerText = `₹${game.balance}`;
    }

    hideModals() { 
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden')); 
    }

    toggleModal(id) {
        const m = document.getElementById(id);
        m.classList.toggle('hidden');
        if (id === 'stats-modal') this.renderStats();
    }

    populateSelectors() {
        const r = document.getElementById('charm-rank'), s = document.getElementById('charm-suit');
        r.innerHTML = '';
        s.innerHTML = '';
        CONFIG.RANKS.forEach(x => r.innerHTML += `<option value="${x}">${x}</option>`);
        CONFIG.SUITS.forEach(x => s.innerHTML += `<option value="${x}">${x}</option>`);
    }

    renderStats() {
        const s = storage.get('stats');
        document.getElementById('stats-grid').innerHTML = `
            <p><span>Games Played</span> <strong>${s.played}</strong></p>
            <p><span>Wins</span> <strong>${s.wins}</strong></p>
            <p><span>Losses</span> <strong>${s.losses}</strong></p>
            <p><span>Best Streak</span> <strong>${s.bestStreak}</strong></p>
        `;
    }
}

class AudioController {
    constructor() { 
        this.ctx = null; 
        this.enabled = true; 
    }

    initContext() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) {
                this.ctx = new AudioCtx();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggle() { 
        this.enabled = !this.enabled; 
        document.getElementById('sound-btn').innerText = this.enabled ? '🔊' : '🔇'; 
    }

    play(type) {
        if (!this.enabled) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.connect(gain); 
            gain.connect(this.ctx.destination);
            
            const now = this.ctx.currentTime;
            
            if (type === 'deal') { 
                osc.frequency.setValueAtTime(400, now); 
                osc.frequency.exponentialRampToValueAtTime(100, now + 0.1); 
                gain.gain.setValueAtTime(0.1, now); 
            }
            else if (type === 'win') { 
                osc.frequency.setValueAtTime(500, now); 
                osc.frequency.exponentialRampToValueAtTime(1000, now + 0.2); 
                gain.gain.setValueAtTime(0.1, now); 
            }
            else if (type === 'lose') { 
                osc.type = 'sawtooth'; 
                osc.frequency.setValueAtTime(200, now); 
                osc.frequency.exponentialRampToValueAtTime(50, now + 0.3); 
                gain.gain.setValueAtTime(0.05, now); 
            }
            else if (type === 'flip') { 
                osc.frequency.setValueAtTime(600, now); 
                gain.gain.setValueAtTime(0.05, now); 
            }
            
            osc.start(); 
            osc.stop(now + 0.4); 
            gain.gain.linearRampToValueAtTime(0, now + 0.3);
        } catch (e) {
            console.warn("Audio Context blocked or failed to initialize", e);
        }
    }
}

class StorageController {
    checkDailyReset() {
        const last = localStorage.getItem('lp_reset');
        const today = new Date().toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' });
        if (last !== today) {
            localStorage.setItem('lp_bal', CONFIG.INITIAL_BAL);
            localStorage.setItem('lp_reset', today);
        }
    }

    get(k) {
        if (k === 'balance') {
            return parseInt(localStorage.getItem('lp_bal')) || CONFIG.INITIAL_BAL;
        }
        try {
            return JSON.parse(localStorage.getItem('lp_stats')) || { played: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0 };
        } catch (e) {
            return { played: 0, wins: 0, losses: 0, streak: 0, bestStreak: 0 };
        }
    }

    save(b, s) { 
        localStorage.setItem('lp_bal', b); 
        localStorage.setItem('lp_stats', JSON.stringify(s)); 
    }
}

window.addEventListener('DOMContentLoaded', () => {
    storage = new StorageController();
    ui = new UIController();
    audio = new AudioController();
    game = new GameEngine();
});
