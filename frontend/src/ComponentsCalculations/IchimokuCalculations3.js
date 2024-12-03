import React, { useState, useEffect } from 'react';
import FetchIchimokuData from '../ComponentsFetch/FetchStockOrignal/FetchIchimokuData';

function IchimokuCalculations3({ stockCode, onScoreCalculated }) {
  const [ichimokuData, setIchimokuData] = useState([]);

  const calculateChikouSpanScore = (data) => {
    if (data.length < 26) {
      return null;
    }

    const lastIndex = data.length - 26; // Chikou Span은 26일 뒤로 이동

    if (lastIndex < 0) {
      return null;
    }

    const currentData = data[lastIndex];

    const chikouSpan = currentData.Chikou_Span;
    const currentClose = currentData.close;

    let score = 5; // 기본 보통

    if (chikouSpan > currentClose) {
      score = 3; // 매수
    } else if (chikouSpan < currentClose) {
      score = 7; // 매도
    }

    return score;
  };

  useEffect(() => {
    if (ichimokuData.length > 0) {
      const score = calculateChikouSpanScore(ichimokuData);
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

export default IchimokuCalculations3;