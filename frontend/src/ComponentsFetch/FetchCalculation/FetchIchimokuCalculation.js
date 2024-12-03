import {useEffect} from 'react'

function FetchIchimokuCalculation({stockCode, onIchimokuCalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_ichimoku/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onIchimokuCalculationFetch) onIchimokuCalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchIchimokuCalculation;