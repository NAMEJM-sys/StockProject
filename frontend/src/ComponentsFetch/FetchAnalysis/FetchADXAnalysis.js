import React, {useEffect, useState} from 'react'

function FetchADXAnalysis({ stockCode, selectedAnalysis }) {
    const [analysisResult, setAnalysisResult] = useState(null);  // 분석 결과 저장할 상태

    useEffect(() => {
        const query = selectedAnalysis.join(',');
        if (stockCode) {
            fetch(`http://127.0.0.1:8000/api/analyze_adx/${stockCode}/?analysis=${query}`)
                .then((res) => res.json())
                .then(data => { if(setAnalysisResult) {setAnalysisResult(data) }})
                .catch(e => e);
        }
    }, [stockCode])

    if(!analysisResult) {
        return <div>로딩 중...</div>;
    }

    const renderADXAnalysis1 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { avg_adx } = analysisData;

        let result = '<strong>추세 강도 분석</strong><br/><br/>';
        result += 'ADX는 추세의 강도를 나타내는 지표로, 값이 높을수록 강한 추세를 의미합니다.<br/><br/>';
        result += `최근 ADX의 평균 값은 <strong>${avg_adx.toFixed(2)}</strong>입니다.<br/>`;

        if (avg_adx >= 25) {
            result += '→ 이는 <strong>강한 추세</strong>가 진행 중임을 나타냅니다.<br/>';
        } else if (avg_adx <= 20) {
            result += '→ 이는 <strong>약한 추세</strong> 또는 <strong>횡보장</strong>임을 나타냅니다.<br/>';
        } else {
            result += '→ 이는 추세가 약하며, 추세 전환의 가능성이 있습니다.<br/>';
        }

        return result;
    };

    const renderADXAnalysis2 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { cross  } = analysisData;

        let result = '<strong>DI+와 DI- 교차 분석</strong><br/><br/>';
        result += 'DI+는 상승 압력을, DI-는 하락 압력을 나타냅니다. 두 지표의 교차를 통해 추세 전환 신호를 파악할 수 있습니다.<br/><br/>';

        if (cross === 'DI+ 상향 돌파') {
            result += '매수 신호 발생: DI+가 DI-를 상향 돌파했습니다.<br/>';
        } else if (cross === 'DI+ 하향 돌파') {
            result += '매도 신호 발생: DI+가 DI-를 하향 돌파했습니다.<br/>';
        } else {
            result += 'DI+와 DI- 사이에 특별한 교차 신호가 없습니다.<br/>';
        }

        return result;
    };

    const renderADXAnalysis3 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { adx_slope } = analysisData;

        let result = '<strong>ADX의 방향성 분석</strong><br/><br/>';
        result += 'ADX의 추세를 분석하여 추세의 강도가 강화되는지 약화되는지 판단합니다.<br/><br/>';

        if (adx_slope > 0) {
            result += '최근 ADX는 상승 추세에 있어 추세의 강도가 <strong>강화</strong>되고 있습니다.<br/>';
        } else if (adx_slope < 0) {
            result += '최근 ADX는 하락 추세에 있어 추세의 강도가 <strong>약화</strong>되고 있습니다.<br/>';
        } else {
            result += 'ADX의 추세 변화가 없어 추세의 강도가 유지되고 있습니다.<br/>';
        }

        return result;
    };

    const renderADXAnalysis4 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '데이터가 충분하지 않습니다.';
        }

        const { adx_ema, di_plus_ema, di_minus_ema, adx_slope } = analysisData;

        let result = '<strong>ADX 종합 분석</strong><br/><br/>';
        result += 'ADX는 추세의 강도를, DI+와 DI-는 추세의 방향을 나타냅니다. 이들을 종합하여 현재 시장의 추세를 판단합니다.<br/><br/>';

        result += `최근 ADX의 EMA 값은 <strong>${adx_ema.toFixed(2)}</strong>입니다.<br/>`;
        result += `DI+의 EMA 값은 <strong>${di_plus_ema.toFixed(2)}</strong>, DI-의 EMA 값은 <strong>${di_minus_ema.toFixed(2)}</strong>입니다.<br/><br/>`;

        // ADX 추세 방향
        if (adx_slope > 0) {
            result += 'ADX가 상승 추세에 있어 추세의 강도가 강화되고 있습니다.<br/>';
        } else if (adx_slope < 0) {
            result += 'ADX가 하락 추세에 있어 추세의 강도가 약화되고 있습니다.<br/>';
        } else {
            result += 'ADX의 추세 변화가 없어 추세의 강도가 유지되고 있습니다.<br/>';
        }

        // 종합적인 추세 판단
        if (adx_ema >= 25) {
            if (di_plus_ema > di_minus_ema) {
                result += '→ ADX가 높고 DI+ > DI-이므로 <strong>강한 상승 추세</strong>입니다.<br/>';
                result += '매수 기회를 고려해볼 수 있습니다.<br/>';
            } else if (di_plus_ema < di_minus_ema) {
                result += '→ ADX가 높고 DI+ < DI-이므로 <strong>강한 하락 추세</strong>입니다.<br/>';
                result += '매도 또는 관망을 고려해볼 수 있습니다.<br/>';
            } else {
                result += '→ ADX가 높지만 DI+와 DI-가 유사하여 방향성을 판단하기 어렵습니다.<br/>';
            }
        } else if (adx_ema <= 20) {
            result += '→ ADX가 낮아 추세가 약합니다. 횡보장으로 판단되며, 신중한 접근이 필요합니다.<br/>';
        } else {
            result += '→ 추세의 강도가 애매하므로 신중한 접근이 필요합니다.<br/>';
        }

        return result;
    };

    return (
        <div>
            {selectedAnalysis.includes('1') && analysisResult.adx_analysis1 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderADXAnalysis1(analysisResult.adx_analysis1)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('2') && analysisResult.adx_analysis2 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderADXAnalysis2(analysisResult.adx_analysis2)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('3') && analysisResult.adx_analysis3 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderADXAnalysis3(analysisResult.adx_analysis3)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('4') && analysisResult.adx_analysis4 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderADXAnalysis4(analysisResult.adx_analysis4)}}></p>
                </div>
            )}
        </div>
    )
}

export default FetchADXAnalysis