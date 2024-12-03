import React, { useState, useEffect } from 'react';
import FetchIchimokuData from '../ComponentsFetch/FetchStockOrignal/FetchIchimokuData';

function IchimokuAnalysis4({ stockCode }) {
    const [ichimokuData, setIchimokuData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeCloudThicknessAndColor = (data) => {
        if (data.length < 52) {
            return '데이터가 충분하지 않습니다.';
        }

        const lastIndex = data.length - 26; // 구름대는 26일 앞에 표시됨
        const currentData = data[lastIndex];

        const senkouA = currentData.Senkou_Span_A;
        const senkouB = currentData.Senkou_Span_B;
        const cloudColor = currentData.Cloud_Colour;

        let result = '<strong>구름대의 두께와 색상 분석</strong><br/><br/>';

        // 구름대 두께 계산
        const cloudThickness = Math.abs(senkouA - senkouB);

        result += `현재 구름대의 두께는 <strong>${cloudThickness.toFixed(2)}</strong>입니다.<br/>`;

        if (cloudThickness > (currentData.close * 0.03)) { // 구름대 두께가 가격의 3% 이상인 경우
            result += '→ 구름대가 두꺼워 강한 지지 또는 저항을 나타냅니다.<br/>';
        } else {
            result += '→ 구름대가 얇아 지지 또는 저항이 약할 수 있습니다.<br/>';
        }

        // 구름대 색상 분석
        if (cloudColor === 'Bullish') {
            result += '구름대가 <strong>상승 구름</strong>으로 향후 상승 추세를 예상할 수 있습니다.<br/>';
        } else {
            result += '구름대가 <strong>하락 구름</strong>으로 향후 하락 추세를 예상할 수 있습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (ichimokuData.length > 0) {
            const result = analyzeCloudThicknessAndColor(ichimokuData);
            setAnalysisResult(result);
        }
    }, [ichimokuData]);

    return (
        <div>
            <FetchIchimokuData stockCode={stockCode} onIchimokuFetch={setIchimokuData} />
            <h4>Ichimoku Cloud 구름대 두께 및 색상 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default IchimokuAnalysis4;