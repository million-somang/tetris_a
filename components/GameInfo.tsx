
import React from 'react';
import type { Piece } from '../types';

interface GameInfoProps {
  score: number;
  level: number;
  linesCleared: number;
  nextPiece: Piece;
}

const StatItem: React.FC<{ label: string; value: number | string }> = ({ label, value }) => (
    <div className="flex justify-between items-baseline">
        <span className="text-slate-400">{label}</span>
        <span className="text-2xl font-bold text-white">{value}</span>
    </div>
);


const GameInfo: React.FC<GameInfoProps> = ({ score, level, linesCleared, nextPiece }) => {
  return (
    <div className="p-4 bg-slate-800 rounded-lg border border-slate-700 space-y-4">
      <h2 className="text-xl font-bold text-center text-cyan-400">STATS</h2>
      <div className="space-y-2">
        <StatItem label="Score" value={score} />
        <StatItem label="Level" value={level} />
        <StatItem label="Lines" value={linesCleared} />
      </div>
      <div className="pt-4 border-t border-slate-700">
         <h3 className="text-center font-bold text-slate-400 mb-2">NEXT</h3>
         <div className="flex justify-center items-center h-24">
            <div className="grid gap-px">
                {nextPiece.shape.map((row, y) => {
                    // Filter out empty rows for better centering
                    if(row.every(cell => cell === 0)) return null;
                    return (
                        <div key={y} className="flex">
                            {row.map((cell, x) => {
                                // Filter out empty columns for centering
                                if (nextPiece.name === 'I' && x > 1) return null;
                                if (nextPiece.name !== 'I' && nextPiece.name !== 'O' && x > 2) return null;
                                
                                const color = cell !== 0 ? nextPiece.color : 'bg-transparent';
                                return (
                                <div
                                    key={`${y}-${x}`}
                                    className={`w-5 h-5 ${color}`}
                                />
                                );
                            })}
                        </div>
                    )
                })}
            </div>
         </div>
      </div>
    </div>
  );
};

export default GameInfo;
