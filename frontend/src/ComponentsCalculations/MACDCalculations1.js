import React, { useState, useEffect } from 'react';
import FetchMACDData from '../ComponentsFetch/FetchStockOrignal/FetchMACDData';

function MACDCalculations1({ stockCode, onScoreCalculated }) {
    const [macdData, setMACDData] = useState([]);

    const calculateScore = (macdData, period = 14) => {
        if (macdData.length < period + 1) {
            return null;
        }

        const lastIndex = macdData.length - 1;
        const currentMACD = macdData[lastIndex].MACD_Line;
        const currentSignal = macdData[lastIndex].Signal_Line;
        const prevMACD = macdData[lastIndex - 1].MACD_Line;
        const prevSignal = macdData[lastIndex - 1].Signal_Line;

        let score = 5; // 기본 보통

        // 1. MACD와 Signal Line의 교차 분석
        if (prevMACD < prevSignal && currentMACD > currentSignal) {
            score = 3; // 매수
        } else if (prevMACD > prevSignal && currentMACD < currentSignal) {
            score = 7; // 매도
        }

        // 2. 크로스오버 예상 시점 계산
        const macdIndices = [];
        const macdValues = [];
        const signalValues = [];

        for (let i = lastIndex - period + 1; i <= lastIndex; i++) {
            macdIndices.push(i);
            macdValues.push(macdData[i].MACD_Line);
            signalValues.push(macdData[i].Signal_Line);
        }

        // 선형 회귀 계산
        const n = period;
        const sumX = macdIndices.reduce((a, b) => a + b, 0);
        const sumYMacd = macdValues.reduce((a, b) => a + b, 0);
        const sumYSignal = signalValues.reduce((a, b) => a + b, 0);
        const sumXYMacd = macdIndices.reduce((sum, x, i) => sum + x * macdValues[i], 0);
        const sumXYSignal = macdIndices.reduce((sum, x, i) => sum + x * signalValues[i], 0);
        const sumX2 = macdIndices.reduce((sum, x) => sum + x * x, 0);

        const slopeMacd = (n * sumXYMacd - sumX * sumYMacd) / (n * sumX2 - sumX * sumX);
        const interceptMacd = (sumYMacd - slopeMacd * sumX) / n;

        const slopeSignal = (n * sumXYSignal - sumX * sumYSignal) / (n * sumX2 - sumX * sumX);
        const interceptSignal = (sumYSignal - slopeSignal * sumX) / n;

        const a = slopeMacd - slopeSignal;
        const b = interceptMacd - interceptSignal;

        let daysToCrossover = null;

        if (a !== 0) {
            const t_crossover = -b / a;
            daysToCrossover = t_crossover - lastIndex;
            if (daysToCrossover >= 0 && daysToCrossover <= 3) {
                if (slopeMacd > slopeSignal) {
                    score -= 1; // 매수 쪽으로
                } else {
                    score += 1; // 매도 쪽으로
                }
            }
        }

        // 3. MACD 히스토그램 추세 분석
        const currentHistogram = macdData[lastIndex].Histogram;
        const prevHistogram = macdData[lastIndex - 1].Histogram;

        if (currentHistogram > prevHistogram) {
            score -= 1; // 매수 쪽으로
        } else if (currentHistogram < prevHistogram) {
            score += 1; // 매도 쪽으로
        }

        // 점수 범위 조정
        score = Math.max(1, Math.min(10, score));

        return {score, currentMACD};
    };

    useEffect(() => {
        if (macdData.length > 0) {
            const result = calculateScore(macdData);
            if (result !== null && onScoreCalculated) {
                onScoreCalculated(result);
            }
        }
    }, [macdData]);

    return (
        <div>
            <FetchMACDData stockCode={stockCode} onMACDFetch={setMACDData} />
        </div>
    );
}

export default MACDCalculations1;