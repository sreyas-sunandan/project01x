const choices = ["rock", "paper", "scissors"];

function play(playerChoice) {
  const computerChoice = choices[Math.floor(Math.random() * 3)];

  let resultText = `You: ${playerChoice} | Computer: ${computerChoice} — `;

  if (playerChoice === computerChoice) {
    resultText += "Draw";
    document.getElementById("result").innerText = resultText;
    return;
  }

  const win =
    (playerChoice === "rock" && computerChoice === "scissors") ||
    (playerChoice === "paper" && computerChoice === "rock") ||
    (playerChoice === "scissors" && computerChoice === "paper");

  if (win) {
    resultText += "You Win!";
    sendResult("win");
  } else {
    resultText += "You Lose!";
    sendResult("lose");
  }

  document.getElementById("result").innerText = resultText;
}

function resetGame() {
  document.getElementById("result").innerText = "";
}

function sendResult(result) {
  fetch(`/update-result/?game=rps&result=${result}`);
}

