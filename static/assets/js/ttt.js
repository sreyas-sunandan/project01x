let board = Array(9).fill(null);
let playerSymbol = null;
let computerSymbol = null;
let currentPlayer = null;
let gameOver = false;

const wins = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

function chooseSymbol(symbol) {
  playerSymbol = symbol;
  computerSymbol = symbol === "X" ? "O" : "X";
  currentPlayer = "X";

  document.getElementById("symbolSelect").style.display = "none";
  document.getElementById("gameArea").style.display = "block";

  if (computerSymbol === "X") setTimeout(computerMove, 400);
}

function makeMove(index) {
  if (gameOver || board[index] || currentPlayer !== playerSymbol) return;

  placeMove(index, playerSymbol);
  if (checkGameEnd(playerSymbol)) return;

  currentPlayer = computerSymbol;
  setTimeout(computerMove, 400);
}

function computerMove() {
  if (gameOver) return;

  let index =
    findBestMove(computerSymbol) ??
    findBestMove(playerSymbol) ??
    getRandomMove();

  placeMove(index, computerSymbol);
  if (checkGameEnd(computerSymbol)) return;

  currentPlayer = playerSymbol;
}

function placeMove(index, symbol) {
  board[index] = symbol;
  document.getElementsByClassName("cell")[index].innerText = symbol;
}

function checkGameEnd(symbol) {
  if (wins.some(p => p.every(i => board[i] === symbol))) {
    showResult(symbol === playerSymbol ? "YOU WIN 🏆" : "COMPUTER WINS 🤖");
    gameOver = true;
    return true;
  }

  if (!board.includes(null)) {
    showResult("DRAW 🤝");
    gameOver = true;
    return true;
  }
  return false;
}

function showResult(text) {
  const popup = document.getElementById("resultPopup");
  popup.innerText = text;
  popup.style.display = "flex";
}

function findBestMove(symbol) {
  for (let pattern of wins) {
    let values = pattern.map(i => board[i]);
    if (values.filter(v => v === symbol).length === 2 && values.includes(null)) {
      return pattern[values.indexOf(null)];
    }
  }
  return null;
}

function getRandomMove() {
  let empty = board.map((v,i) => v === null ? i : null).filter(v => v !== null);
  return empty[Math.floor(Math.random() * empty.length)];
}

function resetGame() {
  board.fill(null);
  gameOver = false;
  playerSymbol = computerSymbol = currentPlayer = null;

  document.getElementById("symbolSelect").style.display = "block";
  document.getElementById("gameArea").style.display = "none";
  document.getElementById("resultPopup").style.display = "none";

  [...document.getElementsByClassName("cell")].forEach(c => c.innerText = "");
}

