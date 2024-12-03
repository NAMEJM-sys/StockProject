import React, { useState, useEffect } from 'react';
import FetchStochasticData from "../ComponentsFetch/FetchStockOrignal/FetchStochasticData";
import StochasticCalculations1 from "./StochasticCalculations1";

function StochasticTotalCalculation({ stockCode, onResultUpdate }) {
    const [stochasticData, setStochasticData] = useState(null);
    const [calculatedScore, setCalculatedScore] = useState(null);

    const weights = {
        basic: 2, // 백엔드 기본 점수 가중치
        calculated: 3, // 클라이언트 계산 점수 가중치
    };


    useEffect(() => {
        if (stochasticData) {
            let lastDate = stochasticData.length - 1;
            const latestData = stochasticData[lastDate];

            const totalScore = (
                (latestData.score * weights.basic) +
                (calculatedScore * weights.calculated)
            ) / (weights.basic + weights.calculated);

            const recommendation = getRecommendation(totalScore); // 받아온 점수에 따른 추천

            if (onResultUpdate){
                onResultUpdate({
                    name: 'Stochastic %K(14, 3, 3)',
                    value: latestData.perK.toFixed(2),
                    damm: totalScore,
                    recommendation: recommendation
                });
            }
        }
    }, [stochasticData, calculatedScore]); // stochasticData가 변경될 때마다 실행

    const getRecommendation = (score) => {
        if (score <= 2.0) {
            return '강한 매수';
        } else if (score <= 4.0) {
            return '매수';
        } else if (score <= 6.0) {
            return '보통';
        } else if (score <= 8.0) {
            return '매도';
        } else {
            return '강한 매도';
        }
    };

    return (
        <>
            <FetchStochasticData stockCode={stockCode} onStochasticFetch={(result) => setStochasticData(result)} />
            <StochasticCalculations1 stockCode={stockCode} onScoreCalculated={setCalculatedScore} />
        </>
    );
}

export default StochasticTotalCalculation;