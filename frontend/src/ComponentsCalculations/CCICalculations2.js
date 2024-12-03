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

function CCICalculations2({ stockCode, onScoreCalculated }) {
    const [cciData, setCCIData] = useState([]);
    const [stockData, setStockData] = useState([]);

    const calculateDivergenceScore = () => {
        const swingRange = 2;
        const dataLength = Math.min(cciData.length, stockData.length);

        if (dataLength < swingRange * 2) {
            if (onScoreCalculated) {
                onScoreCalculated(5); // 데이터 부족 시 보통 점수
            }
            return;
        }

        const priceLows = findSwingLows(stockData, swingRange, 'close');
        const priceHighs = findSwingHighs(stockData, swingRange, 'close');

        const cciLows = findSwingLows(cciData, swingRange, 'CCI');
        const cciHighs = findSwingHighs(cciData, swingRange, 'CCI');

        let divergenceType = null;

        // 상승 다이버전스 감지
        if (priceLows.length >= 2 && cciLows.length >= 2) {
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentPriceLow = priceLows[priceLows.length - 1];

            const prevCCILow = cciLows.find(cciLow => cciLow.date === prevPriceLow.date);
            const recentCCILow = cciLows.find(cciLow => cciLow.date === recentPriceLow.date);

            if (prevCCILow && recentCCILow) {
                if (recentPriceLow.value < prevPriceLow.value && recentCCILow.value > prevCCILow.value) {
                    divergenceType = 'bullish';
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
                    divergenceType = 'bearish';
                }
            }
        }

        // 점수 부여
        let score = 5; // 기본 보통
        if (divergenceType === 'bullish') {
            score = 3; // 매수
        } else if (divergenceType === 'bearish') {
            score = 7; // 매도
        }

        if (onScoreCalculated) {
            onScoreCalculated(score);
        }
    };

    useEffect(() => {
        if (cciData.length > 0 && stockData.length > 0) {
            calculateDivergenceScore();
        }
    }, [cciData, stockData]);

    return (
        <div>
            <FetchCCIData stockCode={stockCode} onCCIFetch={setCCIData} />
            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
        </div>
    );
}

export default CCICalculations2;