import React, { useState, useEffect } from 'react';
import FetchMFIData from '../ComponentsFetch/FetchStockOrignal/FetchMFIData';

function MFICalculations4({ stockCode, onScoreCalculated }) {
    const [mfiData, setMFIData] = useState([]);

    const calculateFibonacciScore = () => {
        if (mfiData.length === 0) {
            if (onScoreCalculated) {
                onScoreCalculated(null);
            }
            return;
        }

        const lastIndex = mfiData.length - 1;
        const currentMFI = mfiData[lastIndex].MFI;

        const fibLevels = [
            { level: 'Fib_23.6', value: mfiData[lastIndex]['Fib_23.6'] },
            { level: 'Fib_38.2', value: mfiData[lastIndex]['Fib_38.2'] },
            { level: 'Fib_50', value: mfiData[lastIndex]['Fib_50'] },
            { level: 'Fib_61.8', value: mfiData[lastIndex]['Fib_61.8'] },
            { level: 'Fib_78.6', value: mfiData[lastIndex]['Fib_78.6'] },
        ];

        // 점수 부여
        let calculatedScore = 5; // 기본 보통

        if (currentMFI >= fibLevels[3].value) { // 61.8% 이상
            calculatedScore = 3; // 매수
        } else if (currentMFI <= fibLevels[1].value) { // 38.2% 이하
            calculatedScore = 7; // 매도
        } else {
            calculatedScore = 5; // 보통
        }

        if (onScoreCalculated) {
            onScoreCalculated(calculatedScore);
        }
    };

    useEffect(() => {
        if (mfiData.length > 0) {
            calculateFibonacciScore();
        }
    }, [mfiData]);

    return (
        <div>
            <FetchMFIData stockCode={stockCode} onMFIFetch={setMFIData} />
        </div>
    );
}

export default MFICalculations4;