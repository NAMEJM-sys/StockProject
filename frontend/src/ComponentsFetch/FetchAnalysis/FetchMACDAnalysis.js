import React, { useState, useEffect } from 'react';

function FetchMACDAnalysis({ stockCode, selectedAnalysis }) {
    const [analysisResult, setAnalysisResult] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const query = selectedAnalysis.join(',');
        fetch(`http://127.0.0.1:8000/api/analyze_macd/${stockCode}/?analysis=${query}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                setAnalysisResult(data);
            })
            .catch(error => {
                console.error('Error fetching MACD analysis:', error);
                setError('MACD 분석 데이터를 불러오는 중 문제가 발생했습니다.');
            });
    }, [stockCode]);

    if (!analysisResult) {
        return <div>로딩 중...</div>;
    }

    const renderMACDAnalysis1 = (analysisData) => {
        const { macd, signal, histogram, cross_up, cross_down, is_hist_increasing, is_hist_decreasing, price_trend } = analysisData;

        let result = `<strong>MACD 분석 결과:</strong><br/>`;
        result += `ㆍMACD 값: ${macd.toFixed(2)}<br/>`;
        result += `ㆍSignal 값: ${signal.toFixed(2)}<br/>`;
        result += `ㆍHistogram 값: ${histogram.toFixed(2)}<br/><br/>`;

        if (cross_up) {
            result += '강한 매수 신호: MACD 라인이 시그널 라인을 아래에서 위로 교차했습니다 (골든 크로스).<br/>';
        } else if (cross_down) {
            result += '강한 매도 신호: MACD 라인이 시그널 라인을 위에서 아래로 교차했습니다 (데드 크로스).<br/>';
        } else {
            result += '현재 MACD와 Signal Line 사이에 특별한 교차 신호가 없습니다.<br/><br/>';
        }

        if (is_hist_increasing) {
            result += '히스토그램이 최근 3일 동안 증가하는 추세입니다.<br/>';
        } else if (is_hist_decreasing) {
            result += '히스토그램이 최근 3일 동안 감소하는 추세입니다.<br/>';
        } else {
            result += '히스토그램에 특별한 추세 변화가 감지되지 않았습니다.<br/>';
        }

        result += `현재 가격은 ${price_trend} 추세입니다.<br/>`;

        return result;
    };

    const renderMACDAnalysis2 = (analysisData) => {
        if (!analysisData) return null;  // 안전한 null 처리

        const { bullish_divergence, bearish_divergence } = analysisData;

        let result = `<strong>MACD 다이버전스 분석:</strong><br/>`;

        if (bullish_divergence) {
            result += '상승 다이버전스 발생: 가격은 하락 중이나 MACD는 상승하고 있습니다. 이는 매수 신호일 수 있습니다.<br/>';
        } else if (bearish_divergence) {
            result += '하락 다이버전스 발생: 가격은 상승 중이나 MACD는 하락하고 있습니다. 이는 매도 신호일 수 있습니다.<br/>';
        } else {
            result += '현재 MACD와 가격 간 다이버전스가 감지되지 않았습니다.<br/>';
        }
        return result;
    };

    const renderMACDAnalysis3 = (analysisData) => {
        const { current_histogram, prev_histogram, increasing_count, decreasing_count } = analysisData;

        let result = '<strong>단기 모멘텀 분석 (Histogram 기반)</strong><br/>';

        // Histogram이 0선을 상향 또는 하향 돌파할 때
        if (prev_histogram < 0 && current_histogram > 0) {
            result += '매수 모멘텀이 강화되고 있습니다. Histogram이 0선을 상향 돌파했습니다.<br/>';
        } else if (prev_histogram > 0 && current_histogram < 0) {
            result += '매도 모멘텀이 강화되고 있습니다. Histogram이 0선을 하향 돌파했습니다.<br/>';
        } else {
            result += 'Histogram이 0선 근처에서 움직이고 있습니다.<br/>';
        }

        // Histogram의 증감 추세 분석
        if (current_histogram > prev_histogram) {
            result += 'Histogram이 증가하고 있어 단기 모멘텀이 강화되는 추세입니다.<br/>';
        } else if (current_histogram < prev_histogram) {
            result += 'Histogram이 감소하고 있어 단기 모멘텀이 약화되는 추세입니다.<br/>';
        }

        // Histogram의 연속적인 증감 추세 분석
        if (increasing_count >= 3) {
            result += 'Histogram이 연속적으로 증가하여 단기 모멘텀 상승이 지속되고 있습니다.<br/>';
        } else if (decreasing_count >= 3) {
            result += 'Histogram이 연속적으로 감소하여 단기 모멘텀 하락이 지속되고 있습니다.<br/>';
        }

        return result;
    };

    const renderMACDAnalysis4 = (analysisData) => {
        if (!analysisData) return null;  // 안전한 null 처리

        const { short_macd, short_signal, long_macd, long_signal } = analysisData;

        let result = '<strong>장기 추세 분석 (다중 기간 MACD 기반)</strong><br/>';

        // 단기 MACD 분석
        if (short_macd > short_signal) {
            result += '단기 MACD (12, 26, 9): 상승 추세.<br/>';
        } else {
            result += '단기 MACD (12, 26, 9): 하락 추세.<br/>';
        }

        // 장기 MACD 분석
        if (long_macd > long_signal) {
            result += '장기 MACD (50, 100, 9): 상승 추세.<br/><br/>';
        } else {
            result += '장기 MACD (50, 100, 9): 하락 추세.<br/><br/>';
        }

        // 추세 일치 여부 확인
        if (short_macd > short_signal) {
            if (long_macd > long_signal) {
                result += '단기 및 장기 모두 상승 추세에 있습니다. 이는 강한 <strong>장기 모멘텀 상승</strong>을 의미합니다.<br/>';
            } else {
                result += '단기 상승 추세이지만 장기적으로는 하락 추세입니다. 이는 <strong>단기 반등</strong>일 수 있으며, 신중한 접근이 필요합니다.<br/>';
            }
        } else {
            if (long_macd > long_signal) {
                result += '단기 하락 추세이지만 장기적으로는 상승 추세입니다. 이는 <strong>단기 조정 국면</strong>일 수 있으며, 매수 기회를 모색할 수 있습니다.<br/>';
            } else {
                result += '단기 및 장기 모두 하락 추세에 있습니다. 이는 강한 <strong>장기 모멘텀 하락</strong>을 의미합니다.<br/>';
            }
        }

        return result;
    };

    const renderMACDAnalysis5 = (analysisData) => {
        if (!analysisData || analysisData.error) {
            return '<strong>데이터가 충분하지 않습니다.</strong>';
        }

        const { current_macd_change, avg_macd_change } = analysisData;

        let result = '<strong>추세의 힘 분석 (MACD 변화량 기반)</strong><br/>';

        if (current_macd_change > avg_macd_change) {
            result += `현재 MACD 변화량이 최근 평균보다 큽니다 (${current_macd_change.toFixed(4)} > ${avg_macd_change.toFixed(4)}).<br/>`;
            result += '이는 추세의 힘이 강해지고 있음을 나타냅니다.<br/>';
        } else {
            result += `현재 MACD 변화량이 최근 평균보다 작습니다 (${current_macd_change.toFixed(4)} ≤ ${avg_macd_change.toFixed(4)}).<br/>`;
            result += '이는 추세의 힘이 약해지고 있음을 나타냅니다.<br/>';
        }

        return result;
    };

    return (
        <div>
            {selectedAnalysis.includes('1') && analysisResult.macd_analysis1 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderMACDAnalysis1(analysisResult.macd_analysis1)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('2') && analysisResult.macd_analysis2 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderMACDAnalysis2(analysisResult.macd_analysis2)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('3') && analysisResult.macd_analysis3 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderMACDAnalysis3(analysisResult.macd_analysis3)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('4') && analysisResult.macd_analysis4 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderMACDAnalysis4(analysisResult.macd_analysis4)}}></p>
                </div>
            )}
            {selectedAnalysis.includes('5') && analysisResult.macd_analysis5 && (
                <div>
                    <p dangerouslySetInnerHTML={{__html: renderMACDAnalysis5(analysisResult.macd_analysis5)}}></p>
                </div>
            )}
        </div>
    );
}

export default FetchMACDAnalysis;