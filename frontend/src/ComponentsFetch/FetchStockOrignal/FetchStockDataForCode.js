import {useEffect} from "react";

function FetchStockDataForCode({ stockCode, onSDFCFetch }){
    useEffect(() => {
        if (stockCode) {
            fetch(`http://127.0.0.1:8000/api/get_chart_stock_data_for_code/${stockCode}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (onSDFCFetch) {
                        onSDFCFetch(data)
                    }
                }).catch(error => console.error('Error fetching RSI data:', error))
        }
    }, [stockCode]);
    return null;
}

export default FetchStockDataForCode

