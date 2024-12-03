import React, { useState, useEffect } from 'react';
import FetchRSIData from '../ComponentsFetch/FetchStockOrignal/FetchRSIData';

function RSIAnalysis3({ stockCode }) {
    const [rsiData, setRSIData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeRSIVolatility = (rsiData, period = 14) => {
        const lastIndex = rsiData.length - 1;
        if (lastIndex < period) return '데이터가 충분하지 않습니다.';

        const currentData = rsiData[lastIndex];

        const currentVolatility = currentData?.RSI_Volatility;
        if (currentVolatility === undefined) {
            return 'RSI 변동성 데이터를 불러오는 데 문제가 발생했습니다.';
        }

        const volatilityValues = rsiData.slice(lastIndex - period + 1, lastIndex + 1).map((data) => data.RSI_Volatility);
        const avgVolatility = volatilityValues.reduce((sum, value) => sum + value, 0) / period;

        const isHighVolatility = currentVolatility > avgVolatility;

        let result = '';

        if (isHighVolatility) {
            result += `현재 RSI 변동성이 평균(${avgVolatility.toFixed(2)})보다 높습니다 (${currentVolatility.toFixed(2)}). 이는 시장 변동성이 증가했음을 의미합니다.<br/><br/>`;
        } else {
            result += `현재 RSI 변동성이 평균(${avgVolatility.toFixed(2)})보다 낮습니다 (${currentVolatility.toFixed(2)}). 시장이 안정적입니다.<br/><br/>`;
        }

        const currentZScore = currentData?.RSI_Z_Score;
        if (currentZScore === undefined) {
            return 'RSI Z-스코어 데이터를 불러오는 데 문제가 발생했습니다.';
        }

        if (Math.abs(currentZScore) > 2) {
            result += `RSI Z-스코어가 ${currentZScore.toFixed(2)}로 2를 초과합니다. 이는 이상치가 발생했을 수 있으며, 잠재적인 추세 전환 신호일 수 있습니다.<br/><br/>`;
        } else {
            result += `RSI Z-스코어가 ${currentZScore.toFixed(2)}로 정상 범위 내에 있습니다.<br/><br/>`;
        }

        if (isHighVolatility && Math.abs(currentZScore) <= 2) {
            result += `시장 변동성이 높아져서 <strong>가격 변화 가능성이 높아졌지만</strong>, Z-스코어가 정상 범위 내에 있어 <strong>극단적인 변동성이나 추세 전환은 발생하지 않았습니다</strong>.<br><br> 
                       현재 시장은 활성화된 상태에서 <strong>기존 추세가 지속될 가능성이 큽니다</strong>.<br/>`;
        } else if (!isHighVolatility && Math.abs(currentZScore) <= 2) {
            result += `현재 시장은 변동성이 낮고 Z-스코어도 정상 범위 내에 있어 <strong>안정적인 상태</strong>입니다. <br><br>큰 가격 변동이나 추세 전환이 나타날 가능성은 적습니다.<br/>`;
        } else if (isHighVolatility && Math.abs(currentZScore) > 2) {
            result += `변동성이 높고 Z-스코어가 2를 초과하므로 **가격의 급격한 변화나 추세 전환이 발생할 가능성**이 있습니다. 주의가 필요합니다.<br/>`;
        }

        return result;
    };

    useEffect(() => {
        if (rsiData.length > 0) {
            const result = analyzeRSIVolatility(rsiData);
            setAnalysisResult(result);
        }
    }, [rsiData]);

    return (
        <div>
            <FetchRSIData stockCode={stockCode} onRSIFetch={setRSIData} />
            <h4>RSI 변동성 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default RSIAnalysis3;