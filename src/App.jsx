
import { useState, useEffect } from "react";
import "./App.css";

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board) {
  for (let i = 0; i < WINNING_COMBINATIONS.length; i++) {
    const combination = WINNING_COMBINATIONS[i];
    const [a, b, c] = combination;

    if (
      board[a] &&
      board[a] === board[b] &&
      board[b] === board[c]
    ) {
      return {
        winner: board[a],
        combination,
        lineIndex: i,
      };
    }
  }

  return null;
}

// Computer prioritizes winning, then blocking, then center/corners.
function getComputerMove(board) {
  for (const symbol of ["O", "X"]) {
    for (let i = 0; i < 9; i++) {
      if (board[i]) continue;

      const testBoard = [...board];
      testBoard[i] = symbol;

      if (checkWinner(testBoard)) {
        return i;
      }
    }
  }

  if (!board[4]) return 4;

  const corners = [0, 2, 6, 8].filter(
    (index) => !board[index]
  );

  if (corners.length) {
    return corners[
      Math.floor(Math.random() * corners.length)
    ];
  }

  const emptyCells = board
    .map((cell, index) => (!cell ? index : -1))
    .filter((index) => index !== -1);

  if (!emptyCells.length) return -1;

  return emptyCells[
    Math.floor(Math.random() * emptyCells.length)
  ];
}

function App() {
  const [mode, setMode] = useState(null);
  const [board, setBoard] = useState(Array(9).fill(""));
  const [currentPlayer, setCurrentPlayer] = useState("X");
  const [winnerInfo, setWinnerInfo] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [thinking, setThinking] = useState(false);

  const [scores, setScores] = useState({
    player1: 0,
    player2: 0,
    ties: 0,
  });

  const isMachine = mode === "machine";
  const gameOver = Boolean(winnerInfo);

  // Computer's turn.
  useEffect(() => {
    if (
      mode !== "machine" ||
      !thinking ||
      winnerInfo
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const index = getComputerMove(board);

      if (index === -1) {
        setThinking(false);
        return;
      }

      const nextBoard = [...board];
      nextBoard[index] = "O";

      setBoard(nextBoard);
      setThinking(false);

      const result = checkWinner(nextBoard);

      if (result) {
        setWinnerInfo(result);
        setShowPopup(true);

        setScores((previous) => ({
          ...previous,
          player2: previous.player2 + 1,
        }));

        return;
      }

      if (nextBoard.every(Boolean)) {
        setWinnerInfo({ winner: "TIE" });
        setShowPopup(true);

        setScores((previous) => ({
          ...previous,
          ties: previous.ties + 1,
        }));

        return;
      }

      setCurrentPlayer("X");
    }, 550);

    return () => clearTimeout(timer);
  }, [mode, thinking, board, winnerInfo]);

  function handleClick(index) {
    if (
      !mode ||
      board[index] ||
      gameOver ||
      thinking ||
      (isMachine && currentPlayer === "O")
    ) {
      return;
    }

    const nextBoard = [...board];
    nextBoard[index] = currentPlayer;

    setBoard(nextBoard);

    const result = checkWinner(nextBoard);

    if (result) {
      setWinnerInfo(result);
      setShowPopup(true);

      setScores((previous) => ({
        ...previous,
        player1:
          currentPlayer === "X"
            ? previous.player1 + 1
            : previous.player1,
        player2:
          currentPlayer === "O"
            ? previous.player2 + 1
            : previous.player2,
      }));

      return;
    }

    if (nextBoard.every(Boolean)) {
      setWinnerInfo({ winner: "TIE" });
      setShowPopup(true);

      setScores((previous) => ({
        ...previous,
        ties: previous.ties + 1,
      }));

      return;
    }

    if (isMachine) {
      setCurrentPlayer("O");
      setThinking(true);
    } else {
      setCurrentPlayer(
        currentPlayer === "X" ? "O" : "X"
      );
    }
  }

  function playAgain() {
    setBoard(Array(9).fill(""));
    setCurrentPlayer("X");
    setWinnerInfo(null);
    setShowPopup(false);
    setThinking(false);
  }

  function chooseMode(selectedMode) {
    setMode(selectedMode);
    setScores({
      player1: 0,
      player2: 0,
      ties: 0,
    });
    playAgain();
  }

  function changeMode() {
    setMode(null);
    playAgain();
  }

  function resetScores() {
    setScores({
      player1: 0,
      player2: 0,
      ties: 0,
    });
    playAgain();
  }

  const popupDescription =
    winnerInfo?.winner === "X"
      ? "Amazing! Three in a row!"
      : winnerInfo?.winner === "O"
        ? isMachine
          ? "The machine takes this round. Try again!"
          : "Fantastic! Three in a row!"
        : "Great match! Both sides played well.";

  return (
    <main className="game-page">
      <div className="decor decor-left" />
      <div className="decor decor-right" />

      {!mode ? (
        <section className="game-container mode-screen">
          <header className="game-header">
            <div className="eyebrow">
              <span className="live-dot" />
              WELCOME TO THE GAME
            </div>

            <h1>
              Tic Tac <span>Toe</span>
              <span className="title-sparkle">✦</span>
            </h1>

            <p className="subtitle">
              Two ways to play. Choose your challenge!
            </p>
          </header>

          <div className="mode-options">
            <button
              type="button"
              className="mode-card mode-human"
              onClick={() => chooseMode("human")}
            >
              <span className="mode-icon">
                <span className="x-symbol">X</span>
                <span className="o-symbol">O</span>
              </span>

              <strong>2 Players</strong>

              <span className="mode-description">
                Play with a friend
              </span>

              <span className="mode-cta">
                Choose mode <span>→</span>
              </span>
            </button>

            <button
              type="button"
              className="mode-card mode-machine"
              onClick={() => chooseMode("machine")}
            >
              <span className="mode-icon machine-icon">
                ✕ <span>✦</span>
              </span>

              <strong>Play vs Machine</strong>

              <span className="mode-description">
                Challenge the computer
              </span>

              <span className="mode-cta">
                Choose mode <span>→</span>
              </span>
            </button>
          </div>

          <p className="mode-note">
            Make a line of three and claim the victory!
          </p>
        </section>
      ) : (
        <section className="game-container">
          <header className="game-header">
            <div className="eyebrow">
              <span className="live-dot" />
              {isMachine
                ? "PLAYER VS MACHINE"
                : "TWO PLAYER GAME"}
            </div>

            <h1>
              Tic Tac <span>Toe</span>
              <span className="title-sparkle">✦</span>
            </h1>

            <p className="subtitle">
              {isMachine
                ? "Can you beat the machine?"
                : "Two Players. One Board. Who will win?"}
            </p>
          </header>

          <section className="score-panel">
            <div
              className={`score-card player-one ${!gameOver && currentPlayer === "X"
                  ? "active-player"
                  : ""
                }`}
            >
              <div className="score-symbol x-symbol">X</div>
              <div className="score-label">PLAYER 1</div>
              <strong>{scores.player1}</strong>
              <span className="score-badge">WINS</span>
            </div>

            <div className="score-card tie-card">
              <div className="score-symbol tie-symbol">=</div>
              <div className="score-label">TIES</div>
              <strong>{scores.ties}</strong>
              <span className="score-badge">DRAWS</span>
            </div>

            <div
              className={`score-card player-two ${!gameOver && currentPlayer === "O"
                  ? "active-player"
                  : ""
                }`}
            >
              <div className="score-symbol o-symbol">O</div>

              <div className="score-label">
                {isMachine ? "MACHINE" : "PLAYER 2"}
              </div>

              <strong>{scores.player2}</strong>
              <span className="score-badge">WINS</span>
            </div>
          </section>

          <div className="turn-status" aria-live="polite">
            <span
              className={`turn-dot ${thinking ? "thinking-dot" : ""
                } ${gameOver ? "finished-dot" : ""}`}
            />

            {gameOver
              ? "Round completed"
              : thinking
                ? "Machine is thinking..."
                : isMachine
                  ? "Your turn — Play X"
                  : `Player ${currentPlayer === "X" ? "1" : "2"
                  }'s turn — Play ${currentPlayer}`}
          </div>

          <div className="board-wrap">
            <div className="board">
              {board.map((cell, index) => (
                <button
                  key={index}
                  type="button"
                  className={`cell ${cell === "X"
                      ? "cell-x"
                      : cell === "O"
                        ? "cell-o"
                        : ""
                    } ${winnerInfo?.combination?.includes(index)
                      ? "winning-cell"
                      : ""
                    }`}
                  onClick={() => handleClick(index)}
                  disabled={
                    Boolean(cell) ||
                    gameOver ||
                    thinking ||
                    (isMachine && currentPlayer === "O")
                  }
                  aria-label={`Cell ${index + 1}: ${cell || "empty"
                    }`}
                >
                  {cell && (
                    <span className="cell-mark">{cell}</span>
                  )}
                </button>
              ))}

              {winnerInfo?.combination && (
                <div
                  key={winnerInfo.lineIndex}
                  className={`winning-line line-${winnerInfo.lineIndex}`}
                />
              )}
            </div>
          </div>

          <div className="game-actions">
            <button
              type="button"
              className="restart-button"
              onClick={playAgain}
            >
              <span className="restart-icon">⟳</span>
              Play Again
            </button>

            <button
              type="button"
              className="reset-score-button"
              onClick={resetScores}
            >
              <span>▤</span> Reset Scores
            </button>

            <button
              type="button"
              className="change-mode-button"
              onClick={changeMode}
            >
              ← Change Game Mode
            </button>
          </div>

          <footer className="game-footer">
            <span className="footer-symbol x-symbol">✕</span>
            <span>PLAYER 1</span>
            <span className="footer-divider" />
            <span className="versus">VS</span>
            <span className="footer-divider" />
            <span className="footer-symbol o-symbol">◉</span>
            <span>{isMachine ? "MACHINE" : "PLAYER 2"}</span>
          </footer>
        </section>
      )}

      {showPopup && winnerInfo && mode && (
        <div className="popup-overlay">
          <section
            className="result-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="result-title"
          >
            <button
              type="button"
              className="popup-x"
              onClick={() => setShowPopup(false)}
              aria-label="Close result"
            >
              ×
            </button>

            <div className="confetti confetti-one">◆</div>
            <div className="confetti confetti-two">●</div>
            <div className="confetti confetti-three">◆</div>
            <div className="confetti confetti-four">●</div>

            <div className="trophy-wrap">
              <span className="trophy-rays">✳</span>
              <span className="trophy">🏆</span>
            </div>

            <span className="popup-kicker">
              ROUND COMPLETE
            </span>

            <h2 id="result-title">
              {winnerInfo.winner === "X" ? (
                <>
                  <span className="win-green">PLAYER 1</span>
                  <span className="win-purple"> WINS!</span>
                </>
              ) : winnerInfo.winner === "O" ? (
                <>
                  <span className="win-orange">
                    {isMachine ? "MACHINE" : "PLAYER 2"}
                  </span>
                  <span className="win-purple"> WINS!</span>
                </>
              ) : (
                <span className="win-purple">
                  IT'S A TIE!
                </span>
              )}
            </h2>

            <p className="popup-description">
              {popupDescription}
            </p>

            <div className="popup-score">
              <div className="popup-player">
                <span className="popup-mark x-symbol">X</span>
                <strong>{scores.player1}</strong>
                <small>PLAYER 1</small>
              </div>

              <div className="popup-score-divider" />

              <div className="popup-player">
                <span className="popup-mark o-symbol">O</span>
                <strong>{scores.player2}</strong>
                <small>
                  {isMachine ? "MACHINE" : "PLAYER 2"}
                </small>
              </div>
            </div>

            <button
              type="button"
              className="popup-play-button"
              onClick={playAgain}
            >
              <span className="popup-restart-icon">⟳</span>
              Play Again
              <span className="popup-arrow">→</span>
            </button>

            <button
              type="button"
              className="popup-close-button"
              onClick={() => setShowPopup(false)}
            >
              ◉ View the Board
            </button>
          </section>
        </div>
      )}
    </main>
  );
}

export default App;
