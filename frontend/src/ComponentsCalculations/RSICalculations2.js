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

function RSICalculations2({ stockCode, onScoreCalculated }) {
    const [rsiData, setRSIData] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [score, setScore] = useState(null);

    const calculateDivergenceScore = () => {
        const swingRange = 2;
        const dataLength = Math.min(rsiData.length, stockData.length);

        if (dataLength < swingRange * 2) {
            setScore(null);
            return;
        }

        const priceLows = findSwingLows(stockData, swingRange, 'close');
        const priceHighs = findSwingHighs(stockData, swingRange, 'close');

        const rsiLows = findSwingLows(rsiData, swingRange, 'RSI');
        const rsiHighs = findSwingHighs(rsiData, swingRange, 'RSI');

        let divergenceType = null; // 'bullish', 'bearish', null

        // 상승 다이버전스 감지
        if (priceLows.length >= 2 && rsiLows.length >= 2) {
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentPriceLow = priceLows[priceLows.length - 1];

            const prevRSILow = rsiLows.find(rsiLow => rsiLow.date === prevPriceLow.date);
            const recentRSILow = rsiLows.find(rsiLow => rsiLow.date === recentPriceLow.date);

            if (prevRSILow && recentRSILow) {
                if (recentPriceLow.value < prevPriceLow.value && recentRSILow.value > prevRSILow.value) {
                    divergenceType = 'bullish';
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
                    divergenceType = 'bearish';
                }
            }
        }

        // 점수 부여
        let calculatedScore = 5; // 기본 보통
        if (divergenceType === 'bullish') {
            calculatedScore = 3; // 매수
        } else if (divergenceType === 'bearish') {
            calculatedScore = 7; // 매도
        }

        setScore(calculatedScore);

        if (onScoreCalculated && calculatedScore !== null) {
            onScoreCalculated(calculatedScore);
        }
    };

    useEffect(() => {
        if (rsiData.length > 0 && stockData.length > 0) {
            calculateDivergenceScore();
        }
    }, [rsiData, stockData]);

    return (
        <div>
            <FetchRSIData stockCode={stockCode} onRSIFetch={setRSIData} />
            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
        </div>
    );
}

export default RSICalculations2;