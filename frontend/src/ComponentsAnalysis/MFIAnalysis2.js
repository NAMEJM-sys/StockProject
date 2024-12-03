import React, { useState, useEffect } from "react";
import FetchMFIData from "../ComponentsFetch/FetchStockOrignal/FetchMFIData";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";

// 스윙 저점 찾기 함수
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

function MFIAnalysis2({ stockCode }) {
    const [mfiData, setMFIData] = useState([]);
    const [stockData, setStockData] = useState([]);
    const [divergenceResult, setDivergenceResult] = useState("");

    const analyzeMFIDivergence = () => {
        const swingRange = 2; // 스윙 고점/저점 판단을 위한 범위 설정
        const dataLength = Math.min(mfiData.length, stockData.length);

        // 데이터 충분성 검사
        if (dataLength < swingRange * 2) {
            setDivergenceResult("데이터가 충분하지 않습니다.");
            return;
        }

        // 스윙 저점과 고점 찾기
        const priceLows = findSwingLows(stockData, swingRange, 'close');
        const priceHighs = findSwingHighs(stockData, swingRange, 'close');

        const mfiLows = findSwingLows(mfiData, swingRange, 'MFI');
        const mfiHighs = findSwingHighs(mfiData, swingRange, 'MFI');

        let result = "";

        // 갱신된 고점과 저점으로 다이버전스 감지
        if (priceLows.length >= 2 && mfiLows.length >= 2) {
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentPriceLow = priceLows[priceLows.length - 1];

            const prevMFILow = mfiLows.find(mfiLow => mfiLow.date === prevPriceLow.date);
            const recentMFILow = mfiLows.find(mfiLow => mfiLow.date === recentPriceLow.date);

            if (prevMFILow && recentMFILow) {
                if (recentPriceLow.value < prevPriceLow.value && recentMFILow.value > prevMFILow.value) {
                    result += `상승 다이버전스 감지: 주가는 더 낮은 저점을 형성했지만, MFI는 더 높은 저점을 형성했습니다. 이는 매수 신호일 수 있습니다.<br/>`;
                }
            }
        }

        if (priceHighs.length >= 2 && mfiHighs.length >= 2) {
            const prevPriceHigh = priceHighs[priceHighs.length - 2];
            const recentPriceHigh = priceHighs[priceHighs.length - 1];

            const prevMFIHigh = mfiHighs.find(mfiHigh => mfiHigh.date === prevPriceHigh.date);
            const recentMFIHigh = mfiHighs.find(mfiHigh => mfiHigh.date === recentPriceHigh.date);

            if (prevMFIHigh && recentMFIHigh) {
                if (recentPriceHigh.value > prevPriceHigh.value && recentMFIHigh.value < prevMFIHigh.value) {
                    result += `하락 다이버전스 감지: 주가는 더 높은 고점을 형성했지만, MFI는 더 낮은 고점을 형성했습니다. 이는 매도 신호일 수 있습니다.<br/>`;
                }
            }
        }

        if (!result) {
            result = "현재 다이버전스가 감지되지 않았습니다. 지속적인 모니터링이 필요합니다.";
        }

        setDivergenceResult(result);
    };

    useEffect(() => {
        if (mfiData.length > 0 && stockData.length > 0) {
            analyzeMFIDivergence();
        }
    }, [mfiData, stockData]);

    return (
        <div>
            <FetchMFIData stockCode={stockCode} onMFIFetch={setMFIData} />
            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
            <h4>MFI 다이버전스 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: divergenceResult }}></p>
        </div>
    );
}

export default MFIAnalysis2;