import React, { useState, useEffect } from 'react';
import FetchKeltnerData from '../ComponentsFetch/FetchStockOrignal/FetchKeltnerData';

function KeltnerCalculations1({ stockCode, onScoreCalculated }) {
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

  const calculateTrendWithSlopeScore = (keltnerData, period = 14) => {
    const angle = calculateChannelAngle(keltnerData, period);

    if (angle === null) {
      return null;
    }

    let score = 5; // 기본 보통

    // 1. 채널의 기울기에 따른 기본 점수 설정
    if (angle > 5) {
      score -= 2; // 매수
    } else if (angle < -5) {
      score += 2; // 매도
    }

    const currentData = keltnerData[keltnerData.length - 1];
    const currentClose = currentData.close;
    const upperBand = currentData.Upper_Band;
    const lowerBand = currentData.Lower_Band;
    const middleLine = currentData.Middle_Line;

    // 2. 가격 위치에 따른 점수 조정
    if (currentClose > upperBand) {
      if (angle <= 5) {
        score += 2; // 매도 신호 강화
      }
    } else if (currentClose < lowerBand) {
      if (angle >= -5) {
        score -= 1; // 매수 신호 강화
      }
    } else if (currentClose < middleLine) {
      if (angle >= -5) {
        score -= 2;
      }
    }

    // 점수 범위 조정
    score = Math.max(1, Math.min(10, score));

    return {score, middleLine};
  };

  useEffect(() => {
    if (keltnerData.length > 0) {
      const result = calculateTrendWithSlopeScore(keltnerData);
      if (result !== null && onScoreCalculated) {
        onScoreCalculated(result);
      }
    }
  }, [keltnerData]);

  return (
    <div>
      <FetchKeltnerData stockCode={stockCode} onKelFetch={setKeltnerData} />
    </div>
  );
}

export default KeltnerCalculations1;