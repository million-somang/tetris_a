import type { ScoreEntry } from '../types';

const HIGH_SCORES_KEY = 'tetrisHighScores';
const MAX_SCORES = 5;

/*
================================================================================
 MySQL 데이터베이스 연동 안내
================================================================================

이 애플리케이션은 기본적으로 브라우저의 localStorage를 사용하여 점수를 저장합니다.
실제 MySQL 데이터베이스를 연동하려면 별도의 백엔드 서버가 필요합니다.

데이터베이스와 테이블 생성을 위한 전체 SQL 스크립트는 프로젝트 루트의
`DB.sql` 파일에서 확인하실 수 있습니다.

백엔드 서버가 준비되면, 아래의 localStorage 로직을 백엔드 API를 호출하는
코드(예: fetch, axios)로 수정해야 합니다.
================================================================================
*/


export const getHighScores = (): ScoreEntry[] => {
  try {
    const scoresJSON = localStorage.getItem(HIGH_SCORES_KEY);
    return scoresJSON ? JSON.parse(scoresJSON) : [];
  } catch (error) {
    console.error("Could not retrieve high scores", error);
    return [];
  }
};

export const saveHighScore = (name: string, score: number): void => {
  if (score === 0) return;
  
  try {
    const scores = getHighScores();
    const newScore: ScoreEntry = { name, score };
    
    scores.push(newScore);
    
    // Sort scores descending and keep only the top N
    const sortedScores = scores
      .sort((a, b) => b.score - a.score)
      .slice(0, MAX_SCORES);
      
    localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(sortedScores));
  } catch (error) {
    console.error("Could not save high score", error);
  }
};
