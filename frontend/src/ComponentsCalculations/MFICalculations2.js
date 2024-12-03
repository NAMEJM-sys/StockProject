import React, { useState, useEffect } from "react";
import FetchMFIData from "../ComponentsFetch/FetchStockOrignal/FetchMFIData";
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

// 스윙 고점 찾기 함수
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

function MFICalculations2({ stockCode, onScoreCalculated }) {
    const [mfiData, setMFIData] = useState([]);
    const [stockData, setStockData] = useState([]);

    const calculateDivergenceScore = () => {
        const swingRange = 2;
        const dataLength = Math.min(mfiData.length, stockData.length);

        if (dataLength < swingRange * 2) {
            if (onScoreCalculated) {
                onScoreCalculated(null);
            }
            return;
        }

        const priceLows = findSwingLows(stockData, swingRange, 'close');
        const priceHighs = findSwingHighs(stockData, swingRange, 'close');

        const mfiLows = findSwingLows(mfiData, swingRange, 'MFI');
        const mfiHighs = findSwingHighs(mfiData, swingRange, 'MFI');

        let divergenceType = null; // 'bullish', 'bearish', null

        // 상승 다이버전스 감지
        if (priceLows.length >= 2 && mfiLows.length >= 2) {
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentPriceLow = priceLows[priceLows.length - 1];

            const prevMFILow = mfiLows.find(mfiLow => mfiLow.date === prevPriceLow.date);
            const recentMFILow = mfiLows.find(mfiLow => mfiLow.date === recentPriceLow.date);

            if (prevMFILow && recentMFILow) {
                if (recentPriceLow.value < prevPriceLow.value && recentMFILow.value > prevMFILow.value) {
                    divergenceType = 'bullish';
                }
            }
        }

        // 하락 다이버전스 감지
        if (priceHighs.length >= 2 && mfiHighs.length >= 2) {
            const prevPriceHigh = priceHighs[priceHighs.length - 2];
            const recentPriceHigh = priceHighs[priceHighs.length - 1];

            const prevMFIHigh = mfiHighs.find(mfiHigh => mfiHigh.date === prevPriceHigh.date);
            const recentMFIHigh = mfiHighs.find(mfiHigh => mfiHigh.date === recentPriceHigh.date);

            if (prevMFIHigh && recentMFIHigh) {
                if (recentPriceHigh.value > prevPriceHigh.value && recentMFIHigh.value < prevMFIHigh.value) {
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

        if (onScoreCalculated) {
            onScoreCalculated(calculatedScore);
        }
    };

    useEffect(() => {
        if (mfiData.length > 0 && stockData.length > 0) {
            calculateDivergenceScore();
        }
    }, [mfiData, stockData]);

    return (
        <div>
            <FetchMFIData stockCode={stockCode} onMFIFetch={setMFIData} />
            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
        </div>
    );
}

export default MFICalculations2;