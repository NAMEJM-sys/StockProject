import React, { useState, useEffect } from 'react';
import FetchKeltnerData from '../ComponentsFetch/FetchStockOrignal/FetchKeltnerData';
import '../styles/Tooltip.css'

function KeltnerAnalysis2({ stockCode }) {
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

    const analyzeTrendPullback = (keltnerData, threshold = 0.01, period = 14) => {
        const angle = calculateChannelAngle(keltnerData, period);

        if (angle === null) {
            return '데이터가 충분하지 않습니다.';
        }

        let result = '<strong>Trend Pullback 전략 분석</strong><br/><br/>';

        const currentData = keltnerData[keltnerData.length - 1];
        const currentClose = currentData.close;
        const middleLine = currentData.Middle_Line;
        const upperBand = currentData.Upper_Band;
        const lowerBand = currentData.Lower_Band;

        // 가격이 Middle Line 근처에 있는지 확인 (오차 범위 내)
        const isNearMiddleLine = Math.abs(currentClose - middleLine) / middleLine < threshold;

        // 현재 추세 판단
        if (angle > 5) {
            result += '채널이 상승하고 있어 <strong>상승 추세</strong>입니다.<br/>';

            if (isNearMiddleLine) {
                result += '→ 상승 추세에서 가격이 Middle Line 부근에 있으므로 <strong>매수 기회</strong>를 고려해볼 수 있습니다.<br/>';
            } else if (currentClose >= upperBand) {
                result += '→ 가격이 Upper Band 부근에 있으므로 <strong>이익 실현</strong> 또는 <strong>매도 기회</strong>를 고려해볼 수 있습니다.<br/>';
            }
        } else if (angle < -5) {
            result += '채널이 하락하고 있어 <strong>하락 추세</strong>입니다.<br/>';

            if (isNearMiddleLine) {
                result += '→ 하락 추세에서 가격이 Middle Line 부근에 있으므로 <strong>매도 기회</strong>를 고려해볼 수 있습니다.<br/>';
            } else if (currentClose <= lowerBand) {
                result += '→ 가격이 Lower Band 부근에 있으므로 <strong>추가 하락 가능성</strong>이 있어 <strong>신중한 접근</strong>이 필요합니다.<br/>';
            }
        } else {
            result += '채널이 횡보하고 있어 추세가 뚜렷하지 않습니다.<br/>';

            if (isNearMiddleLine) {
                result += '→ 횡보장세에서 가격이 Middle Line 부근에 있으므로 변동성이 낮을 수 있습니다.<br/>';
            }
        }

        return result;
    };

    useEffect(() => {
        if (keltnerData.length > 0) {
            try {
                const result = analyzeTrendPullback(keltnerData);
                setAnalysisResult(result);
            } catch (error) {
                console.error('Error in KeltnerAnalysis2:', error);
                setAnalysisResult('분석 중 오류가 발생했습니다.');
            }
        }
    }, [keltnerData]);

    return (
        <div>
            <FetchKeltnerData stockCode={stockCode} onKelFetch={setKeltnerData}/>

            <div className="tooltip">
                <h4>Keltner Channel Trend Pullback 전략 분석</h4>
                <span className="tooltiptext">
                    Trend Pullback 전략은 추세를 따라가는 전략으로, 추세 방향으로의 가격 조정을 활용합니다.<br/>
                </span>

            </div>
            <p dangerouslySetInnerHTML={{__html: analysisResult}}></p>
        </div>
    );
}

export default KeltnerAnalysis2;