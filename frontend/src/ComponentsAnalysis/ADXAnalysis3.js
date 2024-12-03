import React, { useState, useEffect } from 'react';
import FetchADXData from '../ComponentsFetch/FetchStockOrignal/FetchADXData';
import { linearRegression } from 'simple-statistics';

function ADXAnalysis3({ stockCode }) {
    const [adxData, setADXData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeADXDirection = (adxData, period = 14) => {
        if (adxData.length < period) {
            return '데이터가 충분하지 않습니다.';
        }

        const recentData = adxData.slice(-period);
        const adxValues = recentData.map(data => data.ADX);
        const indices = [...Array(period).keys()];

        // 선형 회귀를 통한 ADX 추세 분석
        const regressionData = indices.map((x, i) => [x, adxValues[i]]);
        const { m: slope } = linearRegression(regressionData);

        let result = '<strong>ADX의 방향성 분석</strong><br/><br/>';
        result += 'ADX의 추세를 분석하여 추세의 강도가 강화되는지 약화되는지 판단합니다.<br/><br/>';

        if (slope > 0) {
            result += '최근 ADX는 상승 추세에 있어 추세의 강도가 <strong>강화</strong>되고 있습니다.<br/>';
        } else if (slope < 0) {
            result += '최근 ADX는 하락 추세에 있어 추세의 강도가 <strong>약화</strong>되고 있습니다.<br/>';
        } else {
            result += 'ADX의 추세 변화가 없어 추세의 강도가 유지되고 있습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (adxData.length > 0) {
            const result = analyzeADXDirection(adxData);
            setAnalysisResult(result);
        }
    }, [adxData]);

    return (
        <div>
            <FetchADXData stockCode={stockCode} onADXFetch={setADXData} />
            <h4>ADX의 방향성 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default ADXAnalysis3;