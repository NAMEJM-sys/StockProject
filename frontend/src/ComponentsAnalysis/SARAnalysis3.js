import React, { useState, useEffect } from 'react';
import FetchSARData from '../ComponentsFetch/FetchStockOrignal/FetchParabolicSARData';

function SARAnalysis3({ stockCode }) {
    const [sarData, setSARData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeTrendStrength = (sarData, period = 5) => {
        if (sarData.length < period) {
            return '데이터가 충분하지 않습니다.';
        }

        let result = '<strong>추세 강도 분석</strong><br/><br/>';

        const recentAFValues = sarData.slice(-period).map((data) => data.AF);

        // AF의 변화 추세 분석
        const afDifferences = recentAFValues.slice(1).map((af, index) => af - recentAFValues[index]);

        const positiveChanges = afDifferences.filter((diff) => diff > 0).length;
        const negativeChanges = afDifferences.filter((diff) => diff < 0).length;

        const currentAF = recentAFValues[recentAFValues.length - 1];

        result += `현재 가속 계수(AF) 값은 <strong>${currentAF.toFixed(2)}</strong>입니다.<br/>`;

        if (positiveChanges === afDifferences.length) {
            result += '최근 AF가 지속적으로 증가하여 추세 강도가 강화되고 있습니다.<br/>';
        } else if (negativeChanges === afDifferences.length) {
            result += '최근 AF가 지속적으로 감소하여 추세 강도가 약화되고 있습니다.<br/>';
        } else {
            result += 'AF의 변화가 일정하지 않아 추세 강도의 변화가 명확하지 않습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (sarData.length > 0) {
            const result = analyzeTrendStrength(sarData);
            setAnalysisResult(result);
        }
    }, [sarData]);

    return (
        <div>
            <FetchSARData stockCode={stockCode} onSARFetch={setSARData} />
            <h4>Parabolic SAR 추세 강도 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default SARAnalysis3;