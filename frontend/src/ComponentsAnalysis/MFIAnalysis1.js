import React, { useState, useEffect } from 'react';
import FetchMFIData from '../ComponentsFetch/FetchStockOrignal/FetchMFIData';

function MFIAnalysis1({ stockCode }) {
    const [mfiData, setMFIData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeMFITrend = (mfiData, period = 14) => {
        let lastIndex = mfiData.length - 1;
        if (lastIndex < period) return '데이터가 충분하지 않습니다.';

        const currentMFI = mfiData[lastIndex]?.MFI;
        const prevMFI = mfiData[lastIndex - 1]?.MFI;

        // MFI 추세를 단순한 전일 대비가 아닌 기간 동안의 기울기로 계산
        const mfiTrendData = mfiData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.MFI);
        const totalChange = mfiTrendData[mfiTrendData.length - 1] - mfiTrendData[0];
        const mfiTrendDirection = totalChange > 0 ? '상승' : '하락';

        // 가격 변화율 비교
        const priceTrend = mfiData.slice(lastIndex - period + 1, lastIndex + 1).map(data => data.close);
        const priceChange = priceTrend[priceTrend.length - 1] - priceTrend[0];
        const priceTrendDirection = priceChange > 0 ? '상승' : '하락';

        const currentMFI_MA_Crossover = mfiData[lastIndex].MFI_MA_Crossover;

        if (currentMFI === undefined || prevMFI === undefined) {
            return 'MFI 데이터를 불러오는 데 문제가 발생했습니다.';
        }


        // MFI 과매수/과매도 상태 판단
        let mfiState = '';
        if (currentMFI > 80) {
            mfiState = '과매수 상태';
        } else if (currentMFI < 20) {
            mfiState = '과매도 상태';
        } else {
            mfiState = '중립 상태';
        }

        const mfiChange = currentMFI - prevMFI;
        const mfiTrend = mfiChange > 0 ? '상승' : '하락';

        let result = '';
        result += `<strong>현재 MFI:</strong> ${currentMFI.toFixed(2)} (${mfiState})<br/>`;
        result += `ㆍ 가격 흐름: ${priceTrendDirection} 추세<br/>`;
        result += `ㆍ MFI 흐름: ${mfiTrendDirection} 추세<br/>`;
        result += `ㆍ MFI 이동평균 교차 신호: ${currentMFI_MA_Crossover === 1 ? '골든 크로스' : '데드 크로스'}<br/><br/>`

        // MFI 이동평균 교차 신호
        const currentMACrossover = mfiData[lastIndex]?.MFI_MA_Crossover;
        if (currentMACrossover === 1) {
            result += `MFI 단기 이동평균이 장기 이동평균을 상향 돌파했습니다 (골든 크로스). 상승 추세 가능성이 있습니다.<br/><br/>`;
        } else if (currentMACrossover === -1) {
            result += `MFI 단기 이동평균이 장기 이동평균을 하향 돌파했습니다 (데드 크로스). 하락 추세 가능성이 있습니다.<br/><br/>`;
        } else {
            result += `MFI 이동평균에 특별한 교차 신호가 없습니다.<br/><br/>`;
        }

        // MFI 추세와 가격 추세 비교
        if (mfiTrendDirection  === '상승' && priceTrendDirection === '상승') {
            result += `MFI와 가격 모두 상승세를 보이고 있습니다. 강한 상승 추세일 가능성이 큽니다.<br/>`;
        } else if (mfiTrendDirection  === '하락' && priceTrendDirection === '하락') {
            result += `MFI와 가격 모두 하락세를 보이고 있습니다. 하락 추세가 강화될 가능성이 있습니다.<br/>`;
        } else if (mfiTrendDirection  === '상승' && priceTrendDirection === '하락') {
            result += `가격은 하락 중이나 MFI는 상승세를 보이고 있습니다. 이는 가격 반등 가능성을 시사할 수 있습니다.<br/>`;
        } else if (mfiTrendDirection  === '하락' && priceTrendDirection === '상승') {
            result += `가격은 상승 중이나 MFI는 하락세를 보이고 있습니다. 이는 상승 추세가 약화될 수 있음을 나타냅니다.<br/>`;
        }


        return result;
    };

    useEffect(() => {
        if (mfiData.length > 0) {
            const result = analyzeMFITrend(mfiData);
            setAnalysisResult(result);
        }
    }, [mfiData]);

    return (
        <div>
            <FetchMFIData stockCode={stockCode} onMFIFetch={setMFIData} />
            <h4>MFI 흐름 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default MFIAnalysis1;