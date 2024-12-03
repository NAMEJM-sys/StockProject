import React, { useEffect } from "react";

function FetchRSIData({ stockCode, onRSIFetch }) {

    useEffect(() => {
        if (stockCode) {
            fetch(`http://127.0.0.1:8000/api/stock_rsi/${stockCode}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (onRSIFetch) {
                        onRSIFetch(data);
                    }
                })
                .catch(error => console.error('Error fetching RSI data:', error));
        }
    }, [stockCode]);

    return null;
}

export default FetchRSIData;