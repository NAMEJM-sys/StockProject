import React, { useState, useEffect } from 'react';
import FetchIchimokuData from '../ComponentsFetch/FetchStockOrignal/FetchIchimokuData';

function IchimokuCalculations4({ stockCode, onScoreCalculated }) {
  const [ichimokuData, setIchimokuData] = useState([]);

  const calculateCloudThicknessScore = (data) => {
    if (data.length < 52) {
      return null;
    }

    const lastIndex = data.length - 26; // 구름대는 26일 앞에 표시됨
    const currentData = data[lastIndex];

    const senkouA = currentData.Senkou_Span_A;
    const senkouB = currentData.Senkou_Span_B;
    const cloudColor = currentData.Cloud_Colour;

    // 구름대 두께 계산
    const cloudThickness = Math.abs(senkouA - senkouB);
    const isThickCloud = cloudThickness > (currentData.close * 0.03); // 구름대 두께가 가격의 3% 이상인 경우

    let score = 5; // 기본 보통

    if (isThickCloud && cloudColor === 'Bullish') {
      score = 3; // 매수 강화
    } else if (isThickCloud && cloudColor === 'Bearish') {
      score = 7; // 매도 강화
    }

    return score;
  };

  useEffect(() => {
    if (ichimokuData.length > 0) {
      const score = calculateCloudThicknessScore(ichimokuData);
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

export default IchimokuCalculations4;