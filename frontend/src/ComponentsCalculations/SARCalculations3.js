import React, { useState, useEffect } from 'react';
import FetchSARData from '../ComponentsFetch/FetchStockOrignal/FetchParabolicSARData';

function SARCalculations3({ stockCode, onScoreCalculated }) {
  const [sarData, setSARData] = useState([]);

  const calculateTrendStrengthScore = (sarData, period = 5) => {
    if (sarData.length < period) {
      return null;
    }

    const recentAFValues = sarData.slice(-period).map((data) => data.AF);

    // AF의 변화 추세 분석
    const afDifferences = recentAFValues.slice(1).map((af, index) => af - recentAFValues[index]);

    const positiveChanges = afDifferences.filter((diff) => diff > 0).length;
    const negativeChanges = afDifferences.filter((diff) => diff < 0).length;

    const currentAF = recentAFValues[recentAFValues.length - 1];
    const lastIndex = sarData.length - 1;
    const currentPrice = sarData[lastIndex].close;
    const currentSAR = sarData[lastIndex].Parabolic_SAR;

    const isUpTrend = currentPrice > currentSAR;
    let scoreAdjustment = 0;

    if (positiveChanges === afDifferences.length) {
      // AF가 지속적으로 증가하여 추세 강도 강화
      if (isUpTrend) {
        scoreAdjustment -= 1; // 매수 쪽으로
      } else {
        scoreAdjustment += 1; // 매도 쪽으로
      }
    } else if (negativeChanges === afDifferences.length) {
      // AF가 지속적으로 감소하여 추세 강도 약화
      if (isUpTrend) {
        scoreAdjustment += 1; // 매수 신호 약화
      } else {
        scoreAdjustment -= 1; // 매도 신호 약화
      }
    }

    // 기본 점수는 5점
    let score = 5 + scoreAdjustment;

    // 점수 범위 조정
    score = Math.max(1, Math.min(10, score));

    return score;
  };

  useEffect(() => {
    if (sarData.length > 0) {
      const score = calculateTrendStrengthScore(sarData);
      if (score !== null && onScoreCalculated) {
        onScoreCalculated(score);
        console.log("sar3",score);

      }
    }
  }, [sarData]);

  return (
    <div>
      <FetchSARData stockCode={stockCode} onSARFetch={setSARData} />
    </div>
  );
}

export default SARCalculations3;