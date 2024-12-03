import React, { useState, useEffect } from "react";
import FetchStochasticData from "../ComponentsFetch/FetchStockOrignal/FetchStochasticData";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";

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

function StochasticCalculations({ stockCode, onScoreCalculated }) {
    const [stochasticData, setStochasticData] = useState([]);
    const [stockData, setStockData] = useState([]);

    const calculateDivergenceAndTrendScore = () => {
        const swingRange = 2;
        const dataLength = Math.min(stochasticData.length, stockData.length);

        if (dataLength < swingRange * 2) {
            if (onScoreCalculated) {
                onScoreCalculated(null);
            }
            return;
        }

        const priceLows = findSwingLows(stockData, swingRange, 'close');
        const priceHighs = findSwingHighs(stockData, swingRange, 'close');

        const stochLows = findSwingLows(stochasticData, swingRange, 'perK');
        const stochHighs = findSwingHighs(stochasticData, swingRange, 'perK');

        let divergenceType = null; // 'bullish', 'bearish', null
        let trendSignal = null; // 'uptrend', 'downtrend', null

        // 상승 다이버전스 감지 (가격 하락 + 스토캐스틱 상승)
        if (priceLows.length >= 2 && stochLows.length >= 2) {
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentPriceLow = priceLows[priceLows.length - 1];

            const prevStochLow = stochLows.find(stochLow => stochLow.date === prevPriceLow.date);
            const recentStochLow = stochLows.find(stochLow => stochLow.date === recentPriceLow.date);

            if (prevStochLow && recentStochLow) {
                if (recentPriceLow.value < prevPriceLow.value && recentStochLow.value > prevStochLow.value) {
                    divergenceType = 'bullish';
                }
            }
        }

        // 하락 다이버전스 감지 (가격 상승 + 스토캐스틱 하락)
        if (priceHighs.length >= 2 && stochHighs.length >= 2) {
            const prevPriceHigh = priceHighs[priceHighs.length - 2];
            const recentPriceHigh = priceHighs[priceHighs.length - 1];

            const prevStochHigh = stochHighs.find(stochHigh => stochHigh.date === prevPriceHigh.date);
            const recentStochHigh = stochHighs.find(stochHigh => stochHigh.date === recentPriceHigh.date);

            if (prevStochHigh && recentStochHigh) {
                if (recentPriceHigh.value > prevPriceHigh.value && recentStochHigh.value < prevStochHigh.value) {
                    divergenceType = 'bearish';
                }
            }
        }

        // 상승/하락 설정 감지
        if (priceLows.length >= 2 && stochHighs.length >= 2) {
            const recentPriceLow = priceLows[priceLows.length - 1];
            const recentStochHigh = stochHighs[stochHighs.length - 1];

            if (recentPriceLow.value < priceLows[priceLows.length - 2].value && recentStochHigh.value > stochHighs[stochHighs.length - 2].value) {
                trendSignal = 'uptrend';  // 상승 설정
            }
        }

        if (priceHighs.length >= 2 && stochLows.length >= 2) {
            const recentPriceHigh = priceHighs[priceHighs.length - 1];
            const recentStochLow = stochLows[stochLows.length - 1];

            if (recentPriceHigh.value > priceHighs[priceHighs.length - 2].value && recentStochLow.value < stochLows[stochLows.length - 2].value) {
                trendSignal = 'downtrend';  // 하락 설정
            }
        }

        // 점수 부여
        let calculatedScore = 5; // 기본 보통
        if (divergenceType === 'bullish' || trendSignal === 'uptrend') {
            calculatedScore = 3; // 매수
        } else if (divergenceType === 'bearish' || trendSignal === 'downtrend') {
            calculatedScore = 7; // 매도
        }

        if (onScoreCalculated) {
            onScoreCalculated(calculatedScore);
        }
    };

    useEffect(() => {
        if (stochasticData.length > 0 && stockData.length > 0) {
            calculateDivergenceAndTrendScore();
        }
    }, [stochasticData, stockData]);

    return (
        <div>
            <FetchStochasticData stockCode={stockCode} onStochasticFetch={setStochasticData} />
            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
        </div>
    );
}

export default StochasticCalculations;