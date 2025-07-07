import React, { useState, useEffect } from 'react';
import './App.css';

// Theme color variables based on provided palette
const COLORS = {
  primary: '#1976d2',   // blue
  secondary: '#424242', // grey dark
  accent: '#ff4081',    // pink accent
};

/**
 * Square: A single square on the Tic Tac Toe board.
 */
function Square({ value, onClick, highlight }) {
  // Determine the class for X or O
  let valueClass = '';
  if (value === 'X') valueClass = 'ttt-x';
  else if (value === 'O') valueClass = 'ttt-o';

  return (
    <button
      className={`ttt-square${value ? ' ' + valueClass : ''}`}
      onClick={onClick}
      aria-label={`Square ${value ?? ''}`}
      style={highlight
        ? { backgroundColor: 'var(--accent)', color: 'white', borderColor: COLORS.accent }
        : {}}
    >
      {value}
    </button>
  );
}

/**
 * Board: Renders the 3x3 grid.
 */
function Board({ squares, onSquareClick, winningLine }) {
  const renderSquare = (i) => (
    <Square
      key={i}
      value={squares[i]}
      onClick={() => onSquareClick(i)}
      highlight={winningLine && winningLine.includes(i)}
    />
  );
  // 3 rows of 3
  return (
    <div className="ttt-board" role="grid" aria-label="Tic Tac Toe Game Board">
      {[0, 1, 2].map(row => (
        <div key={row} className="ttt-row" role="row">
          {[0, 1, 2].map(col => renderSquare(row * 3 + col))}
        </div>
      ))}
    </div>
  );
}

/**
 * Game status bar - indicates current player or result.
 */
function GameStatus({ gameStatus, current, winner, isDraw }) {
  // Helper to wrap X in green, O in yellow
  const renderXO = (v) =>
    v === 'X' ? <span className="ttt-x">X</span>
    : v === 'O' ? <span className="ttt-o">O</span>
    : v;

  let statusLabel;
  if (winner !== null) {
    statusLabel = (
      <span className="status-win">
        🎉 Winner: <strong>{renderXO(winner)}</strong>
      </span>
    );
  } else if (isDraw) {
    statusLabel = (
      <span className="status-draw">
        🤝 It's a <strong>Draw</strong>
      </span>
    );
  } else {
    // `current` may be 'X', 'O', 'User (X)', 'AI (O)'
    const player =
      current === 'X'
        ? renderXO('X')
        : current === 'O'
        ? renderXO('O')
        : typeof current === 'string' && current.includes('X')
        ? <>User (<span className="ttt-x">X</span>)</>
        : typeof current === 'string' && current.includes('O')
        ? <>AI (<span className="ttt-o">O</span>)</>
        : current;
    statusLabel = (
      <span className="status-turn">
        Turn: <strong>{player}</strong>
      </span>
    );
  }
  return <div className="ttt-status" role="status">{statusLabel}</div>;
}

/**
 * Calculate winner and winning line.
 * Returns { winner: 'X' or 'O' or null, line: [a,b,c] if win, or null }
 */
function calculateWinner(squares) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
    [0, 4, 8], [2, 4, 6]             // Diagonal
  ];
  for (let line of lines) {
    const [a, b, c] = line;
    if (
      squares[a] &&
      squares[a] === squares[b] &&
      squares[a] === squares[c]
    ) {
      return { winner: squares[a], line };
    }
  }
  return { winner: null, line: null };
}

/**
 * Main App component with PvP and Player vs AI mode, simple random AI, and current player status.
 */
// PUBLIC_INTERFACE
function App() {
  // Game mode: 'pvp' or 'pve' (player vs environment, i.e., AI)
  const [mode, setMode] = useState('pvp');
  // Who starts as X: 'player' or 'ai' (AI is always O in PvAI for simplicity)
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([]);
  // Used to re-trigger AI/turns on mode/game reset
  const [moveCount, setMoveCount] = useState(0);

  // Theme variables (per spec)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    document.documentElement.style.setProperty('--accent', COLORS.accent);
    document.documentElement.style.setProperty('--primary', COLORS.primary);
    document.documentElement.style.setProperty('--secondary', COLORS.secondary);
    document.documentElement.style.setProperty('--board-bg', '#fff');
    document.documentElement.style.setProperty('--board-border', '#e0e0e0');
  }, []);

  // Calculate winner info and draw state
  const { winner, line: winningLine } = calculateWinner(squares);
  const isDraw = !winner && squares.every(Boolean);

  // Determines whose turn it is: for PvP: X/O, for PvAI: 'User' or 'AI'
  const getTurnText = () => {
    if (mode === 'pvp') {
      return xIsNext ? 'X' : 'O';
    } else {
      // In PvAI: player is always X, AI is O
      return xIsNext ? 'User (X)' : 'AI (O)';
    }
  };

  // PUBLIC_INTERFACE
  // Handles square click logic for both modes
  const handleSquareClick = (i) => {
    if (squares[i] || winner) return;
    // For PvAI, user (X) may play if it's their turn
    if (mode === 'pve' && !xIsNext) return; // Only allow user to play 'X'
    const nextSquares = [...squares];
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setHistory(h => [...h, squares]);
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
    setMoveCount(c => c + 1);
  };

  // PUBLIC_INTERFACE
  // Handles restart, maintaining the same mode
  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setHistory([]);
    setMoveCount(c => c + 1); // For re-triggering AI on reset
  };

  // PUBLIC_INTERFACE
  // Handles switching modes, fully resets board
  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setHistory([]);
    setMoveCount(c => c + 1);
  };

  // PUBLIC_INTERFACE
  // VERY SIMPLE AI LOGIC: returns the index where O should move, or null if not possible
  function getAIMove(squares) {
    // First: if AI can win, take it
    for (let i = 0; i < 9; ++i) {
      if (!squares[i]) {
        const test = squares.slice();
        test[i] = 'O';
        if (calculateWinner(test).winner === 'O') return i;
      }
    }
    // Block player win
    for (let i = 0; i < 9; ++i) {
      if (!squares[i]) {
        const test = squares.slice();
        test[i] = 'X';
        if (calculateWinner(test).winner === 'X') return i;
      }
    }
    // Otherwise: pick random open square
    const open = [];
    squares.forEach((v, idx) => { if (!v) open.push(idx); });
    if (open.length === 0) return null;
    return open[Math.floor(Math.random() * open.length)];
  }

  // AI move effect: triggers if mode is pve, O-turn, not over & board exists
  useEffect(() => {
    if (
      mode === 'pve' &&
      !xIsNext &&
      !winner &&
      !isDraw
    ) {
      // Slight delay for realism
      const timeout = setTimeout(() => {
        const aiMove = getAIMove(squares);
        if (aiMove != null) {
          const nextSquares = squares.slice();
          nextSquares[aiMove] = 'O';
          setHistory(h => [...h, squares]);
          setSquares(nextSquares);
          setXIsNext(true);
          setMoveCount(c => c + 1);
        }
      }, 650);
      return () => clearTimeout(timeout);
    }
    // eslint-disable-next-line
  }, [mode, squares, xIsNext, winner, isDraw, moveCount]);

  // Nice label for mode
  const getModeLabel = () => (mode === 'pvp' ? 'Player vs Player' : 'Player vs AI');

  // Styling variables for minimalist layout/colors
  return (
    <div className="ttt-app">
      <main className="ttt-main-container">
        <div className="ttt-header" style={{ color: 'var(--primary)' }}>
          <h1 className="ttt-title">Tic Tac Toe</h1>
          <p className="ttt-description">
            Minimal Tic Tac Toe — React Demo
          </p>
        </div>

        {/* Mode selection */}
        <div className="ttt-controls" style={{ marginBottom: 10, marginTop: 3 }}>
          <button
            className="ttt-btn"
            style={{
              background: mode === 'pvp' ? 'var(--primary)' : 'var(--accent)',
              color: '#fff'
            }}
            aria-pressed={mode === 'pvp'}
            onClick={() => handleModeChange('pvp')}
            disabled={mode === 'pvp'}
            tabIndex={0}
          >
            PvP
          </button>
          <button
            className="ttt-btn"
            style={{
              background: mode === 'pve' ? 'var(--primary)' : 'var(--accent)',
              color: '#fff'
            }}
            aria-pressed={mode === 'pve'}
            onClick={() => handleModeChange('pve')}
            disabled={mode === 'pve'}
            tabIndex={0}
          >
            PvAI
          </button>
        </div>
        <div
          className="ttt-status"
          style={{ margin: '2px 0 0 0', textAlign: 'center', fontWeight: 500, fontSize: '1.02rem', color: 'var(--text-primary)' }}
        >
          Mode: <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{getModeLabel()}</span>
        </div>

        {/* Show whose turn it is, or winner/draw */}
        <div>
          <GameStatus
            gameStatus={winner ? 'win' : isDraw ? 'draw' : 'active'}
            current={getTurnText()}
            winner={winner}
            isDraw={isDraw}
          />
        </div>

        <Board
          squares={squares}
          onSquareClick={handleSquareClick}
          winningLine={winningLine}
        />

        <div className="ttt-controls" style={{ marginTop: 10 }}>
          <button
            className="ttt-btn"
            onClick={handleRestart}
            aria-label="Restart Game"
            style={{
              background: 'var(--accent)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: 600,
              fontSize: '1rem',
              marginTop: 24,
              boxShadow: '0 2px 6px rgba(25, 118, 210, 0.07)'
            }}>
            Restart
          </button>
        </div>
      </main>
      <footer className="ttt-footer">
        <small>
          Built with
          <span style={{ color: 'var(--accent)', fontWeight: 700, marginLeft: 4 }}>React</span>
        </small>
      </footer>
    </div>
  );
}

export default App;
