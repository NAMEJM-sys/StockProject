import React, { useState, useEffect } from 'react';
import FetchADXData from '../ComponentsFetch/FetchStockOrignal/FetchADXData';

function ADXCalculations4({ stockCode, onScoreCalculated }) {
    const [adxData, setADXData] = useState([]);

    // 지수 이동 평균(EMA) 계산 함수
    const calculateEMA = (values, period) => {
        const k = 2 / (period + 1);
        let ema = [];
        values.forEach((value, index) => {
            if (index === 0) {
                ema.push(value);
            } else {
                ema.push(value * k + ema[index - 1] * (1 - k));
            }
        });
        return ema;
    };

    const calculateCombinedADXScore = (adxData, period = 14) => {
        if (adxData.length < period) {
            return null;
        }

        const recentData = adxData.slice(-period);
        const adxValues = recentData.map(data => data.ADX);
        const diPlusValues = recentData.map(data => data.DI14Plus);
        const diMinusValues = recentData.map(data => data.DI14Minus);

        // ADX의 EMA 계산
        const adxEMAArray = calculateEMA(adxValues, period);
        const avgADX = adxEMAArray[adxEMAArray.length - 1];

        // DI+와 DI-의 EMA 계산
        const diPlusEMAArray = calculateEMA(diPlusValues, period);
        const avgDIPlus = diPlusEMAArray[diPlusEMAArray.length - 1];
        const diMinusEMAArray = calculateEMA(diMinusValues, period);
        const avgDIMinus = diMinusEMAArray[diMinusEMAArray.length - 1];

        let score = 5; // 기본 보통

        if (avgADX >= 25) {
            if (avgDIPlus > avgDIMinus) {
                score = 3; // 강한 상승 추세 (매수)
            } else if (avgDIPlus < avgDIMinus) {
                score = 7; // 강한 하락 추세 (매도)
            }
        }

        return score;
    };

    useEffect(() => {
        if (adxData.length > 0) {
            const score = calculateCombinedADXScore(adxData);
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

export default ADXCalculations4;