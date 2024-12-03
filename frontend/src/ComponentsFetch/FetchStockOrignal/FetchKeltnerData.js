import React, {useState, useEffect} from "react";

function FetchKeltnerData({ stockCode, onKelFetch }){

    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/get_stock_Keltner/${stockCode}/`)
                .then(response => {
                    if(!response.ok) {
                        throw new Error('Network response was not ok');
                }
                return response.json();
                })
                .then(data => {
                    if(onKelFetch) {
                        onKelFetch(data)
                    }
                })
                .catch(error => console.error('Error fetching Keltner data:', error))
        }
    }, [stockCode])
    return null;
}
export default FetchKeltnerData;