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
  return (
    <button
      className="ttt-square"
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
  let statusLabel;
  if (winner !== null) {
    statusLabel = (
      <span className="status-win">
        🎉 Winner: <strong>{winner}</strong>
      </span>
    );
  } else if (isDraw) {
    statusLabel = (
      <span className="status-draw">
        🤝 It's a <strong>Draw</strong>
      </span>
    );
  } else {
    statusLabel = (
      <span className="status-turn">
        Turn: <strong>{current === 'X' ? 'X' : 'O'}</strong>
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
 * Main App component.
 */
// PUBLIC_INTERFACE
function App() {
  // State for board, X is first
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [history, setHistory] = useState([]);
  const [theme, setTheme] = useState('light');

  // Apply provided color theme to CSS root variables (light only)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    // Apply custom palette
    document.documentElement.style.setProperty('--accent', COLORS.accent);
    document.documentElement.style.setProperty('--primary', COLORS.primary);
    document.documentElement.style.setProperty('--secondary', COLORS.secondary);
    document.documentElement.style.setProperty('--board-bg', '#fff');
    document.documentElement.style.setProperty('--board-border', '#e0e0e0');
  }, []);

  // Game calculations
  const { winner, line: winningLine } = calculateWinner(squares);
  const isDraw = !winner && squares.every(Boolean);

  // PUBLIC_INTERFACE
  const handleSquareClick = (i) => {
    if (squares[i] || winner) return;
    const nextSquares = [...squares];
    nextSquares[i] = xIsNext ? 'X' : 'O';
    setHistory(h => [...h, squares]);
    setSquares(nextSquares);
    setXIsNext(!xIsNext);
  };

  // PUBLIC_INTERFACE
  const handleRestart = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    setHistory([]);
  };

  // Styling variables for minimalist layout/colors
  // Center content, max width of board, space for controls/status
  return (
    <div className="ttt-app">
      <main className="ttt-main-container">
        <div className="ttt-header" style={{ color: 'var(--primary)' }}>
          <h1 className="ttt-title">Tic Tac Toe</h1>
          <p className="ttt-description">Minimal Tic Tac Toe — React Demo</p>
        </div>
        <GameStatus
          gameStatus={winner ? 'win' : isDraw ? 'draw' : 'active'}
          current={xIsNext ? 'X' : 'O'}
          winner={winner}
          isDraw={isDraw}
        />
        <Board
          squares={squares}
          onSquareClick={handleSquareClick}
          winningLine={winningLine}
        />
        <div className="ttt-controls">
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
