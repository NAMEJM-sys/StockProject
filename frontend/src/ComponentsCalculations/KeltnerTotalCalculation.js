import React, { useState, useEffect } from 'react';
import KeltnerCalculations1 from './KeltnerCalculations1';
import KeltnerCalculations2 from './KeltnerCalculations2';
import KeltnerCalculations3 from './KeltnerCalculations3';
import KeltnerCalculations4 from './KeltnerCalculations4';


function KeltnerTotalCalculation({ stockCode, onResultUpdate }) {
    const [keltnerScore1, setKeltnerScore1] = useState(null);
    const [keltnerScore2, setKeltnerScore2] = useState(null);
    const [keltnerScore3, setKeltnerScore3] = useState(null);
    const [keltnerScore4, setKeltnerScore4] = useState(null);

    // 중요도 설정 (가중치)
    const weights = {
        keltner1: 3, // 예: 중요도 3
        keltner2: 2,
        keltner3: 3,
        keltner4: 2,
    };

    // 총점 계산
    const totalScore = (
        ((keltnerScore1?.score || 0 ) * weights.keltner1) +
        (keltnerScore2 * weights.keltner2 || 0) +
        (keltnerScore3 * weights.keltner3 || 0) +
        (keltnerScore4 * weights.keltner4 || 0)
    );

    const totalWeight = (
        (keltnerScore1 !== null ? weights.keltner1 : 0) +
        (keltnerScore2 !== null ? weights.keltner2 : 0) +
        (keltnerScore3 !== null ? weights.keltner3 : 0) +
        (keltnerScore4 !== null ? weights.keltner4 : 0)
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
        if(onResultUpdate && keltnerScore1 !== null && keltnerScore1.middleLine !== undefined) {
            onResultUpdate({
                name: 'Keltner Channel(20, 2)',
                value: keltnerScore1.middleLine.toFixed(2),
                damm: averageScore,
                recommendation: finalRecommendation
            });
        }
    }, [keltnerScore1, averageScore])
    return (
        <div>
            <KeltnerCalculations1 stockCode={stockCode} onScoreCalculated={(result) => {setKeltnerScore1(result)}} />
            <KeltnerCalculations2 stockCode={stockCode} onScoreCalculated={setKeltnerScore2} />
            <KeltnerCalculations3 stockCode={stockCode} onScoreCalculated={setKeltnerScore3} />
            <KeltnerCalculations4 stockCode={stockCode} onScoreCalculated={setKeltnerScore4} />
        </div>
    );
}

export default KeltnerTotalCalculation;