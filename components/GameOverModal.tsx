
import React, { useState } from 'react';

interface GameOverModalProps {
  score: number;
  onSave: (name: string) => void;
  onRestart: () => void;
}

const GameOverModal: React.FC<GameOverModalProps> = ({ score, onSave, onRestart }) => {
  const [name, setName] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  return (
    <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center z-10">
      <div className="bg-slate-800 p-8 rounded-lg shadow-2xl text-center border-2 border-cyan-400 w-full max-w-sm">
        <h2 className="text-4xl font-bold mb-2 text-red-500">GAME OVER</h2>
        <p className="text-xl mb-4 text-slate-300">Your Score: <span className="font-bold text-yellow-400">{score}</span></p>
        
        <div className="mb-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={10}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="w-full bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Save Score
          </button>
          <button
            onClick={onRestart}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
          >
            Play Again
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverModal;
