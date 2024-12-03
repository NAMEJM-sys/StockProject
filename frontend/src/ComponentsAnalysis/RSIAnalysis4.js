import React, { useEffect, useState } from "react";

function RSIAnalysis({ rsiData }) {
    const [signal, setSignal] = useState("특별한 추세가 없습니다.");
    const [periodAverages, setPeriodAverages] = useState({
        '7_day_avg': 0,
        '14_day_avg': 0,
        '30_day_avg': 0,
    });

    // Helper function to calculate period averages and trends
    const calculateAveragesAndTrends = (data, period) => {
        let avg = 0;
        let trend = 0;

        if (data.length >= period) {
            const recentData = data.slice(-period);
            avg = recentData.reduce((acc, val) => acc + val.RSI, 0) / period;
            trend = recentData[recentData.length - 1].RSI - recentData[0].RSI;
        }

        return { avg, trend };
    };

    // Function to generate trade signals
    const generateTradeSignal = (periodAverages, periodTrends) => {
        if (periodTrends['7_day_trend'] > 5 && periodAverages['7_day_avg'] > 50) {
            return "강력한 매수 신호 - 단기적으로 RSI가 급격히 상승 중입니다.";
        } else if (periodTrends['7_day_trend'] < -5 && periodAverages['7_day_avg'] < 50) {
            return "강력한 매도 신호 - 단기적으로 RSI가 급격히 하락 중입니다.";
        } else if (periodTrends['14_day_trend'] > 5 && periodAverages['14_day_avg'] > 50) {
            return "매수 신호 - 중기적으로 RSI가 꾸준히 상승 중입니다.";
        } else if (periodTrends['14_day_trend'] < -5 && periodAverages['14_day_avg'] < 50) {
            return "매도 신호 - 중기적으로 RSI가 꾸준히 하락 중입니다.";
        } else if (periodTrends['30_day_trend'] > 5 && periodAverages['30_day_avg'] > 50) {
            return "장기 매수 신호 - RSI가 장기간 상승 추세를 보이고 있습니다.";
        } else if (periodTrends['30_day_trend'] < -5 && periodAverages['30_day_avg'] < 50) {
            return "장기 매도 신호 - RSI가 장기간 하락 추세를 보이고 있습니다.";
        } else {
            return "특별한 추세가 없습니다.";
        }
    };

    useEffect(() => {
        if (rsiData && rsiData.length > 0) {
            const averages = {
                '7_day_avg': calculateAveragesAndTrends(rsiData, 7).avg,
                '14_day_avg': calculateAveragesAndTrends(rsiData, 14).avg,
                '30_day_avg': calculateAveragesAndTrends(rsiData, 30).avg,
            };

            const trends = {
                '7_day_trend': calculateAveragesAndTrends(rsiData, 7).trend,
                '14_day_trend': calculateAveragesAndTrends(rsiData, 14).trend,
                '30_day_trend': calculateAveragesAndTrends(rsiData, 30).trend,
            };

            setPeriodAverages(averages);

            const generatedSignal = generateTradeSignal(averages, trends);
            setSignal(generatedSignal);
        }
    }, [rsiData]);

    return (

        <div>
            <h4 className="analysis-text"> 기간별 분석 (7일, 14일, 30일) </h4>
            <p>최근 7일간 RSI 평균: <strong>{periodAverages['7_day_avg'].toFixed(2)}</strong></p>
            <p>최근 14일간 RSI 평균: <strong>{periodAverages['14_day_avg'].toFixed(2)}</strong></p>
            <p>최근 30일간 RSI 평균: <strong>{periodAverages['30_day_avg'].toFixed(2)}</strong></p>

            <p><br></br>트레이드 신호</p>
            <p>{signal}</p>
        </div>
    );
}

export default RSIAnalysis;