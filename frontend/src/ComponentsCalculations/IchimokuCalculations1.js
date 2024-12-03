import React, { useState, useEffect } from 'react';
import FetchIchimokuData from '../ComponentsFetch/FetchStockOrignal/FetchIchimokuData';

function IchimokuCalculations1({ stockCode, onScoreCalculated }) {
  const [ichimokuData, setIchimokuData] = useState([]);

  const calculateTenkanKijunCrossScore = (data) => {
    if (data.length < 2) {
      return null;
    }

    const lastIndex = data.length - 1;
    const prevData = data[lastIndex - 1];
    const currentData = data[lastIndex];

    const prevTenkan = prevData.Tenkan_sen;
    const prevKijun = prevData.Kijun_sen;
    const currentTenkan = currentData.Tenkan_sen;
    const currentKijun = currentData.Kijun_sen;

    let score = 5; // 기본 보통

    if (prevTenkan <= prevKijun && currentTenkan > currentKijun) {
      score = 3; // 매수
    } else if (prevTenkan >= prevKijun && currentTenkan < currentKijun) {
      score = 7; // 매도
    }

    return {score, prevKijun};
  };

  useEffect(() => {
    if (ichimokuData.length > 0) {
      const result = calculateTenkanKijunCrossScore(ichimokuData);
      if (result !== null && onScoreCalculated) {
        onScoreCalculated(result);
      }
    }
  }, [ichimokuData]);

  return (
    <div>
      <FetchIchimokuData stockCode={stockCode} onIchimokuFetch={setIchimokuData} />
    </div>
  );
}

export default IchimokuCalculations1;