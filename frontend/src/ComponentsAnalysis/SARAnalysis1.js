import React, { useState, useEffect } from 'react';
import FetchSARData from '../ComponentsFetch/FetchStockOrignal/FetchParabolicSARData';

function SARAnalysis1({ stockCode }) {
    const [sarData, setSARData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeTrendDirection = (sarData, period = 5) => {
        if (sarData.length < period + 1) {
            return '데이터가 충분하지 않습니다.';
        }

        let result = '<strong>추세 방향 및 반전 지점 식별</strong><br/><br/>';

        const recentData = sarData.slice(-period);
        let upTrendCount = 0;
        let downTrendCount = 0;

        recentData.forEach((data) => {
            if (data.close > data.Parabolic_SAR) {
                upTrendCount++;
            } else if (data.close < data.Parabolic_SAR) {
                downTrendCount++;
            }
        });

        // 추세 방향 판단
        if (upTrendCount === period) {
            result += `최근 ${period}일 동안 가격이 SAR보다 위에 있어 <strong>상승 추세</strong>가 지속되고 있습니다.<br/>`;
        } else if (downTrendCount === period) {
            result += `최근 ${period}일 동안 가격이 SAR보다 아래에 있어 <strong>하락 추세</strong>가 지속되고 있습니다.<br/>`;
        } else {
            result += `최근 ${period}일 동안 추세가 명확하지 않습니다. 변동성이 높을 수 있습니다.<br/>`;
        }

        // 추세 반전 신호 감지
        const prevData = sarData.slice(-period - 1, -1);
        let trendReversal = false;

        for (let i = 0; i < period; i++) {
            const prevClose = prevData[i]?.close;
            const prevSAR = prevData[i]?.Parabolic_SAR;
            const currentClose = recentData[i].close;
            const currentSAR = recentData[i].Parabolic_SAR;

            if (prevClose <= prevSAR && currentClose > currentSAR) {
                trendReversal = true;
                result += `날짜 ${recentData[i].date}에 <strong>상승 추세로의 반전</strong> 신호가 발생했습니다.<br/>`;
                break;
            } else if (prevClose >= prevSAR && currentClose < currentSAR) {
                trendReversal = true;
                result += `날짜 ${recentData[i].date}에 <strong>하락 추세로의 반전</strong> 신호가 발생했습니다.<br/>`;
                break;
            }
        }

        if (!trendReversal) {
            result += '최근 기간 동안 추세 반전 신호가 없습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (sarData.length > 0) {
            const result = analyzeTrendDirection(sarData);
            setAnalysisResult(result);
        }
    }, [sarData]);

    return (
        <div>
            <FetchSARData stockCode={stockCode} onSARFetch={setSARData} />
            <h4>Parabolic SAR 추세 방향 분석</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default SARAnalysis1;