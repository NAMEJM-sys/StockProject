import React, { useState, useEffect } from 'react';
import FetchADXData from '../ComponentsFetch/FetchStockOrignal/FetchADXData';

function ADXAnalysis1({ stockCode }) {
    const [adxData, setADXData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    // 지수 이동 평균(EMA) 계산 함수
    const calculateEMA = (values, period) => {
        const k = 2 / (period + 1);
        return values.reduce((prev, curr, index) => {
            if (index === 0) return curr;
            return curr * k + prev * (1 - k);
        });
    };

    const analyzeTrendStrength = (adxData, period = 14) => {
        if (adxData.length < period) {
            return '데이터가 충분하지 않습니다.';
        }

        const adxValues = adxData.map(data => data.ADX);
        const recentADX = adxValues.slice(-period);

        // 최근 period 기간의 ADX 지수 이동 평균 계산
        const avgADX = calculateEMA(recentADX, period);

        let result = '<strong>추세 강도 분석</strong><br/><br/>';
        result += 'ADX는 추세의 강도를 나타내는 지표로, 값이 높을수록 강한 추세를 의미합니다.<br/><br/>';
        result += `최근 ${period}일간 ADX의 지수 이동 평균 값은 <strong>${avgADX.toFixed(2)}</strong>입니다.<br/>`;

        if (avgADX >= 25) {
            result += '→ 이는 <strong>강한 추세</strong>가 진행 중임을 나타냅니다.<br/>';
        } else if (avgADX <= 20) {
            result += '→ 이는 <strong>약한 추세</strong> 또는 <strong>횡보장</strong>임을 나타냅니다.<br/>';
        } else {
            result += '→ 이는 추세가 약하며, 추세 전환의 가능성이 있습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (adxData.length > 0) {
            const result = analyzeTrendStrength(adxData);
            setAnalysisResult(result);
        }
    }, [adxData]);

    return (
        <div>
            <FetchADXData stockCode={stockCode} onADXFetch={setADXData} />
            <h4>ADX 추세 강도 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default ADXAnalysis1;