import React, { useState, useEffect } from 'react';
import FetchRSIData from '../ComponentsFetch/FetchStockOrignal/FetchRSIData';

function RSIAnalysis1({ stockCode, onScoreCalculated }) {
    const [rsiData, setRSIData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeRSITrend = (rsiData, period = 14) => {
        const lastIndex = rsiData.length - 1;
        if (lastIndex < period) return { analysisResult: '데이터가 충분하지 않습니다.', score: null };

        const currentRSI = rsiData[lastIndex]?.RSI;
        const prevRSI = rsiData[lastIndex - 1]?.RSI;

        const rsiTrendData = rsiData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.RSI);
        const totalChange = rsiTrendData[rsiTrendData.length - 1] - rsiTrendData[0];
        const rsiTrendDirection = totalChange > 0 ? '상승' : '하락';

        const priceTrend = rsiData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.close);
        const priceChange = priceTrend[priceTrend.length - 1] - priceTrend[0];
        const priceTrendDirection = priceChange > 0 ? '상승' : '하락';

        const currentRSI_MACrossover = rsiData[lastIndex]?.RSI_MA_Crossover;

        if (currentRSI === undefined || prevRSI === undefined) {
            return { analysisResult: '데이터가 충분하지 않습니다.', score: null };
        }

        // RSI 과매수/과매도 상태 판단
        let rsiState = '';
        if (currentRSI > 70) {
            rsiState = '과매수 상태';
        } else if (currentRSI < 30) {
            rsiState = '과매도 상태';
        } else {
            rsiState = '중립 상태';
        }

        const rsiChange = currentRSI - prevRSI;
        const rsiTrend = rsiChange > 0 ? '상승' : '하락';

        let result = '';
        result += `<strong>현재 RSI:</strong> ${currentRSI.toFixed(2)} (${rsiState})<br/>`;
        result += `ㆍ 가격 흐름: ${priceTrendDirection} 추세<br/>`;
        result += `ㆍ RSI 흐름: ${rsiTrendDirection} 추세<br/>`;
        result += `ㆍ RSI 이동평균 교차 신호: ${currentRSI_MACrossover === 1 ? '골든 크로스' : '데드 크로스'}<br/><br/>`;

        if (currentRSI_MACrossover === 1) {
            result += `RSI 단기 이동평균이 장기 이동평균을 상향 돌파했습니다 (골든 크로스). 상승 추세 가능성이 있습니다.<br/><br/>`;
        } else if (currentRSI_MACrossover === -1) {
            result += `RSI 단기 이동평균이 장기 이동평균을 하향 돌파했습니다 (데드 크로스). 하락 추세 가능성이 있습니다.<br/><br/>`;
        } else {
            result += `RSI 이동평균에 특별한 교차 신호가 없습니다.<br/><br/>`;
        }

        if (rsiTrendDirection  === '상승' && priceTrendDirection === '상승') {
            result += `RSI와 가격 모두 상승세를 보이고 있습니다. 강한 상승 추세일 가능성이 큽니다.<br/>`;
        } else if (rsiTrendDirection  === '하락' && priceTrendDirection === '하락') {
            result += `RSI와 가격 모두 하락세를 보이고 있습니다. 하락 추세가 강화될 가능성이 있습니다.<br/>`;
        } else if (rsiTrendDirection  === '상승' && priceTrendDirection === '하락') {
            result += `가격은 하락 중이나 RSI는 상승세를 보이고 있습니다. 이는 가격 반등 가능성을 시사할 수 있습니다.<br/>`;
        } else if (rsiTrendDirection  === '하락' && priceTrendDirection === '상승') {
            result += `가격은 상승 중이나 RSI는 하락세를 보이고 있습니다. 이는 상승 추세가 약화될 수 있음을 나타냅니다.<br/>`;
        }

        return { analysisResult: result };
    };

    useEffect(() => {
        if (rsiData.length > 0) {
            const { analysisResult: result } = analyzeRSITrend(rsiData);
            setAnalysisResult(result);
        }
    }, [rsiData]);

    return (
        <div>
            <FetchRSIData stockCode={stockCode} onRSIFetch={setRSIData} />
            <h4>RSI 흐름 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default RSIAnalysis1;