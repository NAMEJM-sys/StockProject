import React, { useState, useEffect } from 'react';
import FetchSARData from '../ComponentsFetch/FetchStockOrignal/FetchParabolicSARData';

function SARCalculations1({ stockCode, onScoreCalculated }) {
  const [sarData, setSARData] = useState([]);

  const calculateTrendDirectionScore = (sarData) => {
    if (sarData.length < 2) {
      return null;
    }

    const lastIndex = sarData.length - 1;
    const currentPrice = sarData[lastIndex].close;
    const currentSAR = sarData[lastIndex].Parabolic_SAR;
    const prevPrice = sarData[lastIndex - 1].close;
    const prevSAR = sarData[lastIndex - 1].Parabolic_SAR;

    let score = 5; // 기본 보통

    // 1. 현재 추세 방향 판단
    if (currentPrice > currentSAR) {
      score = 3; // 매수
    } else if (currentPrice < currentSAR) {
      score = 7; // 매도
    }

    // 2. 추세 반전 신호 감지
    if (prevPrice <= prevSAR && currentPrice > currentSAR) {
      score -= 2; // 매수 신호 강화
    } else if (prevPrice >= prevSAR && currentPrice < currentSAR) {
      score += 2; // 매도 신호 강화
    }

    // 점수 범위 조정
    score = Math.max(1, Math.min(10, score));

    return {score, currentSAR};
  };

  useEffect(() => {
    if (sarData.length > 0) {
      const result = calculateTrendDirectionScore(sarData);
      if (result !== null && onScoreCalculated) {
        onScoreCalculated(result);
        console.log("sar1",result);
      }
    }
  }, [sarData]);

  return (
    <div>
      <FetchSARData stockCode={stockCode} onSARFetch={setSARData} />
    </div>
  );
}

export default SARCalculations1;