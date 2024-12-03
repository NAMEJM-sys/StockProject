import React, { useState, useEffect } from 'react';
import FetchADXData from '../ComponentsFetch/FetchStockOrignal/FetchADXData';

function ADXCalculations2({ stockCode, onScoreCalculated }) {
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

    const calculateDICrossoverScore = (adxData, period = 14) => {
        if (adxData.length < period + 1) {
            return null;
        }

        // DI+와 DI-의 값 추출
        const diPlusValues = adxData.map(data => data.DI14Plus);
        const diMinusValues = adxData.map(data => data.DI14Minus);

        // EMA 계산
        const diPlusEMA = calculateEMA(diPlusValues, period);
        const diMinusEMA = calculateEMA(diMinusValues, period);

        // 최근 값과 이전 값 가져오기
        const currentDiPlusEMA = diPlusEMA[diPlusEMA.length - 1];
        const currentDiMinusEMA = diMinusEMA[diMinusEMA.length - 1];
        const prevDiPlusEMA = diPlusEMA[diPlusEMA.length - 2];
        const prevDiMinusEMA = diMinusEMA[diMinusEMA.length - 2];

        let score = 5; // 기본 보통

        if (prevDiPlusEMA <= prevDiMinusEMA && currentDiPlusEMA > currentDiMinusEMA) {
            score = 3; // 매수
        } else if (prevDiPlusEMA >= prevDiMinusEMA && currentDiPlusEMA < currentDiMinusEMA) {
            score = 7; // 매도
        }

        return score;
    };

    useEffect(() => {
        if (adxData.length > 0) {
            const score = calculateDICrossoverScore(adxData);
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

export default ADXCalculations2;