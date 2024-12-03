import {useEffect} from 'react'

function FetchSARCalculation({stockCode, onSARCalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_sar/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onSARCalculationFetch) onSARCalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchSARCalculation;