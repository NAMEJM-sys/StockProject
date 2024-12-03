import React, { useState, useEffect } from 'react';
import FetchCCIData from '../ComponentsFetch/FetchStockOrignal/FetchCCIData';

function CCICalculations3({ stockCode, onScoreCalculated }) {
    const [cciData, setCCIData] = useState([]);

    const calculateVolatilityScore = (cciData, period = 14) => {
        const lastIndex = cciData.length - 1;
        if (lastIndex < period) return null;

        const currentData = cciData[lastIndex];

        const currentVolatility = currentData?.CCI_Volatility;
        const currentZScore = currentData?.CCI_Z_Score;

        if (currentVolatility === undefined || currentZScore === undefined) {
            return null;
        }

        const volatilityValues = cciData.slice(lastIndex - period + 1, lastIndex + 1).map((data) => data.CCI_Volatility);
        const avgVolatility = volatilityValues.reduce((sum, value) => sum + value, 0) / period;

        const isHighVolatility = currentVolatility > avgVolatility;
        const isHighZScore = Math.abs(currentZScore) > 2;

        // 점수 부여
        let score = 5; // 기본 보통
        if (isHighVolatility && isHighZScore) {
            score = 8; // 매도 경계
        } else if (isHighVolatility && !isHighZScore) {
            score = 4; // 매수 경계
        } else if (!isHighVolatility && isHighZScore) {
            score = 6; // 주의
        } else {
            score = 5; // 보통
        }

        if (onScoreCalculated) {
            onScoreCalculated(score);
        }
    };

    useEffect(() => {
        if (cciData.length > 0) {
            calculateVolatilityScore(cciData);
        }
    }, [cciData]);

    return (
        <div>
            <FetchCCIData stockCode={stockCode} onCCIFetch={setCCIData} />
        </div>
    );
}

export default CCICalculations3;