import React, { useState, useEffect } from 'react';

function FetchRSIAnalysis({ stockCode, selectedAnalysis}) {
    const [analysisResult, setAnalysisResult] = useState(null);  // 분석 결과 저장할 상태
    const [error, setError] = useState(null);  // 에러 메시지를 저장할 상태

    useEffect(() => {
        const query = selectedAnalysis.join(',');
        fetch(`http://127.0.0.1:8000/api/analyze_rsi/${stockCode}/?analysis=${query}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setAnalysisResult(data);  // 서버에서 받은 분석 결과를 저장
            })
            .catch(error => {
                console.error('Error fetching RSI analysis:', error);
                setError('RSI 분석 데이터를 불러오는 데 문제가 발생했습니다.');
            });
    }, [stockCode]);

    // 서버로부터 받은 데이터를 바탕으로 RSI 분석 결과 출력
    const renderRSIAnalysis1 = (analysisData) => {
        if (!analysisData) return null;  // 안전하게 null일 경우 처리
        const { currentRSI, rsiState, priceTrendDirection, rsiTrendDirection, currentRSI_MACrossover } = analysisData;

        let result = `<strong>현재 RSI:</strong> ${currentRSI.toFixed(2)} (${rsiState})<br/>`;
        result += `ㆍ 가격 흐름: ${priceTrendDirection} 추세<br/>`;
        result += `ㆍ RSI 흐름: ${rsiTrendDirection} 추세<br/>`;
        result += `ㆍ RSI 이동평균 교차 신호: ${currentRSI_MACrossover === 1 ? '골든 크로스' : '데드 크로스'}<br/><br/>`;

        if (currentRSI_MACrossover === 1) {
            result += "RSI 단기 이동평균이 장기 이동평균을 상향 돌파했습니다 (골든 크로스). 상승 추세 가능성이 있습니다.<br/><br/>";
        } else if (currentRSI_MACrossover === -1) {
            result += "RSI 단기 이동평균이 장기 이동평균을 하향 돌파했습니다 (데드 크로스). 하락 추세 가능성이 있습니다.<br/><br/>";
        } else {
            result += "RSI 이동평균에 특별한 교차 신호가 없습니다.<br/><br/>";
        }

        if (rsiTrendDirection === '상승' && priceTrendDirection === '상승') {
            result += "RSI와 가격 모두 상승세를 보이고 있습니다. 강한 상승 추세일 가능성이 큽니다.<br/>";
        } else if (rsiTrendDirection === '하락' && priceTrendDirection === '하락') {
            result += "RSI와 가격 모두 하락세를 보이고 있습니다. 하락 추세가 강화될 가능성이 있습니다.<br/>";
        } else if (rsiTrendDirection === '상승' && priceTrendDirection === '하락') {
            result += "가격은 하락 중이나 RSI는 상승세를 보이고 있습니다. 이는 가격 반등 가능성을 시사할 수 있습니다.<br/>";
        } else if (rsiTrendDirection === '하락' && priceTrendDirection === '상승') {
            result += "가격은 상승 중이나 RSI는 하락세를 보이고 있습니다. 이는 상승 추세가 약화될 수 있음을 나타냅니다.<br/>";
        }

        return result;
    };

    const renderRSIAnalysis2 = (analysisData) => {
        const { priceLows, priceHighs, rsiLows, rsiHighs } = analysisData;
        let result = '';

        // 상승 다이버전스 감지
        if (priceLows.length >= 2 && rsiLows.length >= 2) {
            const prevPriceLow = priceLows[priceLows.length - 2];
            const recentPriceLow = priceLows[priceLows.length - 1];

            const prevRSILow = rsiLows.find(rsi => rsi.date === prevPriceLow.date);
            const recentRSILow = rsiLows.find(rsi => rsi.date === recentPriceLow.date);

            if (prevRSILow && recentRSILow && recentPriceLow.value < prevPriceLow.value && recentRSILow.value > prevRSILow.value) {
                result += `상승 다이버전스 감지: 주가는 더 낮은 저점을 형성했지만, RSI는 더 높은 저점을 형성했습니다. 이는 매수 신호일 수 있습니다.<br/>`;
            }
        }

        // 하락 다이버전스 감지
        if (priceHighs.length >= 2 && rsiHighs.length >= 2) {
            const prevPriceHigh = priceHighs[priceHighs.length - 2];
            const recentPriceHigh = priceHighs[priceHighs.length - 1];

            const prevRSIHigh = rsiHighs.find(rsi => rsi.date === prevPriceHigh.date);
            const recentRSIHigh = rsiHighs.find(rsi => rsi.date === recentPriceHigh.date);

            if (prevRSIHigh && recentRSIHigh && recentPriceHigh.value > prevPriceHigh.value && recentRSIHigh.value < prevRSIHigh.value) {
                result += `하락 다이버전스 감지: 주가는 더 높은 고점을 형성했지만, RSI는 더 낮은 고점을 형성했습니다. 이는 매도 신호일 수 있습니다.<br/>`;
            }
        }

        if (!result) {
            result = "현재 다이버전스가 감지되지 않았습니다. 지속적인 모니터링이 필요합니다.";
        }

        return result;
    };

    const renderRSIAnalysis3 = (analysisData) => {
        const { avg_volatility, current_volatility, is_high_volatility, current_z_score } = analysisData;

        let result = "";

        if (is_high_volatility) {
            result += `현재 RSI 변동성이 평균(${avg_volatility.toFixed(2)})보다 높습니다 (${current_volatility.toFixed(2)}). 이는 시장 변동성이 증가했음을 의미합니다.<br/><br/>`;
        } else {
            result += `현재 RSI 변동성이 평균(${avg_volatility.toFixed(2)})보다 낮습니다 (${current_volatility.toFixed(2)}). 시장이 안정적입니다.<br/><br/>`;
        }

        if (Math.abs(current_z_score) > 2) {
            result += `RSI Z-스코어가 ${current_z_score.toFixed(2)}로 2를 초과합니다. 이는 이상치가 발생했을 수 있으며, 잠재적인 추세 전환 신호일 수 있습니다.<br/><br/>`;
        } else {
            result += `RSI Z-스코어가 ${current_z_score.toFixed(2)}로 정상 범위 내에 있습니다.<br/><br/>`;
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

    const renderRSIAnalysis4 = (analysisData) => {
        // analysisData에서 필요한 값 추출
        const {
            '7_day_avg': avg7Day,
            '14_day_avg': avg14Day,
            '30_day_avg': avg30Day,
            '7_day_trend': trend7Day,
            '14_day_trend': trend14Day,
            '30_day_trend': trend30Day
        } = analysisData;

        // null 값 체크 및 toFixed() 호출 전 처리
        const avg7DayFixed = avg7Day !== null ? avg7Day.toFixed(2) : "N/A";
        const avg14DayFixed = avg14Day !== null ? avg14Day.toFixed(2) : "N/A";
        const avg30DayFixed = avg30Day !== null ? avg30Day.toFixed(2) : "N/A";
        const trend7DayFixed = trend7Day !== null ? trend7Day.toFixed(2) : "N/A";
        const trend14DayFixed = trend14Day !== null ? trend14Day.toFixed(2) : "N/A";
        const trend30DayFixed = trend30Day !== null ? trend30Day.toFixed(2) : "N/A";

        // 트레이드 신호 로직
        let tradeSignal = "";

        if (trend7Day > 5 && avg7Day > 50) {
            tradeSignal = "강력한 매수 신호 - 단기적으로 RSI가 급격히 상승 중입니다.";
        } else if (trend7Day < -5 && avg7Day < 50) {
            tradeSignal = "강력한 매도 신호 - 단기적으로 RSI가 급격히 하락 중입니다.";
        } else if (trend14Day > 5 && avg14Day > 50) {
            tradeSignal = "매수 신호 - 중기적으로 RSI가 꾸준히 상승 중입니다.";
        } else if (trend14Day < -5 && avg14Day < 50) {
            tradeSignal = "매도 신호 - 중기적으로 RSI가 꾸준히 하락 중입니다.";
        } else if (trend30Day > 5 && avg30Day > 50) {
            tradeSignal = "장기 매수 신호 - RSI가 장기간 상승 추세를 보이고 있습니다.";
        } else if (trend30Day < -5 && avg30Day < 50) {
            tradeSignal = "장기 매도 신호 - RSI가 장기간 하락 추세를 보이고 있습니다.";
        } else {
            tradeSignal = "특별한 추세가 없습니다.";
        }

        // 결과를 HTML로 반환
        return (
            <>
                <p><strong>7일 평균 / 추세 RSI</strong>: {avg7DayFixed} / {trend7DayFixed}</p>
                <p><strong>14일 평균 / 추세 RSI: </strong> {avg14DayFixed} / {trend14DayFixed}</p>
                <p><strong>30일 평균 / 추세 RSI: </strong> {avg30DayFixed} / {trend30DayFixed}</p><br/>
                <p><strong>트레이드 신호:</strong> {tradeSignal}</p>
            </>
        );
    }

    const renderRSIAnalysis5 = (analysisData) => {
        const { current_rsi, closest_fib_level, closest_fib_value, closest_fib_description, message } = analysisData;

        return (
            <>
                <h4>RSI 피보나치 되돌림 분석</h4>
                <p><strong>현재 RSI:</strong> {current_rsi.toFixed(2)}</p>
                <p>ㆍ{closest_fib_level}: {closest_fib_value.toFixed(2)} - {closest_fib_description}</p><br/>
                <p><strong>※추가 분석:</strong> {message}</p>
            </>
        );
    };

    if (error) {
        return <div>{error}</div>;  // 에러가 발생한 경우 에러 메시지 표시
    }


    return (
        <div>
            {selectedAnalysis.includes('1') && analysisResult?.rsi_analysis1 && (
                <div>
                    <h4>RSI 기본 흐름 분석</h4>
                    <p dangerouslySetInnerHTML={{__html: renderRSIAnalysis1(analysisResult.rsi_analysis1)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('2') && analysisResult?.rsi_analysis2 && (
                <div>
                    <h4>RSI 다이버전스 분석</h4>
                    <p dangerouslySetInnerHTML={{__html: renderRSIAnalysis2(analysisResult.rsi_analysis2)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('3') && analysisResult?.rsi_analysis3 && (
                <div>
                    <h4>RSI 변동성 분석</h4>
                    <p dangerouslySetInnerHTML={{__html: renderRSIAnalysis3(analysisResult.rsi_analysis3)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('4') && analysisResult?.rsi_analysis4 && (
                <div>
                    <h4>기간별 분석 (7일, 14일, 30일)</h4>
                    {renderRSIAnalysis4(analysisResult.rsi_analysis4)}
                </div>
            )}
            {selectedAnalysis.includes('5') && analysisResult?.rsi_analysis5 && (
                <div>
                    {renderRSIAnalysis5(analysisResult.rsi_analysis5)}
                </div>
            )}
        </div>
    );
}

export default FetchRSIAnalysis;