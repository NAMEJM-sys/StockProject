import React, { useState, useEffect } from 'react';
import RSICalculations1 from './RSICalculations1';
import RSICalculations2 from './RSICalculations2';
import RSICalculations3 from './RSICalculations3';
import RSICalculations4 from './RSICalculations4';
import RSICalculations5 from './RSICalculations5';

function RSITotalCalculation({ stockCode, onResultUpdate}) {
    const [rsiScore1, setRSIScore1] = useState(null);
    const [rsiScore2, setRSIScore2] = useState(null);
    const [rsiScore3, setRSIScore3] = useState(null);
    const [rsiScore4, setRSIScore4] = useState(null);
    const [rsiScore5, setRSIScore5] = useState(null);

    // 중요도 설정 (가중치)
    const weights = {
        rsi1: 3, // 예: 중요도 3
        rsi2: 2,
        rsi3: 1,
        rsi4: 2,
        rsi5: 2,
    };

    // 총점 계산
    const totalScore = (
        ((rsiScore1?.overallScore || 0 )* weights.rsi1) +
        (rsiScore2 * weights.rsi2 || 0) +
        (rsiScore3 * weights.rsi3 || 0) +
        (rsiScore4 * weights.rsi4 || 0) +
        (rsiScore5 * weights.rsi5 || 0)
    );


    const totalWeight = (
        (rsiScore1 !== null ? weights.rsi1 : 0) +
        (rsiScore2 !== null ? weights.rsi2 : 0) +
        (rsiScore3 !== null ? weights.rsi3 : 0) +
        (rsiScore4 !== null ? weights.rsi4 : 0) +
        (rsiScore5 !== null ? weights.rsi5 : 0)
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
        if(onResultUpdate && rsiScore1 !== null && rsiScore1.currentRSI !== undefined) {
            onResultUpdate({
                name: 'RSI(14)',
                value: rsiScore1.currentRSI.toFixed(2),
                damm: averageScore,
                recommendation: finalRecommendation
            })
        }
    }, [rsiScore1, averageScore])

    return (
        <div>
            <RSICalculations1 stockCode={stockCode}
                              onScoreCalculated={(result) => {
                                  setRSIScore1(result);
                              }} />
            <RSICalculations2 stockCode={stockCode} onScoreCalculated={setRSIScore2} />
            <RSICalculations3 stockCode={stockCode} onScoreCalculated={setRSIScore3} />
            <RSICalculations4 stockCode={stockCode} onScoreCalculated={setRSIScore4} />
            <RSICalculations5 stockCode={stockCode} onScoreCalculated={setRSIScore5} />
        </div>
    );
}

export default RSITotalCalculation;