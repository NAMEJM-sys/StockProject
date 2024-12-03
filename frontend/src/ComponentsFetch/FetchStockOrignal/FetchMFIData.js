import React, { useState, useEffect} from "react";

function FetchMFIData({ stockCode, onMFIFetch}) {

    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/stock_mfi/${stockCode}/`)
                .then(response => {
                    if(!response.ok){
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if(onMFIFetch) {
                        onMFIFetch(data)
                    }
                })
                .catch(error => console.error("error fuck",error))
        }
    }, [stockCode])
    return null
}

export default FetchMFIData