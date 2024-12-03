import React, {useEffect} from "react";

function FetchMACDData({ stockCode, onMACDFetch }) {

    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/stock_macd/${stockCode}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if (onMACDFetch) {
                        onMACDFetch(data);
                    }
                })
                .catch(error => console.error('Error Fucking', error));
        }
    }, [stockCode]);
    return null;
}

export default FetchMACDData;