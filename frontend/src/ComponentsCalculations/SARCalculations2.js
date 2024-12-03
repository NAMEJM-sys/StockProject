import React, { useState, useEffect } from 'react';
import FetchSARData from '../ComponentsFetch/FetchStockOrignal/FetchParabolicSARData';

function SARCalculations2({ stockCode, onScoreCalculated }) {
  const [sarData, setSARData] = useState([]);

  const calculateTrendPersistenceScore = (sarData) => {
    if (sarData.length < 2) {
      return null;
    }

    let upTrendDays = 0;
    let downTrendDays = 0;

    // 최근 데이터부터 거꾸로 순회하여 연속된 추세 일수를 계산
    for (let i = sarData.length - 1; i >= 0; i--) {
      const currentPrice = sarData[i].close;
      const currentSAR = sarData[i].Parabolic_SAR;

      if (currentPrice > currentSAR) {
        if (downTrendDays > 0) break;
        upTrendDays++;
      } else if (currentPrice < currentSAR) {
        if (upTrendDays > 0) break;
        downTrendDays++;
      } else {
        break;
      }
    }

    let score = 5; // 기본 보통

    if (upTrendDays >= 3) {
      score = 3; // 매수 강화
    } else if (upTrendDays > 0) {
      score = 4; // 매수
    } else if (downTrendDays >= 3) {
      score = 7; // 매도 강화
    } else if (downTrendDays > 0) {
      score = 6; // 매도
    }

    return score;
  };

  useEffect(() => {
    if (sarData.length > 0) {
      const score = calculateTrendPersistenceScore(sarData);
      if (score !== null && onScoreCalculated) {
        onScoreCalculated(score);
        console.log("sar2",score);

      }
    }
  }, [sarData]);

  return (
    <div>
      <FetchSARData stockCode={stockCode} onSARFetch={setSARData} />
    </div>
  );
}

export default SARCalculations2;