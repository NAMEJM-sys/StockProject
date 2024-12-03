import React, { useState, useEffect } from 'react';
import SARCalculations1 from './SARCalculations1';
import SARCalculations2 from './SARCalculations2';
import SARCalculations3 from './SARCalculations3';
import SARCalculations4 from './SARCalculations4';


function SARTotalCalculation({ stockCode, onResultUpdate }) {
    const [sarScore1, setSARScore1] = useState(null);
    const [sarScore2, setSARScore2] = useState(null);
    const [sarScore3, setSARScore3] = useState(null);
    const [sarScore4, setSARScore4] = useState(null);

    const weights = {
        sar1: 3,
        sar2: 2,
        sar3: 3,
        sar4: 2,
    };

    const totalScore = (
        ((sarScore1?.score || 5 ) * weights.sar1) +
        (sarScore2 * weights.sar2 || 5) +
        (sarScore3 * weights.sar3 || 5) +
        (sarScore4 * weights.sar4 || 5)
    );

    const totalWeight = (
        (sarScore1 !== null ? weights.sar1 : 0) +
        (sarScore2 !== null ? weights.sar2 : 0) +
        (sarScore3 !== null ? weights.sar3 : 0) +
        (sarScore4 !== null ? weights.sar4 : 0)
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
        if (onResultUpdate && sarScore1 !== null && sarScore1.currentSAR !== undefined) {
            onResultUpdate({
                name: 'Parabolic SAR(0.02, 0.02, 0.2)',
                value: sarScore1.currentSAR.toFixed(2),
                damm: averageScore,
                recommendation: finalRecommendation,
            });
        }
    }, [averageScore])

    return (
        <div>
            <SARCalculations1 stockCode={stockCode} onScoreCalculated={(result) => {
                setSARScore1(result)
            }} />
            <SARCalculations2 stockCode={stockCode} onScoreCalculated={setSARScore2} />
            <SARCalculations3 stockCode={stockCode} onScoreCalculated={setSARScore3} />
            <SARCalculations4 stockCode={stockCode} onScoreCalculated={setSARScore4} />

        </div>
    );
}

export default SARTotalCalculation;