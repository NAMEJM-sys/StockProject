import {useEffect} from 'react'

function FetchMovingAveragesCalculation({stockCode, onMovingAveragesFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/calculation_total_movingAverages/${stockCode}/`)
                .then(response => response.json())
                .then(data => {if(onMovingAveragesFetch) onMovingAveragesFetch(data)
                console.log(data)})
                .catch(error => console.error('Error Stock Data:', error));
        }
    }, [stockCode]);
    return null;
}
export default FetchMovingAveragesCalculation;