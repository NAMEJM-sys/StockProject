import React, { useState, useEffect } from 'react';
import FetchMACDData from '../ComponentsFetch/FetchStockOrignal/FetchMACDData';

function MACDCalculations5({ stockCode, onScoreCalculated }) {
    const [macdData, setMACDData] = useState([]);

    const calculateTrendStrengthScore = (macdData, period = 5) => {
        if (macdData.length < period + 1) {
            return null;
        }

        // MACD 변화량 직접 계산
        const recentData = macdData.slice(-period - 1);
        const macdChanges = [];

        for (let i = 1; i < recentData.length; i++) {
            macdChanges.push(recentData[i].MACD_Line - recentData[i - 1].MACD_Line);
        }

        const avgMACDChange = macdChanges.slice(0, -1).reduce((a, b) => a + b, 0) / (period - 1);

        // 최근 MACD 변화량 계산
        const currentMACDChange = macdChanges[macdChanges.length - 1];

        let scoreAdjustment = 0;

        // 현재 MACD 변화량이 평균보다 큰지 판단
        if (Math.abs(currentMACDChange) > Math.abs(avgMACDChange)) {
            // 현재 MACD 추세 방향 판단
            const lastIndex = macdData.length - 1;
            const currentMACD = macdData[lastIndex].MACD_Line;
            const currentSignal = macdData[lastIndex].Signal_Line;

            if (currentMACD > currentSignal) {
                // 상승 추세에서 추세 강화
                scoreAdjustment -= 1; // 매수 쪽으로
            } else if (currentMACD < currentSignal) {
                // 하락 추세에서 추세 강화
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
        if (macdData.length > 0) {
            const score = calculateTrendStrengthScore(macdData);
            if (score !== null && onScoreCalculated) {
                onScoreCalculated(score);
            }
        }
    }, [macdData]);

    return (
        <div>
            <FetchMACDData stockCode={stockCode} onMACDFetch={setMACDData} />
        </div>
    );
}

export default MACDCalculations5;