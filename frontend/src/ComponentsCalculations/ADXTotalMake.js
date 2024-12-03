import React, { useState, useEffect } from 'react';
import ADXreturn from "./ADXreturn";
import ADXCalculations2 from "./ADXCalculations2";
import ADXCalculations3 from "./ADXCalculations3";
import ADXCalculations4 from "./ADXCalculations4";

function ADXTotalMake({ stockCode, onResultUpdate }) {
    const [ADXScore1, setADXScore1] = useState(null);
    const [ADXScore2, setADXScore2] = useState(null);
    const [ADXScore3, setADXScore3] = useState(null);
    const [ADXScore4, setADXScore4] = useState(null);

    // 중요도 설정 (가중치)
    const weights = {
        adx1: 3,
        adx2: 2,
        adx3: 1,
        adx4: 2,
    };

    const totalScore = (
        ((ADXScore1?.score || 0) * weights.adx1) +
        (ADXScore2 * weights.adx2 || 0) +
        (ADXScore3 * weights.adx3 || 0) +
        (ADXScore4 * weights.adx4 || 0)
    );

    const totalWeight = (
        (ADXScore1 !== null ? weights.adx1 : 0) +
        (ADXScore2 !== null ? weights.adx2 : 0) +
        (ADXScore3 !== null ? weights.adx3 : 0) +
        (ADXScore4 !== null ? weights.adx4 : 0)
    );

    const averageScore = totalWeight > 0 ? (totalScore / totalWeight).toFixed(2) : null;

    // 추천 계산 함수
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
        if (onResultUpdate && ADXScore1 !== null && ADXScore1.avgADX !== undefined) {
            onResultUpdate({
                name: 'ADX(14, 14, 1)',
                value: ADXScore1.avgADX.toFixed(2), // 평균 ADX 값을 전달
                damm: averageScore,
                recommendation: finalRecommendation
            });
        }
    }, [ADXScore1, averageScore]);

    return (
        <div>
            <ADXreturn
                stockCode={stockCode}
                onScoreCalculated={(result) => {
                    setADXScore1(result); // { score, avgADX } 객체 저장
                }}
            />
            <ADXCalculations2 stockCode={stockCode} onScoreCalculated={setADXScore2} />
            <ADXCalculations3 stockCode={stockCode} onScoreCalculated={setADXScore3} />
            <ADXCalculations4 stockCode={stockCode} onScoreCalculated={setADXScore4} />
        </div>
    );
}

export default ADXTotalMake;