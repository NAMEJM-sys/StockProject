import {useEffect} from 'react'

function FetchMFICalculation({stockCode, onMFICalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_mfi/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onMFICalculationFetch) onMFICalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchMFICalculation;