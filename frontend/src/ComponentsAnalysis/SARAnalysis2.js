import React, { useState, useEffect } from 'react';
import FetchSARData from '../ComponentsFetch/FetchStockOrignal/FetchParabolicSARData';

function SARAnalysis2({ stockCode }) {
    const [sarData, setSARData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeTrendPersistence = (sarData) => {
        if (sarData.length < 2) {
            return '데이터가 충분하지 않습니다.';
        }

        let result = '<strong>추세 지속성 분석</strong><br/><br/>';

        let upTrendDays = 0;
        let downTrendDays = 0;

        // 최근 데이터부터 거꾸로 순회하여 연속된 추세 일수를 계산
        for (let i = sarData.length - 1; i >= 0; i--) {
            const currentPrice = sarData[i].close;
            const currentSAR = sarData[i].Parabolic_SAR;

            if (currentPrice > currentSAR) {
                if (downTrendDays > 0) break;
                upTrendDays++;
            } else if (currentPrice < currentSAR) {
                if (upTrendDays > 0) break;
                downTrendDays++;
            } else {
                break;
            }
        }

        if (upTrendDays > 0) {
            result += `현재 <strong>${upTrendDays}일 연속</strong>으로 가격이 SAR보다 위에 있어 상승 추세가 지속되고 있습니다.<br/>`;
        } else if (downTrendDays > 0) {
            result += `현재 <strong>${downTrendDays}일 연속</strong>으로 가격이 SAR보다 아래에 있어 하락 추세가 지속되고 있습니다.<br/>`;
        } else {
            result += '현재 추세가 명확하지 않습니다. 변동성이 높을 수 있습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (sarData.length > 0) {
            const result = analyzeTrendPersistence(sarData);
            setAnalysisResult(result);
        }
    }, [sarData]);

    return (
        <div>
            <FetchSARData stockCode={stockCode} onSARFetch={setSARData} />
            <h4>Parabolic SAR 추세 지속성 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default SARAnalysis2;