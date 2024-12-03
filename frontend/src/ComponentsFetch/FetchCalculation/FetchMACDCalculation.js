import {useEffect} from 'react'

function FetchMACDCalculation({stockCode, onMACDCalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_macd/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onMACDCalculationFetch) onMACDCalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchMACDCalculation;