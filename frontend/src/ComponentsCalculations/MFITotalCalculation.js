import React, { useState, useEffect } from 'react';
import MFICalculations1 from './MFICalculations1';
import MFICalculations2 from './MFICalculations2';
import MFICalculations3 from './MFICalculations3';
import MFICalculations4 from './MFICalculations4';

function MFICombinedAnalysis({ stockCode,onResultUpdate }) {
    const [mfiScore1, setMFIScore1] = useState(null);
    const [mfiScore2, setMFIScore2] = useState(null);
    const [mfiScore3, setMFIScore3] = useState(null);
    const [mfiScore4, setMFIScore4] = useState(null);

    // 중요도 설정 (가중치)
    const weights = {
        mfi1: 3, // 예: 중요도 3
        mfi2: 2,
        mfi3: 1,
        mfi4: 2,
    };

    // 총점 계산
    const totalScore = (
        ((mfiScore1?.overallScore || 0 ) * weights.mfi1) +
        (mfiScore2 * weights.mfi2 || 0) +
        (mfiScore3 * weights.mfi3 || 0) +
        (mfiScore4 * weights.mfi4 || 0)
    );

    const totalWeight = (
        (mfiScore1 !== null ? weights.mfi1 : 0) +
        (mfiScore2 !== null ? weights.mfi2 : 0) +
        (mfiScore3 !== null ? weights.mfi3 : 0) +
        (mfiScore4 !== null ? weights.mfi4 : 0)
    );

    const averageScore = totalWeight > 0 ? (totalScore / totalWeight): null;


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
        if(onResultUpdate && mfiScore1 !== null && mfiScore1.currentMFI !== undefined) {
            onResultUpdate({
                name: 'MFI(14)',
                value: mfiScore1.currentMFI.toFixed(2),
                damm: averageScore?.toFixed(2),
                recommendation: finalRecommendation
            });
        }
    }, [mfiScore1, averageScore])
    return (
        <div>
            <MFICalculations1 stockCode={stockCode} onScoreCalculated={(result) => setMFIScore1(result)} />
            <MFICalculations2 stockCode={stockCode} onScoreCalculated={setMFIScore2} />
            <MFICalculations3 stockCode={stockCode} onScoreCalculated={setMFIScore3} />
            <MFICalculations4 stockCode={stockCode} onScoreCalculated={setMFIScore4} />

        </div>
    );
}

export default MFICombinedAnalysis;