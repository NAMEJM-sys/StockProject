import React, {useState, useEffect} from "react";
import FetchMFIData from "../ComponentsFetch/FetchStockOrignal/FetchMFIData";

function MFIAnalysis4({ stockCode }) {
    const [MFIData, setMFIData] = useState([]);
    const [analysisResults, setAnalysisResults] = useState('');

    const analyzeMFIFibonacci = () => {
        if(MFIData.length === 0) {
            setAnalysisResults('There is not enough data');
            return;
        }

        const lastIndex = MFIData.length - 1;
        const currentMFI = MFIData[lastIndex].MFI;

        const fiblevels = [
            { level: 'Fib_23.6', value: MFIData[lastIndex]['Fib_23.6'], description: '약한 반등 가능성' },
            { level: 'Fib_38.2', value: MFIData[lastIndex]['Fib_38.2'], description: '조정이 일어날 수 있는 중요한 지점' },
            { level: 'Fib_50', value: MFIData[lastIndex]['Fib_50'], description: '강력한 지지 또는 저항이 될 수 있음' },
            { level: 'Fib_61.8', value: MFIData[lastIndex]['Fib_61.8'], description: '주요 반전 지점으로 인식됨' },
            { level: 'Fib_78.6', value: MFIData[lastIndex]['Fib_78.6'], description: '심한 조정이 끝나고 반전이 일어날 가능성이 큼' }
        ];

        let result = `<strong>현재 MFI:</strong> ${currentMFI.toFixed(2)}<br/>`;

        for(let i =0; i < fiblevels.length; i++) {
            const level = fiblevels[i];
            if(currentMFI >= level.value) {
                result += `MFI의 Fibonacci가 ${level.level}% 레벨 (${level.value.toFixed(2)}) 이상입니다.<br/><br/>`;
                result += `<strong>해석: </strong> ${level.description}<br><br>`
                break;
            }
        }

        if (currentMFI < fiblevels[0].value) {
            result += 'RSI가 피보나치 23.6% 아래로 떨어졌습니다. 이는 약세 신호일 수 있습니다.<br/>';
        } else if (currentMFI > fiblevels[4].value) {
            result += 'RSI가 피보나치 78.6% 이상입니다. 이는 강력한 반전이 일어날 가능성을 시사합니다.<br/>';
        }

        setAnalysisResults(result);
    };

    useEffect(() => {
        if(MFIData.length > 0) {
            analyzeMFIFibonacci();
        }
    },[MFIData])

    return (
        <div>
            <FetchMFIData stockCode={stockCode} onMFIFetch={setMFIData}/>
            <h4>RSI 피보나치 되돌림 분석</h4>
            <p dangerouslySetInnerHTML={{__html: analysisResults}}></p>
        </div>
    );
}

export default MFIAnalysis4;