import React, { useState, useEffect } from 'react';
import FetchADXData from '../ComponentsFetch/FetchStockOrignal/FetchADXData';

function ADXCalculations1({ stockCode, onScoreCalculated }) {
    const [adxData, setADXData] = useState([]);

    // 지수 이동 평균(EMA) 계산 함수
    const calculateEMA = (values, period) => {
        const k = 2 / (period + 1);
        let emaArray = [];
        values.forEach((value, index) => {
            if (index === 0) {
                emaArray.push(value);
            } else {
                const ema = value * k + emaArray[index - 1] * (1 - k);
                emaArray.push(ema);
            }
        });
        return emaArray;
    };

    const calculateTrendStrengthScore = (adxData, period = 14) => {
        if (adxData.length < period) {
            return null;
        }

        const adxValues = adxData.map(data => data.ADX);
        const recentADX = adxValues.slice(-period);

        // 최근 period 기간의 ADX 지수 이동 평균 계산
        const emaArray = calculateEMA(recentADX, period);
        const avgADX = emaArray[emaArray.length - 1];

        let score = 5; // 기본 보통

        if (avgADX >= 25) {
            score = 5; // 추세는 강하나 방향성은 추가 분석 필요
        } else if (avgADX <= 20) {
            score = 5; // 추세 약함
        } else {
            score = 5; // 보통
        }

        return {score, avgADX};
    };

    useEffect(() => {
        if (adxData.length > 0) {
            const result = calculateTrendStrengthScore(adxData);
            if (result !== null && onScoreCalculated) {
                onScoreCalculated(result);
            }
        }
    }, [adxData]);

    return (
        <div>
            <FetchADXData stockCode={stockCode} onADXFetch={setADXData} />
        </div>
    );
}

export default ADXCalculations1;