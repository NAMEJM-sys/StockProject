import React, { useState, useEffect } from 'react';
import FetchMACDData from '../ComponentsFetch/FetchStockOrignal/FetchMACDData';

function MACDCalculations4({ stockCode, onScoreCalculated }) {
    const [macdData, setMACDData] = useState([]);

    const calculateMultiTimeframeScore = (macdData) => {
        if (macdData.length === 0) {
            return null;
        }

        const lastIndex = macdData.length - 1;
        const currentData = macdData[lastIndex];

        // 데이터 검증
        if (
            currentData['MACD_12_26_9'] === undefined ||
            currentData['Signal_12_26_9'] === undefined ||
            currentData['MACD_50_100_9'] === undefined ||
            currentData['Signal_50_100_9'] === undefined
        ) {
            return null;
        }

        // 단기 MACD 설정 (12,26,9)
        const shortMACD = currentData['MACD_12_26_9'];
        const shortSignal = currentData['Signal_12_26_9'];

        // 장기 MACD 설정 (50,100,9)
        const longMACD = currentData['MACD_50_100_9'];
        const longSignal = currentData['Signal_50_100_9'];

        let score = 5; // 기본 보통

        // 단기 및 장기 추세 판단
        const shortTrend = shortMACD > shortSignal ? '상승' : '하락';
        const longTrend = longMACD > longSignal ? '상승' : '하락';

        if (shortTrend === '상승' && longTrend === '상승') {
            score = 3; // 강한 매수
        } else if (shortTrend === '하락' && longTrend === '하락') {
            score = 7; // 강한 매도
        } else {
            score = 5; // 보통
        }

        return score;
    };

    useEffect(() => {
        if (macdData.length > 0) {
            const score = calculateMultiTimeframeScore(macdData);
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

export default MACDCalculations4;