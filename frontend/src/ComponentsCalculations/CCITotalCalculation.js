import React, { useState,useEffect } from 'react';
import CCICalculations1 from './CCICalculations1';
import CCICalculations2 from './CCICalculations2';
import CCICalculations3 from './CCICalculations3';
import CCICalculations4 from './CCICalculations4';

function CCICombinedAnalysis({ stockCode, onResultUpdate }) {
    const [cciScore1, setCCIScore1] = useState(null);
    const [cciScore2, setCCIScore2] = useState(null);
    const [cciScore3, setCCIScore3] = useState(null);
    const [cciScore4, setCCIScore4] = useState(null);

    // 중요도 설정 (가중치)
    const weights = {
        cci1: 3, // Analysis1의 중요도를 높게 설정
        cci2: 2,
        cci3: 1,
        cci4: 2,
    };

    // 총점 계산
    const totalScore = (
        ((cciScore1?.score  || 0 )* weights.cci1) +
        (cciScore2 * weights.cci2 || 0) +
        (cciScore3 * weights.cci3 || 0) +
        (cciScore4 * weights.cci4 || 0)
    );

    const totalWeight = (
        (cciScore1 !== null ? weights.cci1 : 0) +
        (cciScore2 !== null ? weights.cci2 : 0) +
        (cciScore3 !== null ? weights.cci3 : 0) +
        (cciScore4 !== null ? weights.cci4 : 0)
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
        if(onResultUpdate && cciScore1 !== null && cciScore1 .currentCCI !== undefined) {
            onResultUpdate({
                name: 'CCI(20)',
                value: cciScore1.currentCCI.toFixed(2),
                damm: averageScore,
                recommendation: finalRecommendation
            });
        }
    }, [cciScore1, averageScore])

    return (
        <div>
            <CCICalculations1 stockCode={stockCode} onScoreCalculated={(result) => {setCCIScore1(result)}}/>
            <CCICalculations2 stockCode={stockCode} onScoreCalculated={setCCIScore2} />
            <CCICalculations3 stockCode={stockCode} onScoreCalculated={setCCIScore3} />
            <CCICalculations4 stockCode={stockCode} onScoreCalculated={setCCIScore4} />
        </div>
    );
}

export default CCICombinedAnalysis;