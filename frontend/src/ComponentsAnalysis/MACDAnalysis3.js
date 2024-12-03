import React, { useState, useEffect } from 'react';
import FetchMACDData from '../ComponentsFetch/FetchStockOrignal/FetchMACDData';

function MACDAnalysis3({ stockCode }) {
    const [macdData, setMACDData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeMACDHistogram = (macdData) => {
        if (macdData.length < 5) {
            return '데이터가 충분하지 않습니다.';
        }

        const lastIndex = macdData.length - 1;
        const currentHistogram = macdData[lastIndex].Histogram;
        const prevHistogram = macdData[lastIndex - 1].Histogram;

        let result = '<strong>단기 모멘텀 분석 (Histogram 기반)</strong><br/>';

        // Histogram이 0선을 상향 또는 하향 돌파할 때
        if (prevHistogram < 0 && currentHistogram > 0) {
            result += '매수 모멘텀이 강화되고 있습니다. Histogram이 0선을 상향 돌파했습니다.<br/>';
        } else if (prevHistogram > 0 && currentHistogram < 0) {
            result += '매도 모멘텀이 강화되고 있습니다. Histogram이 0선을 하향 돌파했습니다.<br/>';
        } else {
            result += 'Histogram이 0선 근처에서 움직이고 있습니다.<br/>';
        }

        // Histogram의 증감 추세 분석
        if (currentHistogram > prevHistogram) {
            result += 'Histogram이 증가하고 있어 단기 모멘텀이 강화되는 추세입니다.<br/>';
        } else if (currentHistogram < prevHistogram) {
            result += 'Histogram이 감소하고 있어 단기 모멘텀이 약화되는 추세입니다.<br/>';
        }

        // Histogram의 연속적인 증감 추세 분석 추가
        let increasingCount = 0;
        let decreasingCount = 0;

        for (let i = lastIndex - 4; i < lastIndex; i++) {
            if (macdData[i + 1].Histogram > macdData[i].Histogram) {
                increasingCount++;
            } else if (macdData[i + 1].Histogram < macdData[i].Histogram) {
                decreasingCount++;
            }
        }

        if (increasingCount >= 3) {
            result += 'Histogram이 연속적으로 증가하여 단기 모멘텀 상승이 지속되고 있습니다.<br/>';
        } else if (decreasingCount >= 3) {
            result += 'Histogram이 연속적으로 감소하여 단기 모멘텀 하락이 지속되고 있습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (macdData.length > 0) {
            const result = analyzeMACDHistogram(macdData);
            setAnalysisResult(result);
        }
    }, [macdData]);

    return (
        <div>
            <FetchMACDData stockCode={stockCode} onMACDFetch={setMACDData} />
            <h4>MACD Histogram 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default MACDAnalysis3;