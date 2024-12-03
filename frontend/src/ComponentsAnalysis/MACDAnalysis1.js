import React, { useState, useEffect } from 'react';
import FetchMACDData from '../ComponentsFetch/FetchStockOrignal/FetchMACDData';

function MACDAnalysis1({ stockCode }) {
    const [macdData, setMACDData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeMACDCrossovers = (macdData, period = 14) => {
        if (macdData.length < period + 1) {
            return '데이터가 충분하지 않습니다.';
        }

        const lastIndex = macdData.length - 1;
        const currentMACD = macdData[lastIndex].MACD_Line;
        const currentSignal = macdData[lastIndex].Signal_Line;
        const prevMACD = macdData[lastIndex - 1].MACD_Line;
        const prevSignal = macdData[lastIndex - 1].Signal_Line;

        let result = `<strong>현재 MACD</strong><br/>`;
        result += `ㆍMACD: ${currentMACD.toFixed(2)}<br/>`;
        result += `ㆍSignal: ${currentSignal.toFixed(2)}<br/><br/>`;

        // 1. MACD Line과 Signal Line의 크로스 분석
        if (prevMACD < prevSignal && currentMACD > currentSignal) {
            result += '강한 매수 신호: MACD Line이 Signal Line을 아래에서 위로 교차했습니다 (골든 크로스).<br/>';
        } else if (prevMACD > prevSignal && currentMACD < currentSignal) {
            result += '강한 매도 신호: MACD Line이 Signal Line을 위에서 아래로 교차했습니다 (데드 크로스).<br/>';
        } else {
            result += '현재 MACD와 Signal Line 사이에 특별한 교차 신호가 없습니다.<br/><br/>';
        }

        // 2. MACD와 Signal의 크로스 예상 시점 계산 (선형 회귀 기반)
        const macdIndices = [];
        const macdValues = [];
        const signalValues = [];

        for (let i = lastIndex - period + 1; i <= lastIndex; i++) {
            macdIndices.push(i);
            macdValues.push(macdData[i].MACD_Line);
            signalValues.push(macdData[i].Signal_Line);
        }

        // 선형 회귀 계산
        const macdRegression = linearRegression(macdIndices, macdValues);
        const signalRegression = linearRegression(macdIndices, signalValues);

        // 두 선이 교차하는 시점 계산
        const a = macdRegression.slope - signalRegression.slope;
        const b = macdRegression.intercept - signalRegression.intercept;

        let daysToCrossover = null;

        if (a !== 0) {
            const t_crossover = -b / a;
            daysToCrossover = t_crossover - lastIndex;
            if (daysToCrossover >= 0 && daysToCrossover <= 3) {
                result += `현재 추세가 지속된다면 약 ${daysToCrossover.toFixed(1)}일 후에 MACD 크로스오버가 발생할 수 있습니다.<br/>`;
            } else if (daysToCrossover > 3) {
                result += `현재 추세가 지속된다면 약 ${daysToCrossover.toFixed(1)}일 후에 MACD 크로스오버가 발생할 것으로 예상됩니다.<br/>`;
            } else {
                result += '현재 추세로는 가까운 시일 내에 크로스오버가 발생할 것으로 예상되지 않습니다.<br/>';
            }
        } else {
            result += 'MACD와 Signal Line의 추세가 평행하여 크로스오버 시점을 예측할 수 없습니다.<br/>';
        }

        return result;
    };

    // 선형 회귀 함수 추가
    const linearRegression = (x, y) => {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
        const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        return { slope, intercept };
    };

    useEffect(() => {
        if (macdData.length > 0) {
            const result = analyzeMACDCrossovers(macdData);
            setAnalysisResult(result);
        }
    }, [macdData]);

    return (
        <div>
            <FetchMACDData stockCode={stockCode} onMACDFetch={setMACDData} />
            <h4>MACD 크로스오버 및 예상 시점 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default MACDAnalysis1;