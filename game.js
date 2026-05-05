const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let gameOver = false;

const player = {
    x: 50,
    y: 150,
    width: 20,
    height: 20,
    dy: 0,
    jumpForce: -10,
    gravity: 0.6,
    grounded: true
};

const obstacles = [];
let frameCount = 0;

function resetGame() {
    score = 0;
    gameOver = false;
    player.y = 150;
    player.dy = 0;
    obstacles.length = 0;
    frameCount = 0;
    requestAnimationFrame(update);
}

function jump() {
    if (player.grounded && !gameOver) {
        player.dy = player.jumpForce;
        player.grounded = false;
    } else if (gameOver) {
        resetGame();
    }
}

// Handle spacebar / up arrow
window.addEventListener("keydown", (e) => {
    // Check if event target is the document body to avoid interfering with form inputs if there are any
    if ((e.code === "Space" || e.code === "ArrowUp") && e.target === document.body) {
        jump();
        e.preventDefault(); // Prevent scrolling
    }
});

// Handle touch / click on canvas
if (canvas) {
    canvas.addEventListener("mousedown", jump);
    canvas.addEventListener("touchstart", (e) => {
        jump();
        e.preventDefault();
    });
}

function update() {
    if (!canvas) return;

    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply gravity
    player.dy += player.gravity;
    player.y += player.dy;

    // Ground collision
    if (player.y + player.height > canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.grounded = true;
    }

    // Draw player
    ctx.fillStyle = "#3498db";
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Obstacles
    frameCount++;
    // Increase difficulty by reducing spawn frames over time
    let spawnRate = Math.max(40, 90 - Math.floor(score / 5) * 10);

    if (frameCount % spawnRate === 0) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 20,
            width: 20,
            height: 20,
            speed: 5 + Math.floor(score / 10) // Speed increases slightly
        });
        frameCount = 0; // reset to avoid overflow eventually, though not strictly necessary
    }

    ctx.fillStyle = "#e74c3c";
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        obs.x -= obs.speed;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

        // Collision detection
        if (
            player.x < obs.x + obs.width &&
            player.x + player.width > obs.x &&
            player.y < obs.y + obs.height &&
            player.y + player.height > obs.y
        ) {
            gameOver = true;
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
            obstacles.splice(i, 1);
            score++;
            i--;
        }
    }

    // Draw score
    ctx.fillStyle = "#333";
    ctx.font = "16px Arial";
    ctx.fillText(`Score: ${score}`, canvas.width - 80, 20);

    if (gameOver) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = "white";
        ctx.font = "24px Arial";
        ctx.textAlign = "center";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 10);
        ctx.font = "16px Arial";
        ctx.fillText("Tap or Space to Restart", canvas.width / 2, canvas.height / 2 + 20);
        ctx.textAlign = "left"; // reset
    } else {
        requestAnimationFrame(update);
    }
}

// Start game
if (canvas) {
    update();
}
