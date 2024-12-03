import React, { useState, useEffect } from 'react';
import FetchSARData from '../ComponentsFetch/FetchStockOrignal/FetchParabolicSARData';
import FetchStockDataForCode from '../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode';

function SARAnalysis4({ stockCode }) {
    const [sarData, setSARData] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeCombinedIndicators = (sarData, stockData, period = 14) => {
        if (sarData.length < period || stockData.length < period) {
            return '데이터가 충분하지 않습니다.';
        }

        let result = '<strong>거짓 신호 필터링 및 종합 분석</strong><br/><br/>';

        // 지수 이동 평균(EMA) 계산
        const closingPrices = stockData.map((data) => data.close);
        const recentPrices = closingPrices.slice(-period);

        // EMA 계산
        const calculateEMA = (prices, period) => {
            const k = 2 / (period + 1);
            let emaArray = [];
            let ema = prices[0];
            emaArray.push(ema);
            for (let i = 1; i < prices.length; i++) {
                ema = prices[i] * k + ema * (1 - k);
                emaArray.push(ema);
            }
            return emaArray;
        };

        const emaArray = calculateEMA(recentPrices, period);
        const currentEMA = emaArray[emaArray.length - 1];

        // 현재 가격과 EMA 비교
        const currentPrice = closingPrices[closingPrices.length - 1];

        // EMA의 추세 판단
        const prevEMA = emaArray[emaArray.length - 2];
        const prevPrice = closingPrices[closingPrices.length - 2];

        let priceTrend = '';
        if (currentPrice > currentEMA && prevPrice <= prevEMA) {
            priceTrend = '상승 추세로 전환';
            result += '최근 가격이 EMA를 상향 돌파하여 상승 추세로 전환되었습니다.<br/>';
        } else if (currentPrice < currentEMA && prevPrice >= prevEMA) {
            priceTrend = '하락 추세로 전환';
            result += '최근 가격이 EMA를 하향 돌파하여 하락 추세로 전환되었습니다.<br/>';
        } else if (currentPrice > currentEMA) {
            priceTrend = '상승 추세';
            result += '현재 가격이 EMA보다 위에 있어 상승 추세입니다.<br/>';
        } else if (currentPrice < currentEMA) {
            priceTrend = '하락 추세';
            result += '현재 가격이 EMA보다 아래에 있어 하락 추세입니다.<br/>';
        } else {
            priceTrend = '추세 불명확';
            result += '현재 가격이 EMA와 동일하여 추세 판단이 어렵습니다.<br/>';
        }

        // Parabolic SAR과의 결합 분석
        const currentSAR = sarData[sarData.length - 1].Parabolic_SAR;

        if (currentPrice > currentSAR && currentPrice > currentEMA) {
            result += '→ Parabolic SAR과 EMA 모두 상승 추세를 지지하므로 신뢰도가 높습니다.<br/>';
        } else if (currentPrice < currentSAR && currentPrice < currentEMA) {
            result += '→ Parabolic SAR과 EMA 모두 하락 추세를 지지하므로 신뢰도가 높습니다.<br/>';
        } else {
            result += '→ Parabolic SAR과 EMA의 신호가 일치하지 않아 신중한 접근이 필요합니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (sarData.length > 0 && stockData.length > 0) {
            const result = analyzeCombinedIndicators(sarData, stockData);
            setAnalysisResult(result);
        }
    }, [sarData, stockData]);

    return (
        <div>
            <FetchSARData stockCode={stockCode} onSARFetch={setSARData} />
            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
            <h4>Parabolic SAR 종합 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default SARAnalysis4;