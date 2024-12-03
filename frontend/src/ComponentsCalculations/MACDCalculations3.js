import React, { useState, useEffect } from 'react';
import FetchMACDData from '../ComponentsFetch/FetchStockOrignal/FetchMACDData';

function MACDCalculations3({ stockCode, onScoreCalculated }) {
    const [macdData, setMACDData] = useState([]);

    const calculateHistogramScore = (macdData, period = 5) => {
        if (macdData.length < period + 1) {
            return null;
        }

        const lastIndex = macdData.length - 1;
        const currentHistogram = macdData[lastIndex].Histogram;
        const prevHistogram = macdData[lastIndex - 1].Histogram;

        let scoreAdjustment = 0;

        // Histogram이 0선을 상향 또는 하향 돌파할 때
        if (prevHistogram < 0 && currentHistogram > 0) {
            scoreAdjustment -= 1; // 매수 쪽으로
        } else if (prevHistogram > 0 && currentHistogram < 0) {
            scoreAdjustment += 1; // 매도 쪽으로
        }

        // Histogram의 연속적인 증감 추세 분석
        let increasingCount = 0;
        let decreasingCount = 0;

        for (let i = lastIndex - period + 1; i < lastIndex; i++) {
            if (macdData[i + 1].Histogram > macdData[i].Histogram) {
                increasingCount++;
            } else if (macdData[i + 1].Histogram < macdData[i].Histogram) {
                decreasingCount++;
            }
        }

        if (increasingCount >= 3) {
            scoreAdjustment -= 1; // 매수 쪽으로
        } else if (decreasingCount >= 3) {
            scoreAdjustment += 1; // 매도 쪽으로
        }

        // 기본 점수는 5점
        let score = 5 + scoreAdjustment;

        // 점수 범위 조정
        score = Math.max(1, Math.min(10, score));

        return score;
    };

    useEffect(() => {
        if (macdData.length > 0) {
            const score = calculateHistogramScore(macdData);
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

export default MACDCalculations3;