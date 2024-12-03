import React, { useState, useEffect } from 'react';
import FetchMACDData from '../ComponentsFetch/FetchStockOrignal/FetchMACDData';

function MACDAnalysis5({ stockCode }) {
    const [macdData, setMACDData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeMACDTrendStrength = (macdData, period = 5) => {
        if (macdData.length < period + 1) {
            return '데이터가 충분하지 않습니다.';
        }

        // MACD 변화량 직접 계산
        const recentData = macdData.slice(-period - 1);
        const macdChanges = [];

        for (let i = 1; i < recentData.length; i++) {
            macdChanges.push(Math.abs(recentData[i].MACD_Line - recentData[i - 1].MACD_Line));
        }

        const avgMACDChange = macdChanges.slice(0, -1).reduce((a, b) => a + b, 0) / (period - 1);

        // 최근 MACD 변화량 계산
        const currentMACDChange = macdChanges[macdChanges.length - 1];

        let result = '<strong>추세의 힘 분석 (MACD 변화량 기반)</strong><br/>';

        if (currentMACDChange > avgMACDChange) {
            result += `현재 MACD 변화량이 최근 평균보다 큽니다 (${currentMACDChange.toFixed(4)} > ${avgMACDChange.toFixed(4)}).<br/>`;
            result += '이는 추세의 힘이 강해지고 있음을 나타냅니다.<br/>';
        } else {
            result += `현재 MACD 변화량이 최근 평균보다 작습니다 (${currentMACDChange.toFixed(4)} ≤ ${avgMACDChange.toFixed(4)}).<br/>`;
            result += '이는 추세의 힘이 약해지고 있음을 나타냅니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (macdData.length > 0) {
            const result = analyzeMACDTrendStrength(macdData);
            setAnalysisResult(result);
        }
    }, [macdData]);

    return (
        <div>
            <FetchMACDData stockCode={stockCode} onMACDFetch={setMACDData} />
            <h4>MACD 추세의 힘 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default MACDAnalysis5;