import React, { useState, useEffect } from 'react';

function FetchIchimokuAnalysis({ stockCode, selectedAnalysis }) {
    const [analysisResult, setAnalysisResult] = useState(null);

    useEffect(() => {
        const query = selectedAnalysis.join(',');
        if (stockCode) {
            fetch(`http://127.0.0.1:8000/api/analyze_ichimoku/${stockCode}/?analysis=${query}`)
                .then((res) => res.json())
                .then(data => { if(setAnalysisResult) {setAnalysisResult(data) }})
                .catch(e => console.error('데이터를 불러오는 중 오류 발생:', e));
        }
    }, [stockCode])

    if(!analysisResult) {
        return <div>로딩 중...</div>;
    }

    const renderIchimokuAnalysis1 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { prev_tenkan, prev_kijun, current_tenkan, current_kijun } = analysisData;

        let result = '<strong>전환선과 기준선의 교차 분석</strong><br/><br/>';

        // 골든 크로스 확인 (매수 신호)
        if (prev_tenkan <= prev_kijun && current_tenkan > current_kijun) {
            result += '매수 신호 발생: 전환선이 기준선을 상향 돌파했습니다.<br/>';
        }
        // 데드 크로스 확인 (매도 신호)
        else if (prev_tenkan >= prev_kijun && current_tenkan < current_kijun) {
            result += '매도 신호 발생: 전환선이 기준선을 하향 돌파했습니다.<br/>';
        } else {
            result += '전환선과 기준선 사이에 교차 신호가 없습니다.<br/>';
        }

        return result;
    };

    const renderIchimokuAnalysis2 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { current_close, prev_close, senkou_a, senkou_b } = analysisData;

        let result = '<strong>가격과 구름대의 관계 분석</strong><br/><br/>';

        const upper_cloud = Math.max(senkou_a, senkou_b);
        const lower_cloud = Math.min(senkou_a, senkou_b);

        if (current_close > upper_cloud) {
            result += '가격이 구름대 위에 있어 <strong>상승 추세</strong>입니다.<br/>';
        } else if (current_close < lower_cloud) {
            result += '가격이 구름대 아래에 있어 <strong>하락 추세</strong>입니다.<br/>';
        } else {
            result += '가격이 구름대 내부에 있어 추세가 불확실합니다.<br/>';
        }

        // 구름대 돌파 여부 확인
        if (prev_close <= lower_cloud && current_close > upper_cloud) {
            result += '→ 가격이 구름대를 상향 돌파하여 강한 <strong>매수 신호</strong>입니다.<br/>';
        } else if (prev_close >= upper_cloud && current_close < lower_cloud) {
            result += '→ 가격이 구름대를 하향 돌파하여 강한 <strong>매도 신호</strong>입니다.<br/>';
        }

        return result;
    };

    const renderIchimokuAnalysis3 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { chikou_span, current_close } = analysisData;

        let result = '<strong>후행스팬을 통한 추세 확인</strong><br/><br/>';

        if (chikou_span > current_close) {
            result += '후행스팬이 현재 가격 위에 있어 <strong>상승 추세</strong>를 확인합니다.<br/>';
        } else if (chikou_span < current_close) {
            result += '후행스팬이 현재 가격 아래에 있어 <strong>하락 추세</strong>를 확인합니다.<br/>';
        } else {
            result += '후행스팬이 현재 가격과 동일하여 추세 판단이 어렵습니다.<br/>';
        }

        return result;
    };

    const renderIchimokuAnalysis4 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { senkou_a, senkou_b, cloud_colour, cloud_thickness, current_close } = analysisData;

        let result = '<strong>구름대의 두께와 색상 분석</strong><br/><br/>';

        result += `현재 구름대의 두께는 <strong>${cloud_thickness.toFixed(2)}</strong>입니다.<br/>`;

        if (cloud_thickness > (current_close * 0.03)) { // 구름대 두께가 가격의 3% 이상인 경우
            result += '→ 구름대가 두꺼워 강한 지지 또는 저항을 나타냅니다.<br/>';
        } else {
            result += '→ 구름대가 얇아 지지 또는 저항이 약할 수 있습니다.<br/>';
        }

        // 구름대 색상 분석
        if (cloud_colour === 'Bullish') {
            result += '구름대가 <strong>상승 구름</strong>으로 향후 상승 추세를 예상할 수 있습니다.<br/>';
        } else {
            result += '구름대가 <strong>하락 구름</strong>으로 향후 하락 추세를 예상할 수 있습니다.<br/>';
        }

        return result;
    };

    return (
        <div>
            {selectedAnalysis.includes('1') && analysisResult.ichimoku_analysis1 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderIchimokuAnalysis1(analysisResult.ichimoku_analysis1)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('2') && analysisResult.ichimoku_analysis2 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderIchimokuAnalysis2(analysisResult.ichimoku_analysis2)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('3') && analysisResult.ichimoku_analysis3 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderIchimokuAnalysis3(analysisResult.ichimoku_analysis3)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('4') && analysisResult.ichimoku_analysis4 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderIchimokuAnalysis4(analysisResult.ichimoku_analysis4)}}></p>
                </div>
            )}
        </div>
    );
}

export default FetchIchimokuAnalysis;