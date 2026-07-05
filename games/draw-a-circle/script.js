const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const gridBtn = document.getElementById('gridBtn');
    const instructions = document.getElementById('instructions');
    const tryAgain = document.getElementById('tryAgain');
    const tryAgainBtn = document.getElementById('tryAgainBtn');
    const bestScoreText = document.getElementById('bestScoreText');
    const attemptsText = document.getElementById('attemptsText');

    let isDrawing = false;
    let points = [];
    let result = null;
    let showGrid = true;
    let bestScore = 0;
    let attempts = 0;

    const DRAW_COLORS = [
  "#ff4d4d",
  "#4dabff",
  "#00d084",
  "#ffd43b",
  "#b197fc",
  "#ff922b",
  "#00c2ff",
  "#ff66c4",
  "#7cff6b",
  "#ffffff"
];

let currentColor = "#ffffff";

    // Set canvas size
    function resizeCanvas() {
      const scale = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * scale;
      canvas.height = window.innerHeight * scale;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx.scale(scale, scale);
      drawCanvas();
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    function drawCanvas() {
      const w = canvas.width / (window.devicePixelRatio || 1);
      const h = canvas.height / (window.devicePixelRatio || 1);
      
      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, w, h);
      
      // Draw grid
      if (showGrid) {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 1;
        const gridSize = 40;
        
        for (let x = 0; x < w; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        
        for (let y = 0; y < h; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }
      }
      
      // Draw the circle
      if (points.length > 1) {
        ctx.strokeStyle = currentColor;
        ctx.lineWidth = 3;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length - 1; i++) {
          const mx = (points[i].x + points[i + 1].x) / 2;
          const my = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
        }

        if (points.length > 1) {
          const last = points[points.length - 1];
          ctx.lineTo(last.x, last.y);
        }

        ctx.stroke();
      }
      
      // Draw result overlay
      if (result) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
        ctx.fillRect(0, 0, w, h);
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 72px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const scoreText = `${result.score}/100`;
        ctx.fillText(scoreText, w / 2, h / 2 - 50);
        
        ctx.font = '24px system-ui, -apple-system, sans-serif';
        ctx.fillText(result.message, w / 2, h / 2 + 30);
        
        ctx.font = '18px system-ui, -apple-system, sans-serif';
        ctx.fillText(`Best score: ${bestScore} | Attempts: ${attempts}`, w / 2, h / 2 + 70);
      }
    }

    function evaluateCircle(pts) {
      if (pts.length < 10) {
        return { score: 0, message: "Draw a complete circle!" };
      }

      const center = pts.reduce((acc, p) => ({
        x: acc.x + p.x,
        y: acc.y + p.y
      }), { x: 0, y: 0 });
      
      center.x /= pts.length;
      center.y /= pts.length;

      let avgRadius = 0;
      for (const p of pts) {
        const dist = Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2));
        avgRadius += dist;
      }
      avgRadius /= pts.length;

      let radiusVariance = 0;
      for (const p of pts) {
        const dist = Math.sqrt(Math.pow(p.x - center.x, 2) + Math.pow(p.y - center.y, 2));
        radiusVariance += Math.pow(dist - avgRadius, 2);
      }
      radiusVariance = Math.sqrt(radiusVariance / pts.length);

      const startPoint = pts[0];
      const endPoint = pts[pts.length - 1];
      const closureDist = Math.sqrt(
        Math.pow(endPoint.x - startPoint.x, 2) + 
        Math.pow(endPoint.y - startPoint.y, 2)
      );
      const isClosed = closureDist < avgRadius * 0.2;

      const maxVariance = avgRadius * 0.5;
      const varianceScore = Math.max(0, 1 - (radiusVariance / maxVariance));
      const closureScore = isClosed ? 1 : 0.5;
      
      let totalScore = Math.round((varianceScore * 0.6 + closureScore * 0.4) * 100);
      totalScore = Math.max(0, Math.min(100, totalScore));

      let message;
      if (totalScore >= 95) message = "Perfect circle! You're a true artist! ✨";
      else if (totalScore >= 85) message = "Excellent! Almost perfect! 🎯";
      else if (totalScore >= 75) message = "Great job! Very circular! 👏";
      else if (totalScore >= 60) message = "Good effort! Keep practicing! 💪";
      else if (totalScore >= 40) message = "Not bad! Try drawing slower? 🖊️";
      else if (totalScore >= 20) message = "Give it another shot! Practice makes perfect! 🔄";
      else message = "Hmm, that looks more like abstract art! 🎨";

      return { score: totalScore, message };
    }

 function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches?.[0] || e.changedTouches?.[0];
      const clientX = touch ? touch.clientX : e.clientX;
      const clientY = touch ? touch.clientY : e.clientY;
      return {
        x: (clientX - rect.left),
        y: (clientY - rect.top)
      };
    }

    function startDrawing(e) {
      e.preventDefault();
      if (result) return;
      const pos = getPos(e);
      isDrawing = true;
      points = [pos];
      result = null;
      currentColor = DRAW_COLORS[Math.floor(Math.random() * DRAW_COLORS.length)];
      instructions.classList.add('hidden');
      tryAgain.classList.add('hidden');
      drawCanvas();
    }

   function draw(e) {
      e.preventDefault();
      if (!isDrawing || result) return;
      const rect = canvas.getBoundingClientRect();
      if (e.changedTouches) {
        for (const t of e.changedTouches) {
          points.push({
            x: t.clientX - rect.left,
            y: t.clientY - rect.top
          });
        }
      } else {
        points.push(getPos(e));
      }
      drawCanvas();
    }

    function stopDrawing(e) {
      e.preventDefault();
      if (!isDrawing || result) return;
      isDrawing = false;
      
      result = evaluateCircle(points);
      attempts++;
      attemptsText.textContent = attempts;
      
      if (result.score > bestScore) {
        bestScore = result.score;
        bestScoreText.textContent = bestScore;
      }
      
    tryAgain.classList.remove('hidden');
      drawCanvas();
      }

  function clearCanvas() {
      points = [];
      result = null;
      instructions.classList.remove('hidden');
      tryAgain.classList.add('hidden');
      document.querySelector('.vatsal-related')?.setAttribute('hidden', '');
      drawCanvas();
    }

    function toggleGrid() {
      showGrid = !showGrid;
      gridBtn.textContent = showGrid ? 'Hide grid' : 'Show grid';
      drawCanvas();
    }

    canvas.addEventListener('mousedown', (e) => {
      if (result) {
        clearCanvas();
        return;
      }
      startDrawing(e);
    });
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

   canvas.addEventListener('touchstart', (e) => {
      if (result) {
        clearCanvas();
        return;
      }
      startDrawing(e);
    });
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);

   
    gridBtn.addEventListener('click', toggleGrid);
    tryAgainBtn.addEventListener('click', clearCanvas);
