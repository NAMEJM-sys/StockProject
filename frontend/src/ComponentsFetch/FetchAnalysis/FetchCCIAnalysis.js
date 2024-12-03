import React, {useEffect, useState} from "react";

function FetchCCIAnalysis({ stockCode, selectedAnalysis}) {
    const [analysisResult, setAnalysisResult] = useState(null);  // 분석 결과 저장할 상태

    useEffect(() => {
        const query = selectedAnalysis.join(',');
        fetch(`http://127.0.0.1:8000/api/analyze_cci/${stockCode}/?analysis=${query}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setAnalysisResult(data);
            }).catch(error => {console.error('Error fetching CCI analysis data.', error);})
    },[stockCode])

    if (!analysisResult) {
        return <div>로딩 중...</div>;
    }

    const renderCCIAnalysis1 = (analysisData) => {
        const {current_cci, cciState, priceTrendDirection, cciTrendDirection, currentCCI_MACrossover } = analysisData;

        let result = `<strong>현재 MFI: </strong>${current_cci.toFixed(2)} (${cciState})<br/>`;
        result += `ㆍ가격 흐름: ${priceTrendDirection} 추세<br/>`;
        result += `ㆍCCI 흐름: ${cciTrendDirection} 추세<br/>`;
        result += `ㆍCCI 이동평균 교차 신호: ${currentCCI_MACrossover === 1 ? '골든 크로스' : '데드 크로스'} 추세<br/><br/>`;

        if (currentCCI_MACrossover === 1) {
            result += "CCI 단기 이동평균이 장기 이동평균을 상향 돌파했습니다 (골든 크로스). 상승 추세 가능성이 있습니다.<br/><br/>";
        } else if (currentCCI_MACrossover === -1) {
            result += "CCI 단기 이동평균이 장기 이동평균을 하향 돌파했습니다 (데드 크로스). 하락 추세 가능성이 있습니다.<br/><br/>";
        } else {
            result += "CCI 이동평균에 특별한 교차 신호가 없습니다.<br/><br/>";
        }

        if (cciTrendDirection === '상승' && priceTrendDirection === '상승') {
            result += "MFI 가격 모두 상승세를 보이고 있습니다. 강한 상승 추세일 가능성이 큽니다.<br/>";
        } else if (cciTrendDirection === '하락' && priceTrendDirection === '하락') {
            result += "MFI 가격 모두 하락세를 보이고 있습니다. 하락 추세가 강화될 가능성이 있습니다.<br/>";
        } else if (cciTrendDirection === '상승' && priceTrendDirection === '하락') {
            result += "가격은 하락 중이나 CCI 상승세를 보이고 있습니다. 이는 가격 반등 가능성을 시사할 수 있습니다.<br/>";
        } else if (cciTrendDirection === '하락' && priceTrendDirection === '상승') {
            result += "가격은 상승 중이나 CCI 하락세를 보이고 있습니다. 이는 상승 추세가 약화될 수 있음을 나타냅니다.<br/>";
        }

        return result;
    };

    const renderCCIAnalysis2 = (analysisData) => {
        const {priceLows, priceHighs, cciLows, cciHighs} = analysisData;
        let result = '';

        if (priceLows.length >= 2 && cciLows.length >= 2) {
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentPriceLow = priceLows[priceLows.length - 1];

            const prevCCILow = cciLows.find(cci => cci.date === prevPriceLow.date);
            const recentCCILow = cciLows.find(cci => cci.date === recentPriceLow.date);

            if (prevCCILow && recentCCILow && recentPriceLow.value < prevPriceLow.value && recentCCILow.value > prevCCILow.value) {
                result += `상승 다이버전스 감지: 주가는 더 낮은 저점을 형성했지만, CCI는 더 높은 저점을 형성했습니다. 이는 매수 신호일 수 있습니다.<br/>`;
            }
        }

        if (priceHighs.length >= 2 && cciHighs.length >= 2) {
            const prevPriceHigh = priceHighs[priceHighs.length - 2];
            const recentPriceHigh = priceHighs[priceHighs.length - 1];

            const prevCCIHigh = cciHighs.find(cci => cci.date === prevPriceHigh.date);
            const recentCCIHigh = cciHighs.find(cci => cci.date === recentPriceHigh.date);

            if (prevCCIHigh && recentCCIHigh && recentPriceHigh.value > prevPriceHigh.value && recentCCIHigh.value < prevCCIHigh.value) {
                result += `하락 다이버전스 감지: 주가는 더 높은 고점을 형성했지만, CCI 더 낮은 고점을 형성했습니다. 이는 매도 신호일 수 있습니다.<br/>`;
            }
        }

        if (!result) {
            result = "현재 다이버전스가 감지되지 않았습니다. 지속적인 모니터링이 필요합니다.";
        }

        return result;
    }

    const renderCCIAnalysis3 = (analysisData) => {
        const { avg_volatility, current_volatility, is_high_volatility, current_z_score } = analysisData;

        let result = "";

        if (is_high_volatility) {
            result += `현재 CCI 변동성이 평균(${avg_volatility.toFixed(2)})보다 높습니다 (${current_volatility.toFixed(2)}). 이는 시장 변동성이 증가했음을 의미합니다.<br/><br/>`;
        } else {
            result += `현재 CCI 변동성이 평균(${avg_volatility.toFixed(2)})보다 낮습니다 (${current_volatility.toFixed(2)}). 시장이 안정적입니다.<br/><br/>`;
        }

        if (Math.abs(current_z_score) > 2) {
            result += `CCI Z-스코어가 ${current_z_score.toFixed(2)}로 2를 초과합니다. 이는 이상치가 발생했을 수 있으며, 잠재적인 추세 전환 신호일 수 있습니다.<br/><br/>`;
        } else {
            result += `CCI Z-스코어가 ${current_z_score.toFixed(2)}로 정상 범위 내에 있습니다.<br/><br/>`;
        }

        if (is_high_volatility && Math.abs(current_z_score) <= 2) {
            result += "시장 변동성이 높아졌지만, Z-스코어가 정상 범위 내에 있어 극단적인 변동성이나 추세 전환은 발생하지 않았습니다.<br/>";
        } else if (!is_high_volatility && Math.abs(current_z_score) <= 2) {
            result += "현재 시장은 변동성이 낮고 안정적인 상태입니다. 큰 가격 변동이나 추세 전환 가능성은 적습니다.<br/>";
        } else if (is_high_volatility && Math.abs(current_z_score) > 2) {
            result += "변동성이 높고 Z-스코어가 2를 초과하여 급격한 가격 변화나 추세 전환 가능성이 있습니다. 주의가 필요합니다.<br/>";
        }

        return result;
    };

    const renderCCIAnalysis4 = (analysisData) => {
        const { current_cci, closest_fib_level, closest_fib_value, closest_fib_description, message } = analysisData;

        return (
            <>
                <h4>CCI 피보나치 되돌림 분석</h4>
                <p><strong>현재 CCI:</strong> {current_cci.toFixed(2)}</p>
                <p>ㆍ{closest_fib_level}: {closest_fib_value.toFixed(2)} - {closest_fib_description}</p><br/>
                <p><strong>※추가 분석:</strong> {message}</p>
            </>
        );
    };

    return (
        <div>
            {selectedAnalysis.includes('1') && analysisResult.cci_analysis1 && (
                <div>
                    <h4>CCI 기본 흐름 분석</h4>
                    <p dangerouslySetInnerHTML={{__html: renderCCIAnalysis1(analysisResult.cci_analysis1)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('2') && analysisResult.cci_analysis2 && (
                <div>
                    <h4>CCI 다이버전스 분석</h4>
                    <p dangerouslySetInnerHTML={{__html: renderCCIAnalysis2(analysisResult.cci_analysis2)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('3') && analysisResult.cci_analysis3 && (
                <div>
                    <h4>CCI 변동성 분석</h4>
                    <p dangerouslySetInnerHTML={{__html: renderCCIAnalysis3(analysisResult.cci_analysis3)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('4') && analysisResult.cci_analysis4 && (
                <div>
                    {renderCCIAnalysis4(analysisResult.cci_analysis4)}
                </div>
            )}
        </div>

    );
}

export default FetchCCIAnalysis