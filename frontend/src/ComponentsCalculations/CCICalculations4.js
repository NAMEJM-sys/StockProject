import React, { useState, useEffect } from 'react';
import FetchCCIData from '../ComponentsFetch/FetchStockOrignal/FetchCCIData';

function CCICalculations4({ stockCode, onScoreCalculated }) {
    const [cciData, setCCIData] = useState([]);

    const calculateFibonacciScore = () => {
        if (cciData.length === 0) {
            if (onScoreCalculated) {
                onScoreCalculated(5); // 데이터 부족 시 보통 점수
            }
            return;
        }

        const lastIndex = cciData.length - 1;
        const currentCCI = cciData[lastIndex].CCI;

        const fibLevels = [
            { level: 'Fib_23.6', value: cciData[lastIndex]['Fib_23.6'] },
            { level: 'Fib_38.2', value: cciData[lastIndex]['Fib_38.2'] },
            { level: 'Fib_50', value: cciData[lastIndex]['Fib_50'] },
            { level: 'Fib_61.8', value: cciData[lastIndex]['Fib_61.8'] },
            { level: 'Fib_78.6', value: cciData[lastIndex]['Fib_78.6'] },
        ];

        // 점수 부여
        let score = 5; // 기본 보통

        if (currentCCI >= fibLevels[3].value) { // 61.8% 이상
            score = 3; // 매수
        } else if (currentCCI <= fibLevels[1].value) { // 38.2% 이하
            score = 7; // 매도
        } else {
            score = 5; // 보통
        }

        if (onScoreCalculated) {
            onScoreCalculated(score);
        }
    };

    useEffect(() => {
        if (cciData.length > 0) {
            calculateFibonacciScore();
        }
    }, [cciData]);

    return (
        <div>
            <FetchCCIData stockCode={stockCode} onCCIFetch={setCCIData} />
        </div>
    );
}

export default CCICalculations4;