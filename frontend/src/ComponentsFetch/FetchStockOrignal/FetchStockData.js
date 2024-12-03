import { useEffect } from "react";

function FetchStockData({ onDataFetch }) {
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/stock_data/')
            .then(response => response.json())
            .then(data => {
                if (onDataFetch) {
                    onDataFetch(data);
                }
            })
            .catch(error => console.error('Error Stock Data:', error));
    }, []);

    return null;
}

export default FetchStockData;