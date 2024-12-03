import React, {useEffect, useState} from 'react'

function FetchKeltnerAnalysis({ stockCode, selectedAnalysis }) {
    const [analysisResult, setAnalysisResult] = useState(null);  // 분석 결과 저장할 상태

    useEffect(() => {
        const query = selectedAnalysis.join(',');
        if (stockCode) {
            fetch(`http://127.0.0.1:8000/api/analyze_keltner/${stockCode}/?analysis=${query}`)
                .then((res) => res.json())
                .then(data => { if(setAnalysisResult) {setAnalysisResult(data)}})
                .catch(e => e);
        }
    }, [stockCode])

    if(!analysisResult) {
        return <div>로딩 중...</div>;
    }

    const renderKeltnerAnalysis1 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { channel_trend, price_position, angle } = analysisData;

        let result = '<strong>채널 기울기와 가격 위치를 통한 추세 분석</strong><br/><br/>';

        result += `채널의 기울기(angle): <strong>${angle.toFixed(2)}도</strong><br/>`;
        result += `현재 채널은 <strong>${channel_trend}</strong>입니다.<br/><br/>`;

        result += `가격이 ${price_position}에 위치해 있습니다.<br/>`;

        // 추가적인 설명 또는 신호 해석
        if (price_position === 'Upper Band 위') {
            result += '→ 강한 상승 모멘텀이 있습니다.<br/>';
        } else if (price_position === 'Lower Band 아래') {
            result += '→ 강한 하락 모멘텀이 있습니다. 신중한 접근이 필요합니다.<br/>';
        } else if (price_position === 'Middle Line 위') {
            result += '→ 상승 추세입니다.<br/>';
        } else if (price_position === 'Middle Line 아래') {
            result += '→ 하락 추세입니다.<br/>';
        } else {
            result += '→ 추세 판단이 어렵습니다.<br/>';
        }

        return result;
    };

    const renderKeltnerAnalysis2 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { channel_trend, signal } = analysisData;

        let result = '<strong>Trend Pullback 전략 분석</strong><br/><br/>';
        result += `현재 채널은 <strong>${channel_trend}</strong>입니다.<br/>`;
        if (signal) {
            result += `→ ${signal}<br/>`;
        } else {
            result += '→ 특별한 신호가 없습니다.<br/>';
        }

        return result;
    };

    const renderKeltnerAnalysis3 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { signal, angle } = analysisData;

        let result = '<strong>Break Out 전략 분석</strong><br/><br/>';
        result += `채널의 기울기(angle): <strong>${angle.toFixed(2)}도</strong><br/>`;
        result += `현재 신호: <strong>${signal}</strong><br/>`;

        return result;
    };

    const renderKeltnerAnalysis4 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { signal, angle } = analysisData;

        let result = '<strong>과매수/과매도 상태 분석 및 반전 가능성 평가</strong><br/><br/>';
        result += `채널의 기울기(angle): <strong>${angle.toFixed(2)}도</strong><br/>`;
        result += `현재 신호: <strong>${signal}</strong><br/>`;

        return result;
    };

    return (
        <div>
            {selectedAnalysis.includes('1') && analysisResult.keltner_analysis1 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderKeltnerAnalysis1(analysisResult.keltner_analysis1)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('2') && analysisResult.keltner_analysis2 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderKeltnerAnalysis2(analysisResult.keltner_analysis2)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('3') && analysisResult.keltner_analysis3 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderKeltnerAnalysis3(analysisResult.keltner_analysis3)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('4') && analysisResult.keltner_analysis4 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderKeltnerAnalysis4(analysisResult.keltner_analysis4)}}></p>
                </div>
            )}
        </div>
    )
}

export default FetchKeltnerAnalysis