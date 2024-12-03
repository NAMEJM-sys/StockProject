import React, { useState, useEffect } from 'react';
import IchimokuCalculations1 from './IchimokuCalculations1';
import IchimokuCalculations2 from './IchimokuCalculations2';
import IchimokuCalculations3 from './IchimokuCalculations3';
import IchimokuCalculations4 from './IchimokuCalculations4';


function IchimokuTotalCalculation({ stockCode, onResultUpdate }) {
    const [ichmokuScore1, setIchimokuScore1] = useState(null);
    const [ichmokuScore2, setIchimokuScore2] = useState(null);
    const [ichmokuScore3, setIchimokuScore3] = useState(null);
    const [ichmokuScore4, setIchimokuScore4] = useState(null);

    // 중요도 설정 (가중치)
    const weights = {
        ichmoku1: 3, // 예: 중요도 3
        ichmoku2: 2,
        ichmoku3: 3,
        ichmoku4: 2,
    };

    // 총점 계산
    const totalScore = (
        ((ichmokuScore1?.score !== undefined ? ichmokuScore1.score : 5) * weights.ichmoku1) +
        ((ichmokuScore2 !== undefined ? ichmokuScore2 : 5) * weights.ichmoku2) +
        ((ichmokuScore3 !== undefined ? ichmokuScore3 : 5) * weights.ichmoku3) +
        ((ichmokuScore4 !== undefined ? ichmokuScore4 : 5) * weights.ichmoku4)
    );

    const totalWeight = (
        weights.ichmoku1 +
        weights.ichmoku2 +
        weights.ichmoku3 +
        weights.ichmoku4
    );

    const averageScore = totalWeight > 0 ? (totalScore / totalWeight) : null;

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
        if(onResultUpdate && ichmokuScore1 !== null && ichmokuScore1.prevKijun !== undefined) {
            onResultUpdate({
                name: 'Ichimoku Cloud(9, 26, 52, 26)',
                value: ichmokuScore1.prevKijun.toFixed(2),
                damm: averageScore,
                recommendation: finalRecommendation
            });
        }
    }, [averageScore])

    return (
        <div>
            <IchimokuCalculations1 stockCode={stockCode} onScoreCalculated={(result) => { setIchimokuScore1(result) }} />
            <IchimokuCalculations2 stockCode={stockCode} onScoreCalculated={setIchimokuScore2} />
            <IchimokuCalculations3 stockCode={stockCode} onScoreCalculated={setIchimokuScore3} />
            <IchimokuCalculations4 stockCode={stockCode} onScoreCalculated={setIchimokuScore4} />
        </div>
    );
}

export default IchimokuTotalCalculation;