import React, { useState, useEffect } from 'react';
import FetchSARData from '../ComponentsFetch/FetchStockOrignal/FetchParabolicSARData';
import FetchStockDataForCode from '../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode';

function SARCalculations4({ stockCode, onScoreCalculated }) {
  const [sarData, setSARData] = useState([]);
  const [stockData, setStockData] = useState([]);

  const calculateCombinedScore = (sarData, stockData, period = 14) => {
    if (sarData.length < period || stockData.length < period) {
      return null;
    }

    // EMA 계산
    const closingPrices = stockData.map((data) => data.close);
    const recentPrices = closingPrices.slice(-period);

    const calculateEMA = (prices, period) => {
      const k = 2 / (period + 1);
      let emaArray = [];
      let ema = prices[0];
      emaArray.push(ema);

      for (let i = 1; i < prices.length; i++) {
        ema = prices[i] * k + ema * (1 - k);
        emaArray.push(ema);
      }
      return emaArray;
    };

    const emaArray = calculateEMA(recentPrices, period);
    const currentEMA = emaArray[emaArray.length - 1];

    const lastIndex = sarData.length - 1;
    const currentPrice = closingPrices[closingPrices.length - 1];
    const currentSAR = sarData[lastIndex].Parabolic_SAR;

    let score = 5; // 기본 보통

    if (currentPrice > currentSAR && currentPrice > currentEMA) {
      score = 3; // 매수 강화
    } else if (currentPrice < currentSAR && currentPrice < currentEMA) {
      score = 7; // 매도 강화
    }

    return score;
  };

  useEffect(() => {
    if (sarData.length > 0 && stockData.length > 0) {
      const score = calculateCombinedScore(sarData, stockData);
      if (score !== null && onScoreCalculated) {
        onScoreCalculated(score);
        console.log("sar4",score);

      }
    }
  }, [sarData]);

  return (
    <div>
      <FetchSARData stockCode={stockCode} onSARFetch={setSARData} />
      <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
    </div>
  );
}

export default SARCalculations4;