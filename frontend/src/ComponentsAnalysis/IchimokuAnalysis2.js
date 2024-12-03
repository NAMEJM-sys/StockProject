import React, { useState, useEffect } from 'react';
import FetchIchimokuData from '../ComponentsFetch/FetchStockOrignal/FetchIchimokuData';

function IchimokuAnalysis2({ stockCode }) {
    const [ichimokuData, setIchimokuData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzePriceCloudRelation = (data) => {
        if (data.length < 26) {
            return '데이터가 충분하지 않습니다.';
        }

        const lastIndex = data.length - 1;
        const currentData = data[lastIndex];

        const currentClose = currentData.close;
        const senkouA = currentData.Senkou_Span_A;
        const senkouB = currentData.Senkou_Span_B;

        let result = '<strong>가격과 구름대의 관계 분석</strong><br/><br/>';

        // 구름대의 상하단 결정
        const upperCloud = Math.max(senkouA, senkouB);
        const lowerCloud = Math.min(senkouA, senkouB);

        if (currentClose > upperCloud) {
            result += '가격이 구름대 위에 있어 <strong>상승 추세</strong>입니다.<br/>';
        } else if (currentClose < lowerCloud) {
            result += '가격이 구름대 아래에 있어 <strong>하락 추세</strong>입니다.<br/>';
        } else {
            result += '가격이 구름대 내부에 있어 추세가 불확실합니다.<br/>';
        }

        // 구름대 돌파 여부 확인
        const prevData = data[lastIndex - 1];
        const prevClose = prevData.close;

        if (prevClose <= lowerCloud && currentClose > upperCloud) {
            result += '→ 가격이 구름대를 상향 돌파하여 강한 <strong>매수 신호</strong>입니다.<br/>';
        } else if (prevClose >= upperCloud && currentClose < lowerCloud) {
            result += '→ 가격이 구름대를 하향 돌파하여 강한 <strong>매도 신호</strong>입니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (ichimokuData.length > 0) {
            const result = analyzePriceCloudRelation(ichimokuData);
            setAnalysisResult(result);
        }
    }, [ichimokuData]);

    return (
        <div>
            <FetchIchimokuData stockCode={stockCode} onIchimokuFetch={setIchimokuData} />
            <h4>Ichimoku Cloud 가격과 구름대 관계 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default IchimokuAnalysis2;