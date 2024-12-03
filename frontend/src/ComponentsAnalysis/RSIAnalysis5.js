import React, { useState, useEffect } from 'react';
import FetchRSIFibonacciData from '../ComponentsFetch/FetchStockOrignal/FetchRSIData';

function RSIAnalysis5({ stockCode }) {
    const [rsiData, setRSIData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeRSIFibonacci = () => {
        if (rsiData.length === 0) {
            setAnalysisResult('데이터가 충분하지 않습니다.');
            return;
        }

        const lastIndex = rsiData.length - 1;
        const currentRSI = rsiData[lastIndex].RSI;

        const fibLevels = [
            { level: 'Fib_23.6', value: rsiData[lastIndex]['Fib_23.6'], description: '약한 반등 가능성' },
            { level: 'Fib_38.2', value: rsiData[lastIndex]['Fib_38.2'], description: '조정이 일어날 수 있는 중요한 지점' },
            { level: 'Fib_50', value: rsiData[lastIndex]['Fib_50'], description: '강력한 지지 또는 저항이 될 수 있음' },
            { level: 'Fib_61.8', value: rsiData[lastIndex]['Fib_61.8'], description: '주요 반전 지점으로 인식됨' },
            { level: 'Fib_78.6', value: rsiData[lastIndex]['Fib_78.6'], description: '심한 조정이 끝나고 반전이 일어날 가능성이 큼' }
        ];

        let result = `<strong>현재 RSI:</strong> ${currentRSI.toFixed(2)}<br/>`;

        // 현재 RSI가 어떤 피보나치 레벨에 근접한지 확인
        for (let i = 0; i < fibLevels.length; i++) {
            const level = fibLevels[i];
            if (currentRSI >= level.value) {
                result += `RSI Fibonacci가 ${level.level}% 레벨 (${level.value.toFixed(2)}) 이상입니다.<br/><br/>`;
                result += `<strong>해석: </strong> ${level.description}<br><br>`
                break;
            }
        }

        if (currentRSI < fibLevels[0].value) {
            result += 'RSI가 피보나치 23.6% 아래로 떨어졌습니다. 이는 약세 신호일 수 있습니다.<br/>';
        } else if (currentRSI > fibLevels[4].value) {
            result += 'RSI가 피보나치 78.6% 이상입니다. 이는 강력한 반전이 일어날 가능성을 시사합니다.<br/>';
        }

        setAnalysisResult(result);
    };

    useEffect(() => {
        if (rsiData.length > 0) {
            analyzeRSIFibonacci();
        }
    }, [rsiData]);

    return (
        <div>
            <FetchRSIFibonacciData stockCode={stockCode} onRSIFetch={setRSIData} />
            <h4>RSI 피보나치 되돌림 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default RSIAnalysis5;