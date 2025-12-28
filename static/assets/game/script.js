/******************************
 * CSRF + SCORE SAVE
 ******************************/
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.startsWith(name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

function saveScoreToDB(score) {
  fetch("/game/save-score/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCookie("csrftoken")
    },
    body: JSON.stringify({ score: score })
  })
  .then(res => res.json())
  .then(data => {
    const highScoreEl = document.getElementById("high-score");
    if (highScoreEl && data.high_score !== undefined) {
      highScoreEl.textContent = data.high_score;
    }
  })
  .catch(err => console.error("Score save error:", err));
}

/******************************
 * GAME LOGIC
 ******************************/
document.addEventListener("DOMContentLoaded", function () {

  const container = document.getElementById('game-container');
  const bird = document.getElementById('bird');
  const scoreDiv = document.getElementById('score');

  if (!container || !bird || !scoreDiv) {
    console.error("Game elements missing in HTML");
    return;
  }

  let birdY = 280, velocity = 0;
  const gravity = 0.5, jumpPower = -8;
  let pipes = [], score = 0, gameOver = false;

  /******************************
   * PIPE CREATION
   ******************************/
  function createPipe() {
    const gap = 150;
    const containerHeight = container.offsetHeight;
    const containerWidth = container.offsetWidth;
    const pipeWidth = 60;

    const heightTop = Math.random() * (containerHeight - gap - 100);

    const topWrapper = document.createElement('div');
    const bottomWrapper = document.createElement('div');

    const top = document.createElement('img');
    top.src = '/static/assets/game/pipe.png';
    top.style.transform = 'scaleY(-1)';
    top.style.width = '100%';
    top.style.position = 'absolute';
    top.style.bottom = '0';

    topWrapper.appendChild(top);
    topWrapper.style.position = 'absolute';
    topWrapper.style.width = `${pipeWidth}px`;
    topWrapper.style.height = `${heightTop}px`;
    topWrapper.style.top = '0';
    topWrapper.style.left = `${containerWidth + 10}px`;
    topWrapper.style.overflow = 'hidden';

    const bottom = document.createElement('img');
    bottom.src = '/static/assets/game/pipe.png';
    bottom.style.width = '100%';

    bottomWrapper.appendChild(bottom);
    bottomWrapper.style.position = 'absolute';
    bottomWrapper.style.width = `${pipeWidth}px`;
    bottomWrapper.style.height = `${containerHeight - heightTop - gap}px`;
    bottomWrapper.style.bottom = '0';
    bottomWrapper.style.left = `${containerWidth + 10}px`;
    bottomWrapper.style.overflow = 'hidden';

    container.appendChild(topWrapper);
    container.appendChild(bottomWrapper);

    pipes.push({ top: topWrapper, bottom: bottomWrapper, passed: false });
  }

  /******************************
   * CONTROLS
   ******************************/
  function jump() {
    if (!gameOver) velocity = jumpPower;
  }

  document.addEventListener('keydown', e => {
    if (e.code === 'Space') jump();
  });

  document.addEventListener('click', jump);
  document.addEventListener('touchstart', e => {
    e.preventDefault();
    jump();
  });

  /******************************
   * GAME LOOP
   ******************************/
  function update() {
    if (gameOver) return;

    velocity += gravity;
    birdY += velocity;
    bird.style.top = birdY + 'px';

    pipes.forEach(p => {
      const x = parseInt(p.top.style.left);
      p.top.style.left = (x - 2) + 'px';
      p.bottom.style.left = (x - 2) + 'px';

      const bx = bird.getBoundingClientRect();
      const tx = p.top.getBoundingClientRect();

      const birdMid = bx.left + bx.width / 2;
      if (!p.passed && birdMid > tx.left + tx.width) {
        score++;
        scoreDiv.textContent = score;
        p.passed = true;
      }

      if (
        bx.right > tx.left && bx.left < tx.right &&
        (bx.top < tx.bottom || bx.bottom > p.bottom.getBoundingClientRect().top)
      ) {
        endGame();
      }

      if (x < -60) {
        p.top.remove();
        p.bottom.remove();
      }
    });

    pipes = pipes.filter(p => parseInt(p.top.style.left) > -60);

    if (birdY > 570 || birdY < -30) endGame();

    requestAnimationFrame(update);
  }

  function spawnLoop() {
    if (!gameOver) {
      createPipe();
      setTimeout(spawnLoop, 2000);
    }
  }

  /******************************
   * GAME OVER
   ******************************/
  function endGame() {
    if (gameOver) return;
    gameOver = true;

    saveScoreToDB(score);

    const popup = document.getElementById('game-over-popup');
    const scoreSpan = document.getElementById('final-score');
    const restartBtn = document.getElementById('restart-btn');

    scoreSpan.textContent = score;
    popup.style.display = 'flex';

    restartBtn.onclick = () => {
      window.location.reload();
    };
  }

  /******************************
   * START GAME
   ******************************/
  spawnLoop();
  update();

});

