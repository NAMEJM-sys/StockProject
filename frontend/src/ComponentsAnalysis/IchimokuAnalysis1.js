import React, { useState, useEffect } from 'react';
import FetchIchimokuData from '../ComponentsFetch/FetchStockOrignal/FetchIchimokuData';

function IchimokuAnalysis1({ stockCode }) {
    const [ichimokuData, setIchimokuData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeTenkanKijunCross = (data) => {
        if (data.length < 2) {
            return '데이터가 충분하지 않습니다.';
        }

        const lastIndex = data.length - 1;
        const prevData = data[lastIndex - 1];
        const currentData = data[lastIndex];

        const prevTenkan = prevData.Tenkan_sen;
        const prevKijun = prevData.Kijun_sen;
        const currentTenkan = currentData.Tenkan_sen;
        const currentKijun = currentData.Kijun_sen;

        let result = '<strong>전환선과 기준선의 교차 분석</strong><br/><br/>';

        // 골든 크로스 확인 (매수 신호)
        if (prevTenkan <= prevKijun && currentTenkan > currentKijun) {
            result += '매수 신호 발생: 전환선이 기준선을 상향 돌파했습니다.<br/>';
        }
        // 데드 크로스 확인 (매도 신호)
        else if (prevTenkan >= prevKijun && currentTenkan < currentKijun) {
            result += '매도 신호 발생: 전환선이 기준선을 하향 돌파했습니다.<br/>';
        } else {
            result += '전환선과 기준선 사이에 교차 신호가 없습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (ichimokuData.length > 0) {
            const result = analyzeTenkanKijunCross(ichimokuData);
            setAnalysisResult(result);
        }
    }, [ichimokuData]);

    return (
        <div>
            <FetchIchimokuData stockCode={stockCode} onIchimokuFetch={setIchimokuData} />
            <h4>Ichimoku Cloud 전환선과 기준선 교차 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default IchimokuAnalysis1;