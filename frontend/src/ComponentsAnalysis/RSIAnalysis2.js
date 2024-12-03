import React, { useState, useEffect } from 'react';
import FetchRSIData from '../ComponentsFetch/FetchStockOrignal/FetchRSIData';
import FetchStockDataForCode from '../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode';

const findSwingLows = (data, range, valueKey) => {
    let swingLows = [];
    for (let i = range; i < data.length - range; i++) {
        let isSwingLow = true;
        for (let j = 1; j <= range; j++) {
            if (data[i - j][valueKey] <= data[i][valueKey] || data[i + j][valueKey] <= data[i][valueKey]) {
                isSwingLow = false;
                break;
            }
        }
        if (isSwingLow) {
            swingLows.push({ value: data[i][valueKey], index: i, date: data[i].date });
        }
    }
    return swingLows;
};

const findSwingHighs = (data, range, valueKey) => {
    let swingHighs = [];
    for (let i = range; i < data.length - range; i++) {
        let isSwingHigh = true;
        for (let j = 1; j <= range; j++) {
            if (data[i - j][valueKey] >= data[i][valueKey] || data[i + j][valueKey] >= data[i][valueKey]) {
                isSwingHigh = false;
                break;
            }
        }
        if (isSwingHigh) {
            swingHighs.push({ value: data[i][valueKey], index: i, date: data[i].date });
        }
    }
    return swingHighs;
};

function RSIAnalysis2({ stockCode }) {
    const [rsiData, setRSIData] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [divergenceResult, setDivergenceResult] = useState('');

    const analyzeRSIDivergence = () => {
        const swingRange = 2;
        const dataLength = Math.min(rsiData.length, stockData.length);

        if (dataLength < swingRange * 2) {
            setDivergenceResult('데이터가 충분하지 않습니다.');
            return;
        }

        const priceLows = findSwingLows(stockData, swingRange, 'close');
        const priceHighs = findSwingHighs(stockData, swingRange, 'close');

        const rsiLows = findSwingLows(rsiData, swingRange, 'RSI');
        const rsiHighs = findSwingHighs(rsiData, swingRange, 'RSI');

        let result = '';

        // 상승 다이버전스 감지
        if (priceLows.length >= 2 && rsiLows.length >= 2) {
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentPriceLow = priceLows[priceLows.length - 1];

            const prevRSILow = rsiLows.find(rsiLow => rsiLow.date === prevPriceLow.date);
            const recentRSILow = rsiLows.find(rsiLow => rsiLow.date === recentPriceLow.date);

            if (prevRSILow && recentRSILow) {
                if (recentPriceLow.value < prevPriceLow.value && recentRSILow.value > prevRSILow.value) {
                    result += `상승 다이버전스 감지: 주가는 더 낮은 저점을 형성했지만, RSI는 더 높은 저점을 형성했습니다. 이는 매수 신호일 수 있습니다.<br/>`;
                }
            }
        }

        // 하락 다이버전스 감지
        if (priceHighs.length >= 2 && rsiHighs.length >= 2) {
            const prevPriceHigh = priceHighs[priceHighs.length - 2];
            const recentPriceHigh = priceHighs[priceHighs.length - 1];

            const prevRSIHigh = rsiHighs.find(rsiHigh => rsiHigh.date === prevPriceHigh.date);
            const recentRSIHigh = rsiHighs.find(rsiHigh => rsiHigh.date === recentPriceHigh.date);

            if (prevRSIHigh && recentRSIHigh) {
                if (recentPriceHigh.value > prevPriceHigh.value && recentRSIHigh.value < prevRSIHigh.value) {
                    result += `하락 다이버전스 감지: 주가는 더 높은 고점을 형성했지만, RSI는 더 낮은 고점을 형성했습니다. 이는 매도 신호일 수 있습니다.<br/>`;
                }
            }
        }

        if (!result) {
            result = "현재 다이버전스가 감지되지 않았습니다. 지속적인 모니터링이 필요합니다.";
        }

        setDivergenceResult(result);
    };

    useEffect(() => {
        if (rsiData.length > 0 && stockData.length > 0) {
            analyzeRSIDivergence();
        }
    }, [rsiData, stockData]);

    return (
        <div>
            <FetchRSIData stockCode={stockCode} onRSIFetch={setRSIData} />
            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
            <h4>RSI 다이버전스 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: divergenceResult }}></p>
        </div>
    );
}

export default RSIAnalysis2;