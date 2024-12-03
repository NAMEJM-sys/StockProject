import {useEffect} from "react";

function FetchChartStockDataForCode({ stockCode, onChartStockDataFetch }) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/get_chart_stock_data_for_code/${stockCode}/`)
                .then(response => {
                    if(!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if(onChartStockDataFetch) {
                        onChartStockDataFetch(data);
                    }
                }).catch(error => console.error('Error fetching stock data', error));
        }
    }, [stockCode]);
    return null;
}

export default FetchChartStockDataForCode;