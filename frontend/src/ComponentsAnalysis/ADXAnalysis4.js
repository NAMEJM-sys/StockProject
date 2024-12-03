import React, { useState, useEffect } from 'react';
import FetchADXData from '../ComponentsFetch/FetchStockOrignal/FetchADXData';
import { linearRegression } from 'simple-statistics';

function ADXAnalysis4({ stockCode }) {
    const [adxData, setADXData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    // 지수 이동 평균(EMA) 계산 함수
    const calculateEMA = (values, period) => {
        const k = 2 / (period + 1);
        let ema = [];
        values.forEach((value, index) => {
            if (index === 0) {
                ema.push(value);
            } else {
                ema.push(value * k + ema[index - 1] * (1 - k));
            }
        });
        return ema;
    };

    const analyzeCombinedADX = (adxData, period = 14) => {
        if (adxData.length < period) {
            return '데이터가 충분하지 않습니다.';
        }

        const recentData = adxData.slice(-period);
        const adxValues = recentData.map(data => data.ADX);
        const diPlusValues = recentData.map(data => data.DI14Plus);
        const diMinusValues = recentData.map(data => data.DI14Minus);
        const indices = [...Array(period).keys()];

        // ADX의 EMA 계산
        const adxEMAArray = calculateEMA(adxValues, period);
        const avgADX = adxEMAArray[adxEMAArray.length - 1];

        // DI+와 DI-의 EMA 계산
        const diPlusEMAArray = calculateEMA(diPlusValues, period);
        const avgDIPlus = diPlusEMAArray[diPlusEMAArray.length - 1];
        const diMinusEMAArray = calculateEMA(diMinusValues, period);
        const avgDIMinus = diMinusEMAArray[diMinusEMAArray.length - 1];

        // 선형 회귀를 통한 ADX 추세 분석
        const regressionData = indices.map((x, i) => [x, adxValues[i]]);
        const { m: adxSlope } = linearRegression(regressionData);

        let result = '<strong>ADX 종합 분석</strong><br/><br/>';
        result += 'ADX는 추세의 강도를, DI+와 DI-는 추세의 방향을 나타냅니다. 이들을 종합하여 현재 시장의 추세를 판단합니다.<br/><br/>';

        result += `최근 ${period}일간 ADX의 EMA 값은 <strong>${avgADX.toFixed(2)}</strong>입니다.<br/>`;
        result += `DI+의 EMA 값은 <strong>${avgDIPlus.toFixed(2)}</strong>, DI-의 EMA 값은 <strong>${avgDIMinus.toFixed(2)}</strong>입니다.<br/><br/>`;

        // ADX 추세 방향
        if (adxSlope > 0) {
            result += 'ADX가 상승 추세에 있어 추세의 강도가 강화되고 있습니다.<br/>';
        } else if (adxSlope < 0) {
            result += 'ADX가 하락 추세에 있어 추세의 강도가 약화되고 있습니다.<br/>';
        } else {
            result += 'ADX의 추세 변화가 없어 추세의 강도가 유지되고 있습니다.<br/>';
        }

        // 종합적인 추세 판단
        if (avgADX >= 25) {
            if (avgDIPlus > avgDIMinus) {
                result += '→ ADX가 높고 DI+ > DI-이므로 <strong>강한 상승 추세</strong>입니다.<br/>';
                result += '매수 기회를 고려해볼 수 있습니다.<br/>';
            } else if (avgDIPlus < avgDIMinus) {
                result += '→ ADX가 높고 DI+ < DI-이므로 <strong>강한 하락 추세</strong>입니다.<br/>';
                result += '매도 또는 관망을 고려해볼 수 있습니다.<br/>';
            } else {
                result += '→ ADX가 높지만 DI+와 DI-가 유사하여 방향성을 판단하기 어렵습니다.<br/>';
            }
        } else if (avgADX <= 20) {
            result += '→ ADX가 낮아 추세가 약합니다. 횡보장으로 판단되며, 신중한 접근이 필요합니다.<br/>';
        } else {
            result += '→ 추세의 강도가 애매하므로 신중한 접근이 필요합니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (adxData.length > 0) {
            const result = analyzeCombinedADX(adxData);
            setAnalysisResult(result);
        }
    }, [adxData]);

    return (
        <div>
            <FetchADXData stockCode={stockCode} onADXFetch={setADXData} />
            <h4>ADX 종합 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default ADXAnalysis4;