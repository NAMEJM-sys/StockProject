import {useEffect} from 'react'

function FetchCCICalculation({stockCode, onCCICalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_cci/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onCCICalculationFetch) onCCICalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchCCICalculation;