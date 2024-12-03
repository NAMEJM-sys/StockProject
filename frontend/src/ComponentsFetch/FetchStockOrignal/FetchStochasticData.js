import {useEffect} from 'react'

function FetchStochasticData({ stockCode, onStochasticFetch }) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/get_stock_stochastic_k/${stockCode}/`)
                .then(response => {
                    if(!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json()
                })
                .then(data => {
                    if(onStochasticFetch) {
                        onStochasticFetch(data)
                    }
                }).catch(error => console.log("There is something wrong", error))
        }
    }, [stockCode])
    return null;
}
export default FetchStochasticData;