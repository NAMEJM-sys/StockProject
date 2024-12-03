import React, { useState, useEffect } from 'react';
import FetchIchimokuData from '../ComponentsFetch/FetchStockOrignal/FetchIchimokuData';

function IchimokuCalculations2({ stockCode, onScoreCalculated }) {
  const [ichimokuData, setIchimokuData] = useState([]);

  const calculatePriceCloudRelationScore = (data) => {
    if (data.length < 26) {
      return null;
    }

    const lastIndex = data.length - 1;
    const currentData = data[lastIndex];

    const currentClose = currentData.close;
    const senkouA = currentData.Senkou_Span_A;
    const senkouB = currentData.Senkou_Span_B;

    const upperCloud = Math.max(senkouA, senkouB);
    const lowerCloud = Math.min(senkouA, senkouB);

    let score = 5; // 기본 보통

    if (currentClose > upperCloud) {
      score = 3; // 매수
    } else if (currentClose < lowerCloud) {
      score = 7; // 매도
    }

    // 구름대 돌파 여부 확인
    const prevData = data[lastIndex - 1];
    const prevClose = prevData.close;

    if (prevClose <= lowerCloud && currentClose > upperCloud) {
      score -= 1; // 매수 신호 강화
    } else if (prevClose >= upperCloud && currentClose < lowerCloud) {
      score += 1; // 매도 신호 강화
    }

    // 점수 범위 조정
    score = Math.max(1, Math.min(10, score));

    return score;
  };

  useEffect(() => {
    if (ichimokuData.length > 0) {
      const score = calculatePriceCloudRelationScore(ichimokuData);
      if (score !== null && onScoreCalculated) {
        onScoreCalculated(score);
      }
    }
  }, [ichimokuData]);

  return (
    <div>
      <FetchIchimokuData stockCode={stockCode} onIchimokuFetch={setIchimokuData} />
    </div>
  );
}

export default IchimokuCalculations2;