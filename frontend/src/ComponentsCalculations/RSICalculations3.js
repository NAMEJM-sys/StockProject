import React, { useState, useEffect } from 'react';
import FetchRSIData from '../ComponentsFetch/FetchStockOrignal/FetchRSIData';

function RSICalculations3({ stockCode, onScoreCalculated }) {
    const [rsiData, setRSIData] = useState([]);
    const [score, setScore] = useState(null);

    const calculateVolatilityScore = (rsiData, period = 14) => {
        const lastIndex = rsiData.length - 1;
        if (lastIndex < period) return null;

        const currentData = rsiData[lastIndex];

        const currentVolatility = currentData?.RSI_Volatility;
        const currentZScore = currentData?.RSI_Z_Score;

        if (currentVolatility === undefined || currentZScore === undefined) {
            return null;
        }

        const volatilityValues = rsiData.slice(lastIndex - period + 1, lastIndex + 1).map((data) => data.RSI_Volatility);
        const avgVolatility = volatilityValues.reduce((sum, value) => sum + value, 0) / period;

        const isHighVolatility = currentVolatility > avgVolatility;
        const isHighZScore = Math.abs(currentZScore) > 2;

        // 점수 부여
        let calculatedScore = 5; // 기본 보통
        if (isHighVolatility && isHighZScore) {
            calculatedScore = 8; // 매도 경계
        } else if (isHighVolatility && !isHighZScore) {
            calculatedScore = 4; // 매수 경계
        } else if (!isHighVolatility && isHighZScore) {
            calculatedScore = 6; // 주의
        } else {
            calculatedScore = 5; // 보통
        }

        setScore(calculatedScore);

        if (onScoreCalculated && calculatedScore !== null) {
            onScoreCalculated(calculatedScore);
        }
    };

    useEffect(() => {
        if (rsiData.length > 0) {
            calculateVolatilityScore(rsiData);
        }
    }, [rsiData]);

    return (
        <div>
            <FetchRSIData stockCode={stockCode} onRSIFetch={setRSIData} />
        </div>
    );
}

export default RSICalculations3;