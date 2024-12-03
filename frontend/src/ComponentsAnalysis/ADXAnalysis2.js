import React, { useState, useEffect } from 'react';
import FetchADXData from '../ComponentsFetch/FetchStockOrignal/FetchADXData';

function ADXAnalysis2({ stockCode }) {
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

    const analyzeDICrossovers = (adxData, period = 14) => {
        if (adxData.length < period + 1) {
            return '데이터가 충분하지 않습니다.';
        }

        // DI+와 DI-의 값 추출
        const diPlusValues = adxData.map(data => data.DI14Plus);
        const diMinusValues = adxData.map(data => data.DI14Minus);

        // EMA 계산
        const diPlusEMA = calculateEMA(diPlusValues, period);
        const diMinusEMA = calculateEMA(diMinusValues, period);

        // 최근 값과 이전 값 가져오기
        const currentDiPlusEMA = diPlusEMA[diPlusEMA.length - 1];
        const currentDiMinusEMA = diMinusEMA[diMinusEMA.length - 1];
        const prevDiPlusEMA = diPlusEMA[diPlusEMA.length - 2];
        const prevDiMinusEMA = diMinusEMA[diMinusEMA.length - 2];

        let result = '<strong>DI+와 DI- 이동 평균 교차 분석</strong><br/><br/>';
        result += 'DI+는 상승 압력을, DI-는 하락 압력을 나타냅니다. 두 지표의 이동 평균 교차를 통해 추세 전환 신호를 파악할 수 있습니다.<br/><br/>';

        if (prevDiPlusEMA <= prevDiMinusEMA && currentDiPlusEMA > currentDiMinusEMA) {
            result += '매수 신호 발생: DI+의 EMA가 DI-의 EMA를 상향 돌파했습니다.<br/>';
        } else if (prevDiPlusEMA >= prevDiMinusEMA && currentDiPlusEMA < currentDiMinusEMA) {
            result += '매도 신호 발생: DI+의 EMA가 DI-의 EMA를 하향 돌파했습니다.<br/>';
        } else {
            result += 'DI+와 DI-의 EMA 사이에 특별한 교차 신호가 없습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (adxData.length > 0) {
            const result = analyzeDICrossovers(adxData);
            setAnalysisResult(result);
        }
    }, [adxData]);

    return (
        <div>
            <FetchADXData stockCode={stockCode} onADXFetch={setADXData} />
            <h4>DI+와 DI- 이동 평균 교차 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default ADXAnalysis2;