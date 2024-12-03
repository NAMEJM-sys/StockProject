import React, {useEffect, useState} from 'react';
import FetchRSIData from "../ComponentsFetch/FetchStockOrignal/FetchRSIData";

function RSICalculations1({ stockCode, onScoreCalculated }) {
    const [rsiData, setRSIData] = useState([]);
    const [score, setScore] = useState(null);

    const getRSIStateScore = (currentRSI) => {
        if (currentRSI > 70) {
            return 7;
        } else if (currentRSI < 30) {
            return 3;
        } else {
            return 5;
        }
    };

    const getMACrossoverScore = (currentRSI_MACrossover) => {
        if (currentRSI_MACrossover === 1) {
            return 3;
        } else if (currentRSI_MACrossover === -1) {
            return 7;
        } else {
            return 5;
        }
    };

    const getPriceRSITrendScore = (priceTrendDirection, rsiTrendDirection) => {
        if (priceTrendDirection === '상승' && rsiTrendDirection === '상승') {
            return 3;
        } else if (priceTrendDirection === '하락' && rsiTrendDirection === '하락') {
            return 7;
        } else if (priceTrendDirection === '상승' && rsiTrendDirection === '하락') {
            return 6;
        } else if (priceTrendDirection === '하락' && rsiTrendDirection === '상승') {
            return 4
        } else {
            return 5;
        }
    };

    const calculateOverallScore = (currentRSI, currentRSI_MACrossover,
                                   priceTrendDirection, rsiTrendDirection) => {
        const rsiStateScore = getRSIStateScore(currentRSI);
        const macrossoverScore = getMACrossoverScore(currentRSI_MACrossover);
        const trendScore = getPriceRSITrendScore(priceTrendDirection, rsiTrendDirection)

        const elementScores = [rsiStateScore, macrossoverScore, trendScore];
        const weights = [1, 2, 3];
        const weightedScores = elementScores.map((score, index) => score * weights[index]);
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        const overallScore = weightedScores.reduce((a, b) => a + b, 0) / totalWeight;
        const finalScore = overallScore.toFixed(2);

        return finalScore;
    };

    const CalculatedRSITrend = (rsiData, period = 14) => {
        const lastIndex = rsiData.length - 1;
        if (lastIndex < period) return "데이터가 충분하지 않습니다."

        const currentRSI = rsiData[lastIndex]?.RSI;
        const prevRSI = rsiData[lastIndex - 1]?.RSI;

        const rsiTrendData = rsiData.slice(lastIndex - period + 1, prevRSI + 1).map(data => data.RSI);
        const totalChange = rsiTrendData[rsiTrendData.length - 1] - rsiTrendData[0];
        const rsiTrendDirection = totalChange > 0 ? '상승' : '하락'

        const priceTrend = rsiData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.close);
        const priceChange = priceTrend[priceTrend.length - 1] - priceTrend[0];
        const priceTrendDirection = priceChange > 0 ? '상승' : '하락';

        const currentRSI_MACrossover = rsiData[lastIndex]?.RSI_MA_Crossover;
        const overallScore = calculateOverallScore(currentRSI, currentRSI_MACrossover, priceTrendDirection, rsiTrendDirection);

        return {overallScore, currentRSI}
    };

    useEffect(() => {
        if (rsiData.length > 0) {
            const result = CalculatedRSITrend(rsiData)
            if (result !== null && onScoreCalculated) {
                onScoreCalculated(result);
            }
        }
    }, [rsiData]);

    return (
        <div>
            <FetchRSIData stockCode={stockCode} onRSIFetch={setRSIData}/>
        </div>
    );
}

export default RSICalculations1