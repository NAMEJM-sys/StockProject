import React, { useState, useEffect } from 'react';
import FetchADXData from '../ComponentsFetch/FetchStockOrignal/FetchADXData';

function ADXCalculations3({ stockCode, onScoreCalculated }) {
    const [adxData, setADXData] = useState([]);

    const calculateADXDirectionScore = (adxData, period = 14) => {
        if (adxData.length < period) {
            return null;
        }

        const recentData = adxData.slice(-period);
        const adxValues = recentData.map(data => data.ADX);

        // 선형 회귀를 통한 ADX 추세 분석
        const indices = [...Array(period).keys()];
        const n = period;
        const sumX = indices.reduce((a, b) => a + b, 0);
        const sumY = adxValues.reduce((a, b) => a + b, 0);
        const sumXY = indices.reduce((sum, x, i) => sum + x * adxValues[i], 0);
        const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

        let scoreAdjustment = 0;

        if (slope > 0) {
            // 추세 강도 강화
            const lastIndex = adxData.length - 1;
            const diPlus = adxData[lastIndex].DI14Plus;
            const diMinus = adxData[lastIndex].DI14Minus;

            if (diPlus > diMinus) {
                scoreAdjustment -= 1; // 매수 쪽으로
            } else if (diPlus < diMinus) {
                scoreAdjustment += 1; // 매도 쪽으로
            }
        }

        // 기본 점수는 5점
        let score = 5 + scoreAdjustment;

        // 점수 범위 조정
        score = Math.max(1, Math.min(10, score));

        return score;
    };

    useEffect(() => {
        if (adxData.length > 0) {
            const score = calculateADXDirectionScore(adxData);
            if (score !== null && onScoreCalculated) {
                onScoreCalculated(score);
            }
        }
    }, [adxData]);

    return (
        <div>
            <FetchADXData stockCode={stockCode} onADXFetch={setADXData} />
        </div>
    );
}

export default ADXCalculations3;