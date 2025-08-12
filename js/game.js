// js/game.js
(function() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // вставляем оверлей в DOM (с кнопками Restart / Exit)
  let overlay = document.querySelector('.game-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'game-overlay';
    document.body.appendChild(overlay);
  }

  // --- Игровые параметры ---
  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;
  const PLAYER_SIZE = 30;
  const OBSTACLE_WIDTH = 20;
  const GAME_SPEED_START = 5;
  const GAME_SPEED_INCREMENT = 0.005;

  // Состояние
  let gameActive = false;
  let rafId = null;
  let gameSpeed = GAME_SPEED_START;
  let score = 0;
  let frameCount = 0;

  // Игрок
  const player = { x: 80, y: 0, vy: 0, jumping: false, color: '#d10000' };
  let groundY;
  let obstacles = [];

  // --- инициализация размеров ---
  function initGame() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    groundY = canvas.height - 120;
    player.y = groundY - PLAYER_SIZE;
    player.vy = 0;
    player.jumping = false;
    obstacles = [];
    gameSpeed = GAME_SPEED_START;
    score = 0;
    frameCount = 0;
    // показываем canvas
    canvas.style.display = 'block';
    canvas.focus?.();
  }

  // генерация препятствия
  function generateObstacle() {
    const height = 30 + Math.random() * 60;
    obstacles.push({
      x: canvas.width + 10,
      y: groundY - height,
      width: OBSTACLE_WIDTH,
      height: height,
      color: '#8a0303'
    });
  }

  function checkCollision() {
    for (let obstacle of obstacles) {
      if (
        player.x + PLAYER_SIZE > obstacle.x &&
        player.x < obstacle.x + obstacle.width &&
        player.y + PLAYER_SIZE > obstacle.y
      ) return true;
    }
    return false;
  }

  function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // фон земли
    ctx.fillStyle = '#111';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

    // игрок (круг)
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI*2);
    ctx.fill();

    // глаза
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y - 6, 5, 0, Math.PI * 2);
    ctx.arc(player.x - 10, player.y - 6, 5, 0, Math.PI * 2);
    ctx.fill();

    // зрачки
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y - 6, 2, 0, Math.PI * 2);
    ctx.arc(player.x - 10, player.y - 6, 2, 0, Math.PI * 2);
    ctx.fill();

    // препятствия
    obstacles.forEach(obstacle => {
      ctx.fillStyle = obstacle.color;
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // счет
    ctx.fillStyle = 'white';
    ctx.font = '22px Inter, Arial';
    ctx.fillText('Счет: ' + score, 20, 40);
  }

  // основной цикл (рекурсивный)
  function update() {
    if (!gameActive) return; // остановка цикла

    frameCount++;

    // физика
    player.vy += GRAVITY;
    player.y += player.vy;

    // приземление
    if (player.y > groundY - PLAYER_SIZE) {
      player.y = groundY - PLAYER_SIZE;
      player.vy = 0;
      player.jumping = false;
    }

    // генерация препятствий (случайно + по фреймам)
    if (frameCount % Math.max(60, Math.floor(120 - gameSpeed*6)) === 0) {
      generateObstacle();
    }

    // движение препятствий
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= gameSpeed;
      if (obstacles[i].x + obstacles[i].width < 0) {
        obstacles.splice(i, 1);
        score++;
      }
    }

    // столкновения
    if (checkCollision()) {
      endGame();
      return;
    }

    // скорость со временем
    gameSpeed += GAME_SPEED_INCREMENT;

    // рисуем
    draw();

    rafId = requestAnimationFrame(update);
  }

  // старт / стоп
  function startGame() {
    if (gameActive) return;
    initGame();
    gameActive = true;
    overlay.style.display = 'none';
    // включаем pointer-events на canvas (если где-то выключено)
    canvas.style.pointerEvents = 'auto';
    // запускаем цикл
    rafId = requestAnimationFrame(update);
  }

  function endGame() {
    gameActive = false;
    if (rafId) cancelAnimationFrame(rafId);
    overlay.innerHTML = `
      <div style="font-size:1.4rem;font-weight:700">Игра окончена!</div>
      <div style="opacity:0.9">Ваш счет: <strong>${score}</strong></div>
      <div class="controls">
        <button id="restartButton">Играть снова</button>
        <button id="exitButton" class="secondary">Выйти</button>
      </div>
    `;
    overlay.style.display = 'flex';

    // обработчики кнопок
    document.getElementById('restartButton').addEventListener('click', () => {
      startGame();
    });
    document.getElementById('exitButton').addEventListener('click', () => {
      exitGame();
    });
  }

  function exitGame() {
    // скрываем все и возвращаем состояние
    gameActive = false;
    if (rafId) cancelAnimationFrame(rafId);
    overlay.style.display = 'none';
    canvas.style.display = 'none';
    canvas.style.pointerEvents = 'none';
    // чистим obstacles и счет
    obstacles = [];
    score = 0;
  }

  // ввод: пробел и Esc
  function handleKey(e) {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!gameActive) startGame();
      else if (!player.jumping) {
        player.vy = JUMP_FORCE;
        player.jumping = true;
      }
    } else if (e.code === 'Escape') {
      e.preventDefault();
      if (gameActive) {
        // быстро завершить текущую игру
        endGame();
      } else {
        exitGame();
      }
    }
  }
  window.addEventListener('keydown', handleKey);

  // клик по canvas (мобильные)
  canvas.addEventListener('pointerdown', (e) => {
    if (!gameActive) {
      startGame();
    } else if (!player.jumping) {
      player.vy = JUMP_FORCE;
      player.jumping = true;
    }
  });

  // корректная реакция на ресайз
  window.addEventListener('resize', () => {
    if (gameActive) initGame();
  });

  // подсказка: можно начать игру нажатием Space (оставляем hint в footer)
})();
