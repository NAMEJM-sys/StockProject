import React, { useEffect, useState } from "react";
import FetchRSIData from '../ComponentsFetch/FetchStockOrignal/FetchRSIData';

function RSICalculations4({ stockCode, onScoreCalculated }) {
    const [rsiData, setRSIData] = useState([]);
    const [score, setScore] = useState(null);

    const calculatePeriodScores = (rsiData) => {
        const calculateAveragesAndTrends = (data, period) => {
            if (data.length >= period) {
                const recentData = data.slice(-period);
                const avg = recentData.reduce((acc, val) => acc + val.RSI, 0) / period;
                const trend = recentData[recentData.length - 1].RSI - recentData[0].RSI;
                return { avg, trend };
            }
            return { avg: null, trend: null };
        };

        const periods = [7, 14, 30];
        let calculatedScore = 5; // 기본 보통

        for (let period of periods) {
            const { avg, trend } = calculateAveragesAndTrends(rsiData, period);
            if (avg === null || trend === null) continue;

            if (trend > 5 && avg > 50) {
                if (period === 7) {
                    calculatedScore = 1; // 강력한 매수 신호
                    break;
                } else if (period === 14) {
                    calculatedScore = 3; // 매수 신호
                }
            } else if (trend < -5 && avg < 50) {
                if (period === 7) {
                    calculatedScore = 10; // 강력한 매도 신호
                    break;
                } else if (period === 14) {
                    calculatedScore = 7; // 매도 신호
                }
            }
        }

        setScore(calculatedScore);

        if (onScoreCalculated && calculatedScore !== null) {
            onScoreCalculated(calculatedScore);
        }
    };

    useEffect(() => {
        if (rsiData && rsiData.length > 0) {
            calculatePeriodScores(rsiData);
        }
    }, [rsiData]);

    return (
        <div>
            <FetchRSIData stockCode={stockCode} onRSIFetch={setRSIData} />
        </div>
    );
}

export default RSICalculations4;