import React, { useState, useEffect } from 'react';
import FetchCCIData from '../ComponentsFetch/FetchStockOrignal/FetchCCIData';

function CCIAnalysis1({ stockCode }) {
    const [cciData, setCCIData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeCCITrend = (cciData, period = 14) => {
        const lastIndex = cciData.length - 1;
        if (lastIndex < period) return '데이터가 충분하지 않습니다.';

        const currentCCI = cciData[lastIndex]?.CCI;
        const prevCCI = cciData[lastIndex - 1]?.CCI;

        const cciTrendData = cciData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.CCI);
        const totalChange = cciTrendData[cciTrendData.length - 1] - cciTrendData[0];
        const cciTrendDirection = totalChange > 0 ? '상승' : '하락';

        const priceTrend = cciData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.close);
        const priceChange = priceTrend[priceTrend.length - 1] - priceTrend[0];
        const priceTrendDirection = priceChange > 0 ? '상승' : '하락';

        const currentCCI_MACrossover = cciData[lastIndex]?.CCI_MA_Crossover;

        if (currentCCI === undefined || prevCCI === undefined) {
            return 'CCI 데이터를 불러오는 데 문제가 발생했습니다.';
        }

        // CCI 과매수/과매도 상태 판단
        let cciState = '';
        if (currentCCI > 100) {
            cciState = '과매수 상태';
        } else if (currentCCI < -100) {
            cciState = '과매도 상태';
        } else {
            cciState = '중립 상태';
        }

        const cciChange = currentCCI - prevCCI;
        const cciTrend = cciChange > 0 ? '상승' : '하락';

        let result = '';
        result += `<strong>현재 CCI:</strong> ${currentCCI.toFixed(2)} (${cciState})<br/>`;
        result += `ㆍ 가격 흐름: ${priceTrendDirection} 추세<br/>`;
        result += `ㆍ CCI 흐름: ${cciTrendDirection} 추세<br/>`;
        result += `ㆍ CCI 이동평균 교차 신호: ${currentCCI_MACrossover === 1 ? '골든 크로스' : '데드 크로스'}<br/><br/>`;

        if (currentCCI_MACrossover === 1) {
            result += `CCI 단기 이동평균이 장기 이동평균을 상향 돌파했습니다 (골든 크로스). 상승 추세 가능성이 있습니다.<br/><br/>`;
        } else if (currentCCI_MACrossover === -1) {
            result += `CCI 단기 이동평균이 장기 이동평균을 하향 돌파했습니다 (데드 크로스). 하락 추세 가능성이 있습니다.<br/><br/>`;
        } else {
            result += `CCI 이동평균에 특별한 교차 신호가 없습니다.<br/><br/>`;
        }

        if (cciTrendDirection  === '상승' && priceTrendDirection === '상승') {
            result += `CCI와 가격 모두 상승세를 보이고 있습니다. 강한 상승 추세일 가능성이 큽니다.<br/>`;
        } else if (cciTrendDirection  === '하락' && priceTrendDirection === '하락') {
            result += `CCI와 가격 모두 하락세를 보이고 있습니다. 하락 추세가 강화될 가능성이 있습니다.<br/>`;
        } else if (cciTrendDirection  === '상승' && priceTrendDirection === '하락') {
            result += `가격은 하락 중이나 CCI는 상승세를 보이고 있습니다. 이는 가격 반등 가능성을 시사할 수 있습니다.<br/>`;
        } else if (cciTrendDirection  === '하락' && priceTrendDirection === '상승') {
            result += `가격은 상승 중이나 CCI는 하락세를 보이고 있습니다. 이는 상승 추세가 약화될 수 있음을 나타냅니다.<br/>`;
        }

        return result;
    };

    useEffect(() => {
        if (cciData.length > 0) {
            const result = analyzeCCITrend(cciData);
            setAnalysisResult(result);
        }
    }, [cciData]);

    return (
        <div>
            <FetchCCIData stockCode={stockCode} onCCIFetch={setCCIData} />
            <h4>CCI 흐름 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default CCIAnalysis1;