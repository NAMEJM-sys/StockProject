import React, { useState, useEffect } from 'react';
import FetchMomentumData from "../ComponentsFetch/FetchStockOrignal/FetchMomentumData";

function MomentumTotalCalculation({ stockCode, onResultUpdate }) {
    const [momentumData, setMomentumData] = useState(null);

    useEffect(() => {
        if (momentumData) {
            const recommendation = getRecommendation(momentumData.MOM_Score);

            if (onResultUpdate){
                onResultUpdate({
                    name: 'Momentum(10)',
                    value: momentumData.MOM,
                    damm: momentumData.MOM_Score,
                    recommendation: recommendation
                });
            }
        }
    }, [momentumData]);

    const getRecommendation = (score) => {
        if (score <= 2.0) {
            return '강한 매수';
        } else if (score <= 4.0) {
            return '매수';
        } else if (score <= 6.0) {
            return '보통';
        } else if (score <= 8.0) {
            return '매도';
        } else {
            return '강한 매도';
        }
    };

    return (
        <>
            <FetchMomentumData stockCode={stockCode} onMomentumFetch={(result) => setMomentumData(result)} />
        </>
    )
}
export default MomentumTotalCalculation;