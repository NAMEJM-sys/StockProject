import {useEffect} from 'react'

function FetchFinalCalculation({stockCode, onFinalCalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_final_average/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onFinalCalculationFetch) onFinalCalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchFinalCalculation;