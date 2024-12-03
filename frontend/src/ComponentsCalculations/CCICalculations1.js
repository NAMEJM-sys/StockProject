import React, { useState, useEffect } from 'react';
import FetchCCIData from '../ComponentsFetch/FetchStockOrignal/FetchCCIData';

function CCICalculations1({ stockCode, onScoreCalculated }) {
    const [cciData, setCCIData] = useState([]);

    const calculateScore = (cciData, period = 14) => {
        const lastIndex = cciData.length - 1;
        if (lastIndex < period) return null;

        const currentCCI = cciData[lastIndex]?.CCI;
        const prevCCI = cciData[lastIndex - 1]?.CCI;

        const cciTrendData = cciData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.CCI);
        const totalChange = cciTrendData[cciTrendData.length - 1] - cciTrendData[0];
        const cciTrendDirection = totalChange > 0 ? '상승' : '하락';

        const priceTrendData = cciData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.close);
        const priceChange = priceTrendData[priceTrendData.length - 1] - priceTrendData[0];
        const priceTrendDirection = priceChange > 0 ? '상승' : '하락';

        const currentCCI_MACrossover = cciData[lastIndex]?.CCI_MA_Crossover;

        if (currentCCI === undefined || prevCCI === undefined) {
            return null;
        }

        // 1. 현재 CCI 상태에 따른 초기 점수 설정
        let score = 5; // 보통
        if (currentCCI > 100) {
            score = 8; // 매도
        } else if (currentCCI < -100) {
            score = 2; // 매수
        } else {
            score = 5; // 보통
        }

        // 2. CCI 추세 방향에 따른 점수 조정
        if (cciTrendDirection === '상승') {
            score -= 1; // 매수 쪽으로
        } else {
            score += 1; // 매도 쪽으로
        }

        // 3. 가격 추세 방향에 따른 점수 조정
        if (priceTrendDirection === '상승') {
            score -= 1; // 매수 쪽으로
        } else {
            score += 1; // 매도 쪽으로
        }

        // 4. CCI 이동평균 교차 신호에 따른 점수 조정
        if (currentCCI_MACrossover === 1) {
            score -= 2; // 매수 신호 강화
        } else if (currentCCI_MACrossover === -1) {
            score += 2; // 매도 신호 강화
        }

        // 5. 가격과 CCI 추세의 조합에 따른 점수 조정
        if (priceTrendDirection === '상승' && cciTrendDirection === '상승') {
            score -= 1; // 매수 신호 강화
        } else if (priceTrendDirection === '하락' && cciTrendDirection === '하락') {
            score += 1; // 매도 신호 강화
        } else if (priceTrendDirection === '상승' && cciTrendDirection === '하락') {
            score += 1; // 주의 필요
        } else if (priceTrendDirection === '하락' && cciTrendDirection === '상승') {
            score -= 1; // 가격 반등 가능성
        }

        // 점수 범위 조정 (1 ~ 10 사이)
        score = Math.max(1, Math.min(10, score));

        return {score, currentCCI};
    };

    useEffect(() => {
        if (cciData.length > 0) {
            const result = calculateScore(cciData);
            if (result !== null && onScoreCalculated) {
                onScoreCalculated(result);
            }
        }
    }, [cciData]);

    return (
        <div>
            <FetchCCIData stockCode={stockCode} onCCIFetch={setCCIData} />
        </div>
    );
}

export default CCICalculations1;