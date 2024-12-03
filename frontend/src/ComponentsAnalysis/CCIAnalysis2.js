import React, { useState, useEffect } from 'react';
import FetchCCIData from '../ComponentsFetch/FetchStockOrignal/FetchCCIData';
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

function CCIAnalysis2({ stockCode }) {
    const [cciData, setCCIData] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [divergenceResult, setDivergenceResult] = useState('');

    const analyzeCCIDivergence = () => {
        const swingRange = 2;
        const dataLength = Math.min(cciData.length, stockData.length);

        if (dataLength < swingRange * 2) {
            setDivergenceResult('데이터가 충분하지 않습니다.');
            return;
        }

        const priceLows = findSwingLows(stockData, swingRange, 'close');
        const priceHighs = findSwingHighs(stockData, swingRange, 'close');

        const cciLows = findSwingLows(cciData, swingRange, 'CCI');
        const cciHighs = findSwingHighs(cciData, swingRange, 'CCI');

        let result = '';

        // 상승 다이버전스 감지
        if (priceLows.length >= 2 && cciLows.length >= 2) {
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentPriceLow = priceLows[priceLows.length - 1];

            const prevCCILow = cciLows.find(cciLow => cciLow.date === prevPriceLow.date);
            const recentCCILow = cciLows.find(cciLow => cciLow.date === recentPriceLow.date);

            if (prevCCILow && recentCCILow) {
                if (recentPriceLow.value < prevPriceLow.value && recentCCILow.value > prevCCILow.value) {
                    result += `상승 다이버전스 감지: 주가는 더 낮은 저점을 형성했지만, CCI는 더 높은 저점을 형성했습니다. 이는 매수 신호일 수 있습니다.<br/>`;
                }
            }
        }

        // 하락 다이버전스 감지
        if (priceHighs.length >= 2 && cciHighs.length >= 2) {
            const prevPriceHigh = priceHighs[priceHighs.length - 2];
            const recentPriceHigh = priceHighs[priceHighs.length - 1];

            const prevCCIHigh = cciHighs.find(cciHigh => cciHigh.date === prevPriceHigh.date);
            const recentCCIHigh = cciHighs.find(cciHigh => cciHigh.date === recentPriceHigh.date);

            if (prevCCIHigh && recentCCIHigh) {
                if (recentPriceHigh.value > prevPriceHigh.value && recentCCIHigh.value < prevCCIHigh.value) {
                    result += `하락 다이버전스 감지: 주가는 더 높은 고점을 형성했지만, CCI는 더 낮은 고점을 형성했습니다. 이는 매도 신호일 수 있습니다.<br/>`;
                }
            }
        }

        if (!result) {
            result = "현재 다이버전스가 감지되지 않았습니다. 지속적인 모니터링이 필요합니다.";
        }

        setDivergenceResult(result);
    };

    useEffect(() => {
        if (cciData.length > 0 && stockData.length > 0) {
            analyzeCCIDivergence();
        }
    }, [cciData, stockData]);

    return (
        <div>
            <FetchCCIData stockCode={stockCode} onCCIFetch={setCCIData} />
            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
            <h4>CCI 다이버전스 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: divergenceResult }}></p>
        </div>
    );
}

export default CCIAnalysis2;