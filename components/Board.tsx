
import React from 'react';
import type { Board as BoardType, Piece } from '../types';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants';

interface BoardProps {
  board: BoardType;
  piece: Piece;
}

const Board: React.FC<BoardProps> = ({ board, piece }) => {
  // Create a new board for rendering that includes the current piece
  const renderBoard = JSON.parse(JSON.stringify(board));

  piece.shape.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        const boardY = y + piece.pos.y;
        const boardX = x + piece.pos.x;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          renderBoard[boardY][boardX] = [value, piece.color];
        }
      }
    });
  });

  return (
    <div
      className="grid gap-px bg-slate-800"
      style={{
        gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)`,
        gridTemplateRows: `repeat(${BOARD_HEIGHT}, 1fr)`,
        width: '250px',
        height: '500px',
      }}
    >
      {renderBoard.map((row: [number, string][], y: number) =>
        row.map((cell, x) => {
          const color = cell[0] !== 0 ? cell[1] : 'bg-slate-900';
          return (
            <div
              key={`${y}-${x}`}
              className={`${color} transition-colors duration-100`}
            ></div>
          );
        })
      )}
    </div>
  );
};

export default Board;
