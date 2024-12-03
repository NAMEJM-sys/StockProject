import {useEffect} from 'react'

function FetchEMA100Calculation({stockCode, onEMACalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_ema100/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onEMACalculationFetch) onEMACalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchEMA100Calculation;