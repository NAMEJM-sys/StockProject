import React, { useState, useEffect } from 'react';
import MACDCalculations1 from './MACDCalculations1';
import MACDCalculations2 from './MACDCalculations2';
import MACDCalculations3 from './MACDCalculations3';
import MACDCalculations4 from './MACDCalculations4';
import MACDCalculations5 from './MACDCalculations5';

function MACDCombinedAnalysis({ stockCode, onResultUpdate }) {
    const [macdScore1, setMACDScore1] = useState(null);
    const [macdScore2, setMACDScore2] = useState(null);
    const [macdScore3, setMACDScore3] = useState(null);
    const [macdScore4, setMACDScore4] = useState(null);
    const [macdScore5, setMACDScore5] = useState(null);

    // 중요도 설정 (가중치)
    const weights = {
        macd1: 3,
        macd2: 2,
        macd3: 1,
        macd4: 2,
        macd5: 1,
    };

    // 총점 계산
    const totalScore = (
        ((macdScore1?.score || 0 ) * weights.macd1) +
        (macdScore2 * weights.macd2 || 0) +
        (macdScore3 * weights.macd3 || 0) +
        (macdScore4 * weights.macd4 || 0) +
        (macdScore5 * weights.macd5 || 0)
    );

    const totalWeight = (
        (macdScore1 !== null ? weights.macd1 : 0) +
        (macdScore2 !== null ? weights.macd2 : 0) +
        (macdScore3 !== null ? weights.macd3 : 0) +
        (macdScore4 !== null ? weights.macd4 : 0) +
        (macdScore5 !== null ? weights.macd5 : 0)
    );

    const averageScore = totalWeight > 0 ? (totalScore / totalWeight).toFixed(2) : null;

    const getRecommendation = (averageScore) => {
        if (averageScore <= 2.0) {
            return '강한 매수';
        } else if (averageScore <= 4.0) {
            return '매수';
        } else if (averageScore <= 6.0) {
            return '보통';
        } else if (averageScore <= 8.0) {
            return '매도';
        } else {
            return '강한 매도';
        }
    };

    const finalRecommendation = averageScore !== null ? getRecommendation(averageScore) : '데이터 수집 중...';

    useEffect(() => {
        if(onResultUpdate && macdScore1 !== null && macdScore1.score !== undefined) {
            onResultUpdate({
                name: 'MACD(12, 26, close, 9)',
                value: macdScore1.currentMACD.toFixed(2),
                damm: averageScore,
                recommendation: finalRecommendation,
            })
        }
    }, [macdScore1, averageScore])

    return (
        <div>
            <MACDCalculations1 stockCode={stockCode} onScoreCalculated={(result) => {
                setMACDScore1(result);
            }} />
            <MACDCalculations2 stockCode={stockCode} onScoreCalculated={setMACDScore2} />
            <MACDCalculations3 stockCode={stockCode} onScoreCalculated={setMACDScore3} />
            <MACDCalculations4 stockCode={stockCode} onScoreCalculated={setMACDScore4} />
            <MACDCalculations5 stockCode={stockCode} onScoreCalculated={setMACDScore5} />

        </div>
    );
}

export default MACDCombinedAnalysis;