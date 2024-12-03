import React, {useState, useEffect} from "react";

function FetchParabolicSARData({stockCode, onSARFetch }) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/stock_parabolicSAR/${stockCode}/`)
                .then(response => {
                    if(!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if(onSARFetch) {
                        onSARFetch(data);
                    }
                })
                .catch(error => console.error('Error Fucking', error))
        }
    }, [stockCode])
    return null;
}

export default FetchParabolicSARData