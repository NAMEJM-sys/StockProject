import React, { useState, useEffect } from 'react';
import FetchMACDData from '../ComponentsFetch/FetchStockOrignal/FetchMACDData';

function MACDAnalysis4({ stockCode }) {
    const [macdData, setMACDData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeMultiTimeframeMACD = (macdData) => {
        if (macdData.length === 0) {
            return '데이터가 충분하지 않습니다.';
        }

        const lastIndex = macdData.length - 1;
        const currentData = macdData[lastIndex];

        // 데이터 검증 추가
        if (
            currentData['MACD_12_26_9'] === undefined ||
            currentData['Signal_12_26_9'] === undefined ||
            currentData['MACD_50_100_9'] === undefined ||
            currentData['Signal_50_100_9'] === undefined
        ) {
            return '다중 기간 MACD 데이터가 부족합니다.';
        }

        // 단기 MACD 설정 (12,26,9)
        const shortMACD = currentData['MACD_12_26_9'];
        const shortSignal = currentData['Signal_12_26_9'];

        // 장기 MACD 설정 (50,100,9)
        const longMACD = currentData['MACD_50_100_9'];
        const longSignal = currentData['Signal_50_100_9'];

        let result = '<strong>장기 추세 분석 (다중 기간 MACD 기반)</strong><br/>';

        // 단기 MACD 분석
        if (shortMACD > shortSignal) {
            result += '단기 MACD (12, 26, 9): 상승 추세.<br/>';
        } else {
            result += '단기 MACD (12, 26, 9): 하락 추세.<br/>';
        }

        // 장기 MACD 분석
        if (longMACD > longSignal) {
            result += '장기 MACD (50, 100, 9): 상승 추세.<br/><br/>';
        } else {
            result += '장기 MACD (50, 100, 9): 하락 추세.<br/><br/>';
        }

        // 추세 일치 여부 확인
        if (shortMACD > shortSignal) {
            if (longMACD > longSignal) {
                result += '단기 및 장기 모두 상승 추세에 있습니다. 이는 강한 **장기 모멘텀 상승**을 의미합니다.<br/>';
            } else {
                result += '단기 상승 추세이지만 장기적으로는 하락 추세입니다. 이는 **단기 반등**일 수 있으며, 신중한 접근이 필요합니다.<br/>';
            }
        } else {
            if (longMACD > longSignal) {
                result += '단기 하락 추세이지만 장기적으로는 상승 추세입니다. 이는 **단기 조정 국면**일 수 있으며, 매수 기회를 모색할 수 있습니다.<br/>';
            } else {
                result += '단기 및 장기 모두 하락 추세에 있습니다. 이는 강한 **장기 모멘텀 하락**을 의미합니다.<br/>';
            }
        }

        return result;
    };

    useEffect(() => {
        if (macdData.length > 0) {
            const result = analyzeMultiTimeframeMACD(macdData);
            setAnalysisResult(result);
        }
    }, [macdData]);

    return (
        <div>
            <FetchMACDData stockCode={stockCode} onMACDFetch={setMACDData} />
            <h4>다중 기간 MACD 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default MACDAnalysis4;