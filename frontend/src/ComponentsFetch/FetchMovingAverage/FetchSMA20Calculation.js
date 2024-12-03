import {useEffect} from 'react'

function FetchSMA20Calculation({stockCode, onSMACalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_sma20/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onSMACalculationFetch) onSMACalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchSMA20Calculation;