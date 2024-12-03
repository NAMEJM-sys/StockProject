import {useEffect} from 'react'

function FetchADXCalculation({stockCode, onADXCalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_adx/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onADXCalculationFetch) onADXCalculationFetch(data)
                console.log(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchADXCalculation;