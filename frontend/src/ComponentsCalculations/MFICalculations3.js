import React, { useState, useEffect } from 'react';
import FetchMFIData from '../ComponentsFetch/FetchStockOrignal/FetchMFIData';

function MFICalculations3({ stockCode, onScoreCalculated }) {
    const [mfiData, setMFIData] = useState([]);

    const calculateVolatilityScore = (mfiData, period = 14) => {
        const lastIndex = mfiData.length - 1;
        if (lastIndex < period) return null;

        const currentData = mfiData[lastIndex];

        const currentVolatility = currentData?.MFI_Volatility;
        const currentZScore = currentData?.MFI_Z_Score;

        if (currentVolatility === undefined || currentZScore === undefined) {
            return null;
        }

        const volatilityValues = mfiData.slice(lastIndex - period + 1, lastIndex + 1).map((data) => data.MFI_Volatility);
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

        if (onScoreCalculated) {
            onScoreCalculated(calculatedScore);
        }
    };

    useEffect(() => {
        if (mfiData.length > 0) {
            calculateVolatilityScore(mfiData);
        }
    }, [mfiData]);

    return (
        <div>
            <FetchMFIData stockCode={stockCode} onMFIFetch={setMFIData} />
        </div>
    );
}

export default MFICalculations3;