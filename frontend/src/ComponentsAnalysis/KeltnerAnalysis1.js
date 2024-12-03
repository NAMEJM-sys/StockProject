import React, { useState, useEffect } from 'react';
import FetchKeltnerData from '../ComponentsFetch/FetchStockOrignal/FetchKeltnerData';
import "../styles/Tooltip.css"

function KeltnerAnalysis1({ stockCode }) {
    const [keltnerData, setKeltnerData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const calculateChannelAngle = (keltnerData, period = 14) => {
        if (keltnerData.length < period) {
            return null;
        }
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

        return angle;
    };

    const analyzeTrendWithSlope = (keltnerData, period = 14) => {
        const angle = calculateChannelAngle(keltnerData, period);

        if (angle === null) {
            return '데이터가 충분하지 않습니다.';
        }

        let result = '<strong>채널 기울기와 가격 위치를 통한 추세 분석</strong><br/><br/>';

        // 채널의 기울기에 따른 추세 판단
        if (angle > 5) {
            result += '채널이 상승하고 있어 <strong>상승 추세</strong>입니다.<br/><br/>';
        } else if (angle < -5) {
            result += '채널이 하락하고 있어 <strong>하락 추세</strong>입니다.<br/><br/>';
        } else {
            result += '채널이 횡보하고 있어 <strong>추세가 뚜렷하지 않습니다</strong>.<br/><br/>';
        }

        const currentData = keltnerData[keltnerData.length - 1];
        const currentClose = currentData.close;
        const upperBand = currentData.Upper_Band;
        const lowerBand = currentData.Lower_Band;
        const middleLine = currentData.Middle_Line;

        // 가격과 채널의 위치 관계 분석
        if (currentClose > upperBand) {
            result += '가격이 Upper Band 위에 있어 <strong>강한 상승 모멘텀</strong>이 있습니다.<br/><br/>';
        } else if (currentClose < lowerBand) {
            result += '가격이 Lower Band 아래에 있어 <strong>강한 하락 모멘텀</strong>이 있습니다.<br/><br/>';
            result += '→ 추가 하락 가능성이 있으므로 <strong>신중한 접근</strong>이 필요합니다.<br/>';
        } else if (currentClose > middleLine) {
            result += '가격이 Middle Line 위에 있어 <strong>상승 추세</strong>입니다.<br/><br/>';
        } else if (currentClose < middleLine) {
            result += '가격이 Middle Line 아래에 있어 <strong>하락 추세</strong>입니다.<br/><br/>';
        } else {
            result += '가격이 Middle Line과 동일하여 추세 판단이 어렵습니다.<br/>';
        }

        // 추가적인 가격 움직임 분석
        if (currentClose > upperBand && angle > 5) {
            result += '→ 상승 추세가 강하고, 가격이 Upper Band 위에 있으므로 <strong>추가 상승 가능성</strong>이 있습니다.<br/>';
        } else if (currentClose < lowerBand && angle < -5) {
            result += '→ 하락 추세가 강하고, 가격이 Lower Band 아래에 있으므로 <strong>추가 하락 가능성</strong>이 있습니다.<br/>';
        } else if (currentClose > upperBand && angle < -5) {
            result += '→ 가격이 Upper Band 위에 있지만 채널은 하락 중이므로 <strong>반전 가능성</strong>이 있습니다.<br/>';
        } else if (currentClose < lowerBand && angle > 5) {
            result += '→ 가격이 Lower Band 아래에 있지만 채널은 상승 중이므로 <strong>반전 가능성</strong>이 있습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (keltnerData.length > 0) {
            try {
                const result = analyzeTrendWithSlope(keltnerData);
                setAnalysisResult(result);
            } catch (error) {
                console.error('Error in KeltnerAnalysis1:', error);
                setAnalysisResult('분석 중 오류가 발생했습니다.');
            }
        }
    }, [keltnerData]);

    return (
        <div>
            <FetchKeltnerData stockCode={stockCode} onKelFetch={setKeltnerData} />

            <div className="tooltip">
                <h4>Keltner Channel 종합 추세 분석</h4>
                <span className="tooltiptext">
                    채널의 기울기가 상승하면 가격이 상승 추세임을 나타냅니다.<br/><br/>
                    채널의 기울기가 하락하면 가격이 하락 추세임을 나타냅니다.
                </span>
            </div>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default KeltnerAnalysis1;