import React, { useState } from 'react';
import ADXCalculations1 from './ADXCalculations1';
import ADXCalculations2 from './ADXCalculations2';
import ADXCalculations3 from './ADXCalculations3';
import ADXCalculations4 from './ADXCalculations4';

function MACDCombinedAnalysis({ stockCode }) {
    const [adxScore1, setAXDScore1] = useState(null);
    const [adxScore2, setAXDScore2] = useState(null);
    const [adxScore3, setAXDScore3] = useState(null);
    const [adxScore4, setAXDScore4] = useState(null);


    // 중요도 설정 (가중치)
    const weights = {
        adx1: 3,
        adx2: 2,
        adx3: 1,
        adx4: 2,
    };

    // 총점 계산
    const totalScore = (
        (adxScore1 * weights.adx1 || 0) +
        (adxScore2 * weights.adx2 || 0) +
        (adxScore3 * weights.adx3 || 0) +
        (adxScore4 * weights.adx4 || 0)
    );

    const totalWeight = (
        (adxScore1 !== null ? weights.adx1 : 0) +
        (adxScore2 !== null ? weights.adx2 : 0) +
        (adxScore3 !== null ? weights.adx3 : 0) +
        (adxScore4 !== null ? weights.adx4 : 0)
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

    return (
        <div>
            <h3>adx 종합 분석 결과</h3>
            <ADXCalculations1 stockCode={stockCode} onScoreCalculated={setAXDScore1} />
            <ADXCalculations2 stockCode={stockCode} onScoreCalculated={setAXDScore2} />
            <ADXCalculations3 stockCode={stockCode} onScoreCalculated={setAXDScore3} />
            <ADXCalculations4 stockCode={stockCode} onScoreCalculated={setAXDScore4} />
            <p>
                <br />
                최종 추천: {finalRecommendation} {averageScore && `(${averageScore}점)`}
            </p>
        </div>
    );
}

export default MACDCombinedAnalysis;