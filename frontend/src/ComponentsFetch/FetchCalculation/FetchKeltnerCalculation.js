import {useEffect} from 'react'

function FetchKeltnerCalculation({stockCode, onKeltnerCalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_keltner/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onKeltnerCalculationFetch) onKeltnerCalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchKeltnerCalculation;