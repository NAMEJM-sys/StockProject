import React, { useState, useEffect } from 'react';
import FetchKeltnerData from '../ComponentsFetch/FetchStockOrignal/FetchKeltnerData';

function KeltnerAnalysis3({ stockCode }) {
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

    const analyzeBreakOutStrategy = (keltnerData, period = 14) => {
        const angle = calculateChannelAngle(keltnerData, period);

        if (angle === null || keltnerData.length < period + 1) {
            return '데이터가 충분하지 않습니다.';
        }

        const lastIndex = keltnerData.length - 1;
        const currentData = keltnerData[lastIndex];
        const prevData = keltnerData[lastIndex - 1];

        const currentClose = currentData.close;
        const currentUpper = currentData.Upper_Band;
        const currentLower = currentData.Lower_Band;

        const prevClose = prevData.close;
        const prevUpper = prevData.Upper_Band;
        const prevLower = prevData.Lower_Band;

        let result = '<strong>Break Out 전략 분석</strong><br/><br/>';

        // Upper Band 상향 돌파 확인
        if (prevClose <= prevUpper && currentClose > currentUpper) {
            if (angle > 5) {
                result += '강한 매수 신호: 가격이 Upper Band를 상향 돌파하고 채널이 상승 중입니다.<br/>';
            } else {
                result += '가격이 Upper Band를 상향 돌파했지만 채널이 상승 추세가 아니므로 신중한 접근이 필요합니다.<br/>';
            }
        }
        // Lower Band 하향 돌파 확인
        else if (prevClose >= prevLower && currentClose < currentLower) {
            if (angle < -5) {
                result += '강한 매도 신호: 가격이 Lower Band를 하향 돌파하고 채널이 하락 중입니다.<br/>';
            } else {
                result += '가격이 Lower Band를 하향 돌파했지만 채널이 하락 추세가 아니므로 신중한 접근이 필요합니다.<br/>';
            }
        } else {
            result += '특별한 돌파 신호가 발생하지 않아 지속적인 분석이 필요합니다.<br/>';
        }

        // 사용자 친화적인 설명 추가
        result += '<br/>Break Out 전략은 가격이 채널을 돌파할 때 추세의 시작을 포착하는 전략입니다.<br/>';
        result += '채널의 기울기가 상승하면 가격이 상승 추세임을 나타냅니다.<br/>';
        result += '채널의 기울기가 하락하면 가격이 하락 추세임을 나타냅니다.<br/>';

        return result;
    };

    useEffect(() => {
        if (keltnerData.length > 0) {
            try {
                const result = analyzeBreakOutStrategy(keltnerData);
                setAnalysisResult(result);
            } catch (error) {
                console.error('Error in KeltnerAnalysis3:', error);
                setAnalysisResult('분석 중 오류가 발생했습니다.');
            }
        }
    }, [keltnerData]);

    return (
        <div>
            <FetchKeltnerData stockCode={stockCode} onKelFetch={setKeltnerData}/>
            <div className="tooltip">
                <h4>Keltner Channel Break Out 전략 분석</h4>
                <span className="tooltiptext">
                   Break Out 전략은 가격이 채널을 돌파할 때 추세의 시작을 포착하는 전략입니다.<br/>
                </span>
            </div>
            <p dangerouslySetInnerHTML={{__html: analysisResult}}></p>
        </div>
    );
}

export default KeltnerAnalysis3;