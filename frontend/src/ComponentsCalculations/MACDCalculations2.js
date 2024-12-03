import React, { useState, useEffect } from 'react';
import FetchMACDData from '../ComponentsFetch/FetchStockOrignal/FetchMACDData';
import FetchStockDataForCode from '../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode';

function MACDCalculations2({ stockCode, onScoreCalculated }) {
    const [macdData, setMACDData] = useState([]);
    const [stockData, setStockData] = useState([]);

    const calculateDivergenceScore = () => {
        if (macdData.length < 10 || stockData.length < 10) {
            if (onScoreCalculated) {
                onScoreCalculated(5); // 데이터 부족 시 보통 점수
            }
            return;
        }

        // 스윙 포인트 감지 함수 수정
        const findSwingPoints = (data, key, windowSize = 3) => {
            let swings = [];
            for (let i = windowSize; i < data.length - windowSize; i++) {
                let isSwingHigh = true;
                let isSwingLow = true;
                for (let j = 1; j <= windowSize; j++) {
                    if (data[i - j][key] >= data[i][key] || data[i + j][key] >= data[i][key]) {
                        isSwingHigh = false;
                    }
                    if (data[i - j][key] <= data[i][key] || data[i + j][key] <= data[i][key]) {
                        isSwingLow = false;
                    }
                }
                if (isSwingHigh) {
                    swings.push({ type: 'high', value: data[i][key], index: i, date: data[i].date });
                }
                if (isSwingLow) {
                    swings.push({ type: 'low', value: data[i][key], index: i, date: data[i].date });
                }
            }
            return swings;
        };

        const priceSwings = findSwingPoints(stockData, 'close');
        const macdSwings = findSwingPoints(macdData, 'MACD_Line');

        let divergenceType = null;

        // 상승 다이버전스 확인
        const priceLows = priceSwings.filter(swing => swing.type === 'low');
        const macdLows = macdSwings.filter(swing => swing.type === 'low');

        if (priceLows.length >= 2 && macdLows.length >= 2) {
            const latestPriceLow = priceLows[priceLows.length - 1];
            const prevPriceLow = priceLows[priceLows.length - 2];

            const latestMACDLow = macdLows.find(swing => swing.index === latestPriceLow.index);
            const prevMACDLow = macdLows.find(swing => swing.index === prevPriceLow.index);

            if (latestMACDLow && prevMACDLow) {
                if (latestPriceLow.value < prevPriceLow.value && latestMACDLow.value > prevMACDLow.value) {
                    divergenceType = 'bullish';
                }
            }
        }

        // 하락 다이버전스 확인
        const priceHighs = priceSwings.filter(swing => swing.type === 'high');
        const macdHighs = macdSwings.filter(swing => swing.type === 'high');

        if (priceHighs.length >= 2 && macdHighs.length >= 2) {
            const latestPriceHigh = priceHighs[priceHighs.length - 1];
            const prevPriceHigh = priceHighs[priceHighs.length - 2];

            const latestMACDHigh = macdHighs.find(swing => swing.index === latestPriceHigh.index);
            const prevMACDHigh = macdHighs.find(swing => swing.index === prevPriceHigh.index);

            if (latestMACDHigh && prevMACDHigh) {
                if (latestPriceHigh.value > prevPriceHigh.value && latestMACDHigh.value < prevMACDHigh.value) {
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
        if (macdData.length > 0 && stockData.length > 0) {
            calculateDivergenceScore();
        }
    }, [macdData, stockData]);

    return (
        <div>
            <FetchMACDData stockCode={stockCode} onMACDFetch={setMACDData} />
            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
        </div>
    );
}

export default MACDCalculations2;