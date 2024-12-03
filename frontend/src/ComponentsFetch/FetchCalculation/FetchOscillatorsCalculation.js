import {useEffect} from 'react'

function FetchOscillatorsCalculation({stockCode, onOscillatorCalculationFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_total_oscillators/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onOscillatorCalculationFetch) onOscillatorCalculationFetch(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchOscillatorsCalculation;