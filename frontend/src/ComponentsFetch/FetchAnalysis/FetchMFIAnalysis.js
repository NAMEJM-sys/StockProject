import React, {useEffect, useState} from "react";

function FetchMFIAnalysis({ stockCode, selectedAnalysis}) {
    const [analysisResult, setAnalysisResult] = useState(null);  // 분석 결과 저장할 상태
    const [error, setError] = useState(null);  // 에러 메시지를 저장할 상태

    useEffect(() => {
        const query = selectedAnalysis.join(',');
        fetch(`http://127.0.0.1:8000/api/analyze_mfi/${stockCode}/?analysis=${query}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setAnalysisResult(data);
            }).catch(error => {console.error('Error fetching MFI analysis data.', error);})
    },[stockCode])

    if (!analysisResult) {
        return <div>로딩 중...</div>;
    }

    const renderMFIAnalysis1 = (analysisData) => {
        const {current_mfi, mfiState, priceTrendDirection, mfiTrendDirection, currentMFI_MACrossover } = analysisData;

        let result = `<strong>현재 MFI: </strong>${current_mfi.toFixed(2)} (${mfiState})<br/>`;
        result += `ㆍ가격 흐름: ${priceTrendDirection} 추세<br/>`;
        result += `ㆍMFI 흐름: ${mfiTrendDirection} 추세<br/>`;
        result += `ㆍMFI 이동평균 교차 신호: ${currentMFI_MACrossover === 1 ? '골든 크로스' : '데드 크로스'} 추세<br/><br/>`;

        if (currentMFI_MACrossover === 1) {
            result += "MFI 단기 이동평균이 장기 이동평균을 상향 돌파했습니다 (골든 크로스). 상승 추세 가능성이 있습니다.<br/><br/>";
        } else if (currentMFI_MACrossover === -1) {
            result += "MFI 단기 이동평균이 장기 이동평균을 하향 돌파했습니다 (데드 크로스). 하락 추세 가능성이 있습니다.<br/><br/>";
        } else {
            result += "MFI 이동평균에 특별한 교차 신호가 없습니다.<br/><br/>";
        }

        if (mfiTrendDirection === '상승' && priceTrendDirection === '상승') {
            result += "MFI 가격 모두 상승세를 보이고 있습니다. 강한 상승 추세일 가능성이 큽니다.<br/>";
        } else if (mfiTrendDirection === '하락' && priceTrendDirection === '하락') {
            result += "MFI 가격 모두 하락세를 보이고 있습니다. 하락 추세가 강화될 가능성이 있습니다.<br/>";
        } else if (mfiTrendDirection === '상승' && priceTrendDirection === '하락') {
            result += "가격은 하락 중이나 MFI 상승세를 보이고 있습니다. 이는 가격 반등 가능성을 시사할 수 있습니다.<br/>";
        } else if (mfiTrendDirection === '하락' && priceTrendDirection === '상승') {
            result += "가격은 상승 중이나 MFI 하락세를 보이고 있습니다. 이는 상승 추세가 약화될 수 있음을 나타냅니다.<br/>";
        }

        return result;
    };

    const renderMFIAnalysis2 = (analysisData) => {
        const {priceLows, priceHighs, mfiLows, mfiHighs} = analysisData;
        let result = '';

        if (priceLows.length >= 2 && mfiLows.length >= 2) {
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentPriceLow = priceLows[priceLows.length - 1];

            const prevMFILow = mfiLows.find(mfi => mfi.date === prevPriceLow.date);
            const recentMFILow = mfiLows.find(mfi => mfi.date === recentPriceLow.date);

            if (prevMFILow && recentMFILow && recentPriceLow.value < prevPriceLow.value && recentMFILow.value > prevMFILow.value) {
                result += `상승 다이버전스 감지: 주가는 더 낮은 저점을 형성했지만, MFI는 더 높은 저점을 형성했습니다. 이는 매수 신호일 수 있습니다.<br/>`;
            }
            console.log(prevPriceLow,recentPriceLow,prevMFILow,recentMFILow)
        }

        if (priceHighs.length >= 2 && mfiHighs.length >= 2) {
            const prevPriceHigh = priceHighs[priceHighs.length - 2];
            const recentPriceHigh = priceHighs[priceHighs.length - 1];

            const prevMFIHigh = mfiHighs.find(mfi => mfi.date === prevPriceHigh.date);
            const recentMFIHigh = mfiHighs.find(mfi => mfi.date === recentPriceHigh.date);

            if (prevMFIHigh && recentMFIHigh && recentPriceHigh.value > prevPriceHigh.value && recentMFIHigh.value < prevMFIHigh.value) {
                result += `하락 다이버전스 감지: 주가는 더 높은 고점을 형성했지만, MFI는 더 낮은 고점을 형성했습니다. 이는 매도 신호일 수 있습니다.<br/>`;
            }
        }


        if (!result) {
            result = "현재 다이버전스가 감지되지 않았습니다. 지속적인 모니터링이 필요합니다.";
        }

        return result;
    }

    const renderMFIAnalysis3 = (analysisData) => {
        const { avg_volatility, current_volatility, is_high_volatility, current_z_score } = analysisData;

        let result = "";

        if (is_high_volatility) {
            result += `현재 MFI 변동성이 평균(${avg_volatility.toFixed(2)})보다 높습니다 (${current_volatility.toFixed(2)}). 이는 시장 변동성이 증가했음을 의미합니다.<br/><br/>`;
        } else {
            result += `현재 MFI 변동성이 평균(${avg_volatility.toFixed(2)})보다 낮습니다 (${current_volatility.toFixed(2)}). 시장이 안정적입니다.<br/><br/>`;
        }

        if (Math.abs(current_z_score) > 2) {
            result += `MFI Z-스코어가 ${current_z_score.toFixed(2)}로 2를 초과합니다. 이는 이상치가 발생했을 수 있으며, 잠재적인 추세 전환 신호일 수 있습니다.<br/><br/>`;
        } else {
            result += `MFI Z-스코어가 ${current_z_score.toFixed(2)}로 정상 범위 내에 있습니다.<br/><br/>`;
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

    const renderMFIAnalysis4 = (analysisData) => {
        const { current_mfi, closest_fib_level, closest_fib_value, closest_fib_description, message } = analysisData;

        return (
            <>
                <h4>MFI 피보나치 되돌림 분석</h4>
                <p><strong>현재 MFI:</strong> {current_mfi.toFixed(2)}</p>
                <p>ㆍ{closest_fib_level}: {closest_fib_value.toFixed(2)} - {closest_fib_description}</p><br/>
                <p><strong>※추가 분석:</strong> {message}</p>
            </>
        );
    };

    return (
        <div>
            {selectedAnalysis.includes('1') && analysisResult.mfi_analysis1 && (
                <div>
                    <h4>MFI 기본 흐름 분석</h4>
                    <p dangerouslySetInnerHTML={{__html: renderMFIAnalysis1(analysisResult.mfi_analysis1)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('2') && analysisResult.mfi_analysis2 && (
                <div>
                    <h4>MFI 다이버전스 분석</h4>
                    <p dangerouslySetInnerHTML={{__html: renderMFIAnalysis2(analysisResult.mfi_analysis2)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('3') && analysisResult.mfi_analysis3 && (
                <div>
                    <h4>MFI 변동성 분석</h4>
                    <p dangerouslySetInnerHTML={{__html: renderMFIAnalysis3(analysisResult.mfi_analysis3)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('4') && analysisResult.mfi_analysis4 && (
                <div>
                    {renderMFIAnalysis4(analysisResult.mfi_analysis4)}
                </div>
            )}
        </div>

    );
}

export default FetchMFIAnalysis