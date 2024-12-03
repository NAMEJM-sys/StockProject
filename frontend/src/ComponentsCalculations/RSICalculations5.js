import React, { useState, useEffect } from 'react';
import FetchRSIData from '../ComponentsFetch/FetchStockOrignal/FetchRSIData';

function RSICalculations5({ stockCode, onScoreCalculated }) {
    const [rsiData, setRSIData] = useState([]);
    const [score, setScore] = useState(null);

    const calculateFibonacciScore = () => {
        if (rsiData.length === 0) {
            setScore(null);
            return;
        }

        const lastIndex = rsiData.length - 1;
        const currentRSI = rsiData[lastIndex].RSI;

        const fibLevels = [
            { level: 'Fib_23.6', value: rsiData[lastIndex]['Fib_23.6'] },
            { level: 'Fib_38.2', value: rsiData[lastIndex]['Fib_38.2'] },
            { level: 'Fib_50', value: rsiData[lastIndex]['Fib_50'] },
            { level: 'Fib_61.8', value: rsiData[lastIndex]['Fib_61.8'] },
            { level: 'Fib_78.6', value: rsiData[lastIndex]['Fib_78.6'] },
        ];

        // 점수 부여
        let calculatedScore = 5; // 기본 보통

        if (currentRSI >= fibLevels[3].value) { // 61.8% 이상
            calculatedScore = 3; // 매수
        } else if (currentRSI <= fibLevels[1].value) { // 38.2% 이하
            calculatedScore = 7; // 매도
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
            calculateFibonacciScore();
        }
    }, [rsiData]);

    return (
        <div>
            <FetchRSIData stockCode={stockCode} onRSIFetch={setRSIData} />
        </div>
    );
}

export default RSICalculations5;