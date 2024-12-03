import {useEffect} from 'react'

function FetchRSICalculation({ stockCode, onRSICalculationFetch }) {
    useEffect(() => {
        fetch(`http://127.0.0.1:8000/api/calculation_rsi/${stockCode}/`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if(onRSICalculationFetch) {
                    onRSICalculationFetch(data)
                }
            }).catch(error => console.error('Error fetching RSICalculation data', error));
    }, [stockCode])
    return null;
}
export default FetchRSICalculation;