
import React, { useState, useEffect, useCallback } from 'react';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import GameOverModal from './components/GameOverModal';
import { BOARD_WIDTH, BOARD_HEIGHT, TETROMINOS } from './constants';
import type { Board as BoardType, Piece, ScoreEntry } from './types';
import { getHighScores, saveHighScore } from './services/scoreService';

const createEmptyBoard = (): BoardType => Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill([0, '']));

const getRandomPiece = (): Piece => {
  const tetrominoKeys = Object.keys(TETROMINOS);
  const randTetromino = tetrominoKeys[Math.floor(Math.random() * tetrominoKeys.length)];
  const pieceData = TETROMINOS[randTetromino];
  return {
    shape: pieceData.shape,
    color: pieceData.color,
    pos: { x: Math.floor(BOARD_WIDTH / 2) - 1, y: 0 },
    name: randTetromino
  };
};

const App: React.FC = () => {
  const [board, setBoard] = useState<BoardType>(createEmptyBoard());
  const [piece, setPiece] = useState<Piece>(getRandomPiece());
  const [nextPiece, setNextPiece] = useState<Piece>(getRandomPiece());
  const [score, setScore] = useState(0);
  const [linesCleared, setLinesCleared] = useState(0);
  const [level, setLevel] = useState(1);
  const [isGameOver, setIsGameOver] = useState(false);
  const [highScores, setHighScores] = useState<ScoreEntry[]>([]);
  const [isPaused, setIsPaused] = useState(false);

  const gameSpeed = Math.max(100, 1000 - (level - 1) * 50);

  const checkCollision = useCallback((p: Piece, b: BoardType, move: { x: number; y: number }): boolean => {
    for (let y = 0; y < p.shape.length; y++) {
      for (let x = 0; x < p.shape[y].length; x++) {
        if (p.shape[y][x] !== 0) {
          const newY = y + p.pos.y + move.y;
          const newX = x + p.pos.x + move.x;

          if (
            newY >= BOARD_HEIGHT ||
            newX < 0 ||
            newX >= BOARD_WIDTH ||
            (b[newY] && b[newY][newX][0] !== 0)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }, []);
  
  const resetGame = useCallback(() => {
    const newPiece = getRandomPiece();
    setBoard(createEmptyBoard());
    setPiece(newPiece);
    setNextPiece(getRandomPiece());
    setScore(0);
    setLinesCleared(0);
    setLevel(1);
    setIsGameOver(false);
    setIsPaused(false);
  }, []);

  const advancePiece = useCallback(() => {
    if (isPaused || isGameOver) return;

    if (!checkCollision(piece, board, { x: 0, y: 1 })) {
      setPiece(prev => ({ ...prev, pos: { ...prev.pos, y: prev.pos.y + 1 } }));
    } else {
      if (piece.pos.y < 1) {
        setIsGameOver(true);
        return;
      }

      const newBoard = board.map(row => [...row]);
      piece.shape.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            newBoard[y + piece.pos.y][x + piece.pos.x] = [value, piece.color];
          }
        });
      });

      // Check for cleared lines
      let linesRemoved = 0;
      const boardWithoutFullLines = newBoard.filter(row => {
        if (row.every(cell => cell[0] !== 0)) {
          linesRemoved++;
          return false;
        }
        return true;
      });

      if (linesRemoved > 0) {
        const newEmptyRows: BoardType = Array.from({ length: linesRemoved }, () => Array(BOARD_WIDTH).fill([0, '']));
        const finalBoard = [...newEmptyRows, ...boardWithoutFullLines];
        setBoard(finalBoard);
        setScore(prev => prev + linesRemoved * 5);
        setLinesCleared(prev => prev + linesRemoved);
        setLevel(Math.floor((score + linesRemoved * 5) / 100) + 1);
      } else {
        setBoard(newBoard);
      }

      setPiece(nextPiece);
      setNextPiece(getRandomPiece());
    }
  }, [board, checkCollision, isGameOver, isPaused, nextPiece, piece, score]);
  

  const movePiece = (dir: -1 | 1) => {
    if (!checkCollision(piece, board, { x: dir, y: 0 })) {
      setPiece(prev => ({ ...prev, pos: { ...prev.pos, x: prev.pos.x + dir } }));
    }
  };

  const rotatePiece = () => {
    const clonedPiece = JSON.parse(JSON.stringify(piece));
    const { shape } = clonedPiece;

    // Transpose
    for (let y = 0; y < shape.length; ++y) {
      for (let x = 0; x < y; ++x) {
        [shape[x][y], shape[y][x]] = [shape[y][x], shape[x][y]];
      }
    }

    // Reverse rows to get rotation
    clonedPiece.shape = shape.map((row: number[]) => row.reverse());
    
    // Check for collision after rotation and wall kick if necessary
    if (!checkCollision(clonedPiece, board, { x: 0, y: 0 })) {
      setPiece(clonedPiece);
    } else {
       // Simple wall kick
       if (!checkCollision(clonedPiece, board, { x: 1, y: 0 })) {
         clonedPiece.pos.x += 1;
         setPiece(clonedPiece);
       } else if (!checkCollision(clonedPiece, board, { x: -1, y: 0 })) {
         clonedPiece.pos.x -= 1;
         setPiece(clonedPiece);
       }
    }
  };
  
  useEffect(() => {
      setHighScores(getHighScores());
  }, []);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (isGameOver) return;
    
    if (e.key === 'p' || e.key === 'P') {
      setIsPaused(prev => !prev);
      return;
    }
    
    if (isPaused) return;

    if (e.key === 'ArrowLeft') {
      movePiece(-1);
    } else if (e.key === 'ArrowRight') {
      movePiece(1);
    } else if (e.key === 'ArrowDown') {
      advancePiece();
    } else if (e.key === 'ArrowUp') {
      rotatePiece();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isGameOver, isPaused, advancePiece]); // Re-add listener if these change

  useEffect(() => {
    const gameInterval = setInterval(advancePiece, gameSpeed);
    return () => clearInterval(gameInterval);
  }, [advancePiece, gameSpeed]);

  const handleSaveScore = (name: string) => {
      saveHighScore(name, score);
      setHighScores(getHighScores());
      setIsGameOver(false);
      resetGame();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-mono">
      <h1 className="text-5xl font-bold mb-4 text-cyan-400 tracking-widest" style={{textShadow: '0 0 10px #06b6d4, 0 0 20px #06b6d4'}}>
        REACT TETRIS
      </h1>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="bg-black bg-opacity-50 p-2 rounded-lg border-2 border-slate-700 shadow-lg" style={{boxShadow: '0 0 20px rgba(0,0,0,0.5)'}}>
            <Board board={board} piece={piece} />
        </div>
        <div className="flex flex-col gap-4 w-full md:w-64">
           <GameInfo score={score} level={level} linesCleared={linesCleared} nextPiece={nextPiece} />
           <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
             <h2 className="text-xl font-bold mb-2 text-cyan-400">Controls</h2>
             <ul className="list-disc list-inside text-slate-300">
                <li><span className="font-bold">Left/Right:</span> Move</li>
                <li><span className="font-bold">Up:</span> Rotate</li>
                <li><span className="font-bold">Down:</span> Soft Drop</li>
                <li><span className="font-bold">P:</span> Pause/Resume</li>
             </ul>
           </div>
            <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
                <h2 className="text-xl font-bold mb-2 text-cyan-400">High Scores</h2>
                {highScores.length > 0 ? (
                    <ol className="list-decimal list-inside text-slate-300">
                        {highScores.map((s, i) => (
                            <li key={i} className="flex justify-between">
                                <span>{s.name}</span>
                                <span>{s.score}</span>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <p className="text-slate-400">No scores yet!</p>
                )}
            </div>
        </div>
      </div>
      {isGameOver && <GameOverModal score={score} onSave={handleSaveScore} onRestart={resetGame} />}
      {isPaused && !isGameOver && (
         <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
            <h2 className="text-4xl font-bold text-yellow-400 animate-pulse">PAUSED</h2>
         </div>
      )}
    </div>
  );
};

export default App;
