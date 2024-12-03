import {useEffect} from 'react'

function FetchStochasticCalculation({stockCode, onStochasticCalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_stochastic/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onStochasticCalculationFetch) onStochasticCalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchStochasticCalculation;