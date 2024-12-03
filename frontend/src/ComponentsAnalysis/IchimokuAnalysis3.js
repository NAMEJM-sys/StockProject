import React, { useState, useEffect } from 'react';
import FetchIchimokuData from '../ComponentsFetch/FetchStockOrignal/FetchIchimokuData';

function IchimokuAnalysis3({ stockCode }) {
    const [ichimokuData, setIchimokuData] = useState([]);
    const [analysisResult, setAnalysisResult] = useState('');

    const analyzeChikouSpan = (data) => {
        if (data.length < 26) {
            return '데이터가 충분하지 않습니다.';
        }

        const lastIndex = data.length - 26; // Chikou Span은 26일 뒤로 이동

        if (lastIndex < 0) {
            return '데이터가 충분하지 않습니다.';
        }

        const currentData = data[lastIndex];

        const chikouSpan = currentData.Chikou_Span;
        const currentClose = currentData.close;

        let result = '<strong>후행스팬을 통한 추세 확인</strong><br/><br/>';

        if (chikouSpan > currentClose) {
            result += '후행스팬이 현재 가격 위에 있어 <strong>상승 추세</strong>를 확인합니다.<br/>';
        } else if (chikouSpan < currentClose) {
            result += '후행스팬이 현재 가격 아래에 있어 <strong>하락 추세</strong>를 확인합니다.<br/>';
        } else {
            result += '후행스팬이 현재 가격과 동일하여 추세 판단이 어렵습니다.<br/>';
        }

        return result;
    };

    useEffect(() => {
        if (ichimokuData.length > 0) {
            const result = analyzeChikouSpan(ichimokuData);
            setAnalysisResult(result);
        }
    }, [ichimokuData]);

    return (
        <div>
            <FetchIchimokuData stockCode={stockCode} onIchimokuFetch={setIchimokuData} />
            <h4>Ichimoku Cloud 후행스팬 추세 확인</h4>
            <p dangerouslySetInnerHTML={{ __html: analysisResult }}></p>
        </div>
    );
}

export default IchimokuAnalysis3;