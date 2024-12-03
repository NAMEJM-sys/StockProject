import React, { useState, useEffect } from 'react';
import FetchKeltnerData from '../ComponentsFetch/FetchStockOrignal/FetchKeltnerData';

function KeltnerCalculations3({ stockCode, onScoreCalculated }) {
  const [keltnerData, setKeltnerData] = useState([]);

  const calculateChannelAngle = (keltnerData, period = 14) => {
    if (keltnerData.length < period) {
      return null;
    }
    const recentData = keltnerData.slice(-period);
    const middleLineValues = recentData.map(data => data.Middle_Line);

    const indices = [...Array(period).keys()];
    const n = period;
    const sumX = indices.reduce((a, b) => a + b, 0);
    const sumY = middleLineValues.reduce((a, b) => a + b, 0);
    const sumXY = indices.reduce((sum, x, i) => sum + x * middleLineValues[i], 0);
    const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const angle = Math.atan(slope) * (180 / Math.PI); // 기울기를 각도로 변환

    return angle;
  };

  const calculateBreakOutScore = (keltnerData, period = 14) => {
    const angle = calculateChannelAngle(keltnerData, period);

    if (angle === null || keltnerData.length < period + 1) {
      return null;
    }

    const lastIndex = keltnerData.length - 1;
    const currentData = keltnerData[lastIndex];
    const prevData = keltnerData[lastIndex - 1];

    const currentClose = currentData.close;
    const currentUpper = currentData.Upper_Band;
    const currentLower = currentData.Lower_Band;

    const prevClose = prevData.close;
    const prevUpper = prevData.Upper_Band;
    const prevLower = prevData.Lower_Band;

    let score = 5; // 기본 보통

    if (prevClose <= prevUpper && currentClose > currentUpper && angle > 5) {
      score = 3; // 매수
    } else if (prevClose >= prevLower && currentClose < currentLower && angle < -5) {
      score = 7; // 매도
    }

    return score;
  };

  useEffect(() => {
    if (keltnerData.length > 0) {
      const score = calculateBreakOutScore(keltnerData);
      if (score !== null && onScoreCalculated) {
        onScoreCalculated(score);
      }
    }
  }, [keltnerData]);

  return (
    <div>
      <FetchKeltnerData stockCode={stockCode} onKelFetch={setKeltnerData} />
    </div>
  );
}

export default KeltnerCalculations3;