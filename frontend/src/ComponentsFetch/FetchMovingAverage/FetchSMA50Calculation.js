import {useEffect} from 'react'

function FetchSMA50Calculation({stockCode, onSMACalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_sma50/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onSMACalculationFetch) onSMACalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchSMA50Calculation;