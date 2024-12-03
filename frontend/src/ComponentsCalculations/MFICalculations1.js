import React, { useState, useEffect } from 'react';
import FetchMFIData from '../ComponentsFetch/FetchStockOrignal/FetchMFIData';

function MFICalculations1({ stockCode, onScoreCalculated }) {
    const [mfiData, setMFIData] = useState([]);

    // 점수 부여 함수들
    const getMFIStateScore = (currentMFI) => {
        if (currentMFI > 80) {
            return 7; // 매도
        } else if (currentMFI < 20) {
            return 3; // 매수
        } else {
            return 5; // 보통
        }
    };

    const getMACrossoverScore = (currentMFI_MA_Crossover) => {
        if (currentMFI_MA_Crossover === 1) {
            return 3; // 매수
        } else if (currentMFI_MA_Crossover === -1) {
            return 7; // 매도
        } else {
            return 5; // 보통
        }
    };

    const getPriceMFITrendScore = (priceTrendDirection, mfiTrendDirection) => {
        if (priceTrendDirection === '상승' && mfiTrendDirection === '상승') {
            return 3; // 매수
        } else if (priceTrendDirection === '하락' && mfiTrendDirection === '하락') {
            return 7; // 매도
        } else if (priceTrendDirection === '상승' && mfiTrendDirection === '하락') {
            return 6; // 중간 매도
        } else if (priceTrendDirection === '하락' && mfiTrendDirection === '상승') {
            return 4; // 중간 매수
        } else {
            return 5; // 보통
        }
    };

    const calculateOverallScore = (currentMFI, currentMFI_MA_Crossover,
                                   priceTrendDirection, mfiTrendDirection) => {
        const mfiStateScore = getMFIStateScore(currentMFI);
        const macrossoverScore = getMACrossoverScore(currentMFI_MA_Crossover);
        const trendScore = getPriceMFITrendScore(priceTrendDirection, mfiTrendDirection);

        const elementScores = [mfiStateScore, macrossoverScore, trendScore];
        const weights = [1, 2, 3]; // 중요도 가중치
        const weightedScores = elementScores.map((score, index) => score * weights[index]);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        const overallScore = weightedScores.reduce((a, b) => a + b, 0) / totalWeight;

        return overallScore;
    };

    const analyzeMFITrend = (mfiData, period = 14) => {
        const lastIndex = mfiData.length - 1;
        if (lastIndex < period) return null;

        const currentMFI = mfiData[lastIndex]?.MFI;
        const prevMFI = mfiData[lastIndex - 1]?.MFI;

        const mfiTrendData = mfiData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.MFI);
        const totalChange = mfiTrendData[mfiTrendData.length - 1] - mfiTrendData[0];
        const mfiTrendDirection = totalChange > 0 ? '상승' : '하락';

        const priceTrend = mfiData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.close);
        const priceChange = priceTrend[priceTrend.length - 1] - priceTrend[0];
        const priceTrendDirection = priceChange > 0 ? '상승' : '하락';

        const currentMFI_MA_Crossover = mfiData[lastIndex]?.MFI_MA_Crossover;

        if (currentMFI === undefined || prevMFI === undefined) {
            return null;
        }

        const overallScore = calculateOverallScore(currentMFI, currentMFI_MA_Crossover, priceTrendDirection, mfiTrendDirection);
        return {overallScore, currentMFI };
    };

    useEffect(() => {
        if (mfiData.length > 0) {
            const result = analyzeMFITrend(mfiData);
            if (result !== null) {
                if (onScoreCalculated) {
                    onScoreCalculated(result);
                }
            }
        }
    }, [mfiData]);

    return (
        <div>
            <FetchMFIData stockCode={stockCode} onMFIFetch={setMFIData} />
        </div>
    );
}

export default MFICalculations1;