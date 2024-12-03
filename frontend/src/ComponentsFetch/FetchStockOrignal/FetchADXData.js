import React, { useEffect } from "react";

function FetchADXData({ stockCode, onADXFetch} ) {
    useEffect(() => {
        if (stockCode) {
        fetch(`http://127.0.0.1:8000/api/stock_adx/${stockCode}/`)
            .then(response => {
                if(!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                if(onADXFetch) {
                    onADXFetch(data);
                }
            })
            .catch(error => console.error('Error fetching ADX data:', error));
        }
    }, [stockCode]);

    return null;
}
export default FetchADXData;