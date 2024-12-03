import React, {useState, useEffect} from 'react'

function FetchSARAnalysis({ stockCode, selectedAnalysis }) {
    const [analysisResult, setAnalysisResult] = useState(null);  // 분석 결과 저장할 상태
    const [error, setError] = useState(null);  // 에러 메시지를 저장할 상태

    useEffect(() => {
        const query = selectedAnalysis.join(',');
        fetch(`http://127.0.0.1:8000/api/analyze_sar/${stockCode}/?analysis=${query}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            }).then(data => {
                setAnalysisResult(data);
        });
    }, [stockCode]);

    if (!analysisResult) {
        return <div>로딩 중...</div>;
    }

    const renderSARAnalysis1 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { trend, trend_reversal } = analysisData;

        let result = '<strong>추세 방향 및 반전 지점 식별</strong><br/><br/>';

        if (trend === "상승 추세") {
            result += `최근 기간 동안 가격이 SAR보다 위에 있어 <strong>상승 추세</strong>가 지속되고 있습니다.<br/><br/>`;
        } else if (trend === "하락 추세") {
            result += `최근 기간 동안 가격이 SAR보다 아래에 있어 <strong>하락 추세</strong>가 지속되고 있습니다.<br/><br/>`;
        } else {
            result += `최근 기간 동안 추세가 명확하지 않습니다. 변동성이 높을 수 있습니다.<br/><br/>`;
        }

        if (trend_reversal) {
            result += `날짜 ${trend_reversal.date}에 <strong>${trend_reversal.type}</strong> 신호가 발생했습니다.<br/>`;
        } else {
            result += '최근 기간 동안 추세 반전 신호가 없습니다.<br/>';
        }

        return result;
    };

    const renderSARAnalysis2 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { up_trend_days, down_trend_days } = analysisData;

        let result = '<strong>추세 지속성 분석</strong><br/><br/>';

        if (up_trend_days > 0) {
            result += `현재 <strong>${up_trend_days}일 연속</strong>으로 가격이 SAR보다 위에 있어 상승 추세가 지속되고 있습니다.<br/>`;
        } else if (down_trend_days > 0) {
            result += `현재 <strong>${down_trend_days}일 연속</strong>으로 가격이 SAR보다 아래에 있어 하락 추세가 지속되고 있습니다.<br/>`;
        } else {
            result += '현재 추세가 명확하지 않습니다. 변동성이 높을 수 있습니다.<br/>';
        }

        return result;
    };

    const renderSARAnalysis3 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { current_af, trend_strength } = analysisData;

        let result = '<strong>추세 강도 분석</strong><br/><br/>';

        result += `현재 가속 계수(AF) 값은 <strong>${current_af.toFixed(2)}</strong>입니다.<br/>`;

        if (trend_strength === '강화') {
            result += '최근 AF가 지속적으로 증가하여 추세 강도가 강화되고 있습니다.<br/>';
        } else if (trend_strength === '약화') {
            result += '최근 AF가 지속적으로 감소하여 추세 강도가 약화되고 있습니다.<br/>';
        } else {
            result += 'AF의 변화가 일정하지 않아 추세 강도의 변화가 명확하지 않습니다.<br/>';
        }

        return result;
    };

    const renderSARAnalysis4 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { price_trend, combined_signal } = analysisData;

        let result = '<strong>거짓 신호 필터링 및 종합 분석</strong><br/><br/>';

        if (price_trend === '상승 추세로 전환') {
            result += '최근 가격이 EMA를 상향 돌파하여 상승 추세로 전환되었습니다.<br/>';
        } else if (price_trend === '하락 추세로 전환') {
            result += '최근 가격이 EMA를 하향 돌파하여 하락 추세로 전환되었습니다.<br/>';
        } else if (price_trend === '상승 추세') {
            result += '현재 가격이 EMA보다 위에 있어 상승 추세입니다.<br/>';
        } else if (price_trend === '하락 추세') {
            result += '현재 가격이 EMA보다 아래에 있어 하락 추세입니다.<br/>';
        } else {
            result += '현재 가격이 EMA와 동일하여 추세 판단이 어렵습니다.<br/>';
        }

        if (combined_signal === '상승 추세 지지') {
            result += '→ Parabolic SAR과 EMA 모두 상승 추세를 지지하므로 신뢰도가 높습니다.<br/>';
        } else if (combined_signal === '하락 추세 지지') {
            result += '→ Parabolic SAR과 EMA 모두 하락 추세를 지지하므로 신뢰도가 높습니다.<br/>';
        } else {
            result += '→ Parabolic SAR과 EMA의 신호가 일치하지 않아 신중한 접근이 필요합니다.<br/>';
        }

        return result;
    };

    return (
        <div>
            {selectedAnalysis.includes('1') && analysisResult?.sar_analysis1 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderSARAnalysis1(analysisResult.sar_analysis1)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('2') && analysisResult?.sar_analysis2 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderSARAnalysis2(analysisResult.sar_analysis2)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('3') && analysisResult?.sar_analysis3 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderSARAnalysis3(analysisResult.sar_analysis3)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('4') && analysisResult?.sar_analysis4 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderSARAnalysis4(analysisResult.sar_analysis4)}}></p>
                </div>
            )}
        </div>
    )
}

export default FetchSARAnalysis