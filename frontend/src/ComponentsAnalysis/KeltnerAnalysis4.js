import React, { useState, useEffect } from 'react';
import FetchKeltnerData from '../ComponentsFetch/FetchStockOrignal/FetchKeltnerData';

function KeltnerAnalysis4({ stockCode }) {
    const [keltnerData, setKeltnerData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeOverboughtOversold = (keltnerData, period = 14) => {
        if (keltnerData.length < period) {
            return '데이터가 충분하지 않습니다.';
        }

        // 채널의 기울기 계산
        const recentData = keltnerData.slice(-period);
        const middleLineValues = recentData.map(data => data.Middle_Line);

        const indices = [...Array(period).keys()];
        const n = period;
        const sumX = indices.reduce((a, b) => a + b, 0);
        const sumY = middleLineValues.reduce((a, b) => a + b, 0);
        const sumXY = indices.reduce((sum, x, i) => sum + x * middleLineValues[i], 0);
        const sumX2 = indices.reduce((sum, x) => sum + x * x, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const angle = Math.atan(slope) * (180 / Math.PI); // 기울기를 각도로 변환

        const lastIndex = keltnerData.length - 1;
        const currentData = keltnerData[lastIndex];

        const currentClose = currentData.close;
        const upperBand = currentData.Upper_Band;
        const lowerBand = currentData.Lower_Band;
        const middleLine = currentData.Middle_Line;

        let result = '<strong>과매수/과매도 상태 분석 및 반전 가능성 평가</strong><br/><br/>';

        if (currentClose > upperBand) {
            if (angle <= 5) {
                result += '가격이 Upper Band 위에 있고 채널이 횡보 중이므로 <strong>반전 가능성</strong>이 높습니다.<br/>';
                result += '→ 매도 기회를 고려해볼 수 있습니다.<br/>';
            } else if (angle < -5) {
                result += '가격이 Upper Band 위에 있지만 채널이 하락 중이므로 <strong>반전 가능성</strong>이 매우 높습니다.<br/>';
                result += '→ 매도 신호로 해석할 수 있습니다.<br/>';
            } else {
                result += '가격이 Upper Band 위에 있고 채널이 상승 중이므로 상승 모멘텀이 지속될 수 있습니다.<br/>';
                result += '→ 추세를 따라가는 매매 전략을 고려해볼 수 있습니다.<br/>';
            }
        } else if (currentClose < lowerBand) {
            if (angle >= -5) {
                result += '가격이 Lower Band 아래에 있고 채널이 횡보 중이므로 <strong>반등 가능성</strong>이 높습니다.<br/>';
                result += '→ 매수 기회를 고려해볼 수 있습니다.<br/>';
            } else if (angle > 5) {
                result += '가격이 Lower Band 아래에 있지만 채널이 상승 중이므로 <strong>반등 가능성</strong>이 매우 높습니다.<br/>';
                result += '→ 매수 신호로 해석할 수 있습니다.<br/>';
            } else {
                result += '가격이 Lower Band 아래에 있고 채널이 하락 중이므로 하락 모멘텀이 지속될 수 있습니다.<br/>';
                result += '→ 신중한 접근이 필요합니다.<br/>';
            }
        } else {
            result += '가격이 Keltner Channel 내에 있어 과매수/과매도 상태가 아닙니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (keltnerData.length > 0) {
            const result = analyzeOverboughtOversold(keltnerData);
            setAnalysisResult(result);
        }
    }, [keltnerData]);

    return (
        <div>
            <FetchKeltnerData stockCode={stockCode} onKelFetch={setKeltnerData} />
            <h4>Keltner Channel 과매수/과매도 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default KeltnerAnalysis4;