// js/game.js
(function() {
  const canvas = document.getElementById('gameCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const overlay = document.createElement('div');
  overlay.className = 'game-overlay';
  document.body.appendChild(overlay);

  // Game parameters
  const GRAVITY = 0.5;
  const JUMP_FORCE = -12;
  const PLAYER_SIZE = 30;
  const OBSTACLE_WIDTH = 20;
  const GAME_SPEED_START = 5;
  const GAME_SPEED_INCREMENT = 0.005;
  
  // Game state
  let gameActive = false;
  let rafId = null;
  let gameSpeed = GAME_SPEED_START;
  let score = 0;
  let frameCount = 0;
  
  // Player
  const player = { x: 80, y: 0, vy: 0, jumping: false, color: '#d10000' };
  let groundY;
  let obstacles = [];
  
  // Initialize game
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
    canvas.style.display = 'block';
    canvas.focus?.();
  }
  
  // Generate obstacle
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
      const playerRight = player.x + PLAYER_SIZE;
      const playerBottom = player.y + PLAYER_SIZE;
      const obstacleRight = obstacle.x + obstacle.width;
      const obstacleBottom = obstacle.y + obstacle.height;
      
      if (
        playerRight > obstacle.x &&
        player.x < obstacleRight &&
        playerBottom > obstacle.y &&
        player.y < obstacleBottom
      ) {
        return true;
      }
    }
    return false;
  }
  
  function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw ground
    ctx.fillStyle = '#111';
    ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);
    
    // Draw player
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw eyes
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y - 6, 5, 0, Math.PI * 2);
    ctx.arc(player.x - 10, player.y - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw pupils
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(player.x + 10, player.y - 6, 2, 0, Math.PI * 2);
    ctx.arc(player.x - 10, player.y - 6, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw obstacles
    obstacles.forEach(obstacle => {
      ctx.fillStyle = obstacle.color;
      ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
    
    // Draw score
    ctx.fillStyle = 'white';
    ctx.font = '22px Inter, Arial';
    ctx.fillText('Счет: ' + score, 20, 40);
  }
  
  // Main game loop
  function update() {
    if (!gameActive) return;
    
    frameCount++;
    
    // Apply gravity
    player.vy += GRAVITY;
    player.y += player.vy;
    
    // Ground collision
    if (player.y > groundY - PLAYER_SIZE) {
      player.y = groundY - PLAYER_SIZE;
      player.vy = 0;
      player.jumping = false;
    }
    
    // Generate obstacles
    if (frameCount % Math.max(60, Math.floor(120 - gameSpeed*6)) === 0) {
      generateObstacle();
    }
    
    // Move obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
      obstacles[i].x -= gameSpeed;
      if (obstacles[i].x + obstacles[i].width < 0) {
        obstacles.splice(i, 1);
        score++;
      }
    }
    
    // Check collisions
    if (checkCollision()) {
      endGame();
      return;
    }
    
    // Increase difficulty
    gameSpeed += GAME_SPEED_INCREMENT;
    
    // Draw frame
    draw();
    
    // Continue loop
    rafId = requestAnimationFrame(update);
  }
  
  // Start game
  function startGame() {
    if (gameActive) return;
    initGame();
    gameActive = true;
    overlay.style.display = 'none';
    canvas.style.pointerEvents = 'auto';
    rafId = requestAnimationFrame(update);
  }
  
  // End game
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
    
    // Add event listeners
    document.getElementById('restartButton').addEventListener('click', startGame);
    document.getElementById('exitButton').addEventListener('click', exitGame);
  }
  
  // Exit game
  function exitGame() {
    gameActive = false;
    if (rafId) cancelAnimationFrame(rafId);
    overlay.style.display = 'none';
    canvas.style.display = 'none';
    obstacles = [];
    score = 0;
  }
  
  // Handle keyboard input
  function handleKey(e) {
    if (e.code === 'Space') {
      e.preventDefault();
      if (!gameActive) startGame();
      else if (!player.jumping) {
        player.vy = JUMP_FORCE;
        player.jumping = true;
      }
    } else if (e.code === 'Escape' && gameActive) {
      e.preventDefault();
      endGame();
    }
  }
  window.addEventListener('keydown', handleKey);
  
  // Handle touch/mouse input
  canvas.addEventListener('pointerdown', () => {
    if (!gameActive) startGame();
    else if (!player.jumping) {
      player.vy = JUMP_FORCE;
      player.jumping = true;
    }
  });
  
  // Handle window resize
  window.addEventListener('resize', () => {
    if (gameActive) initGame();
  });
})();