import React, {useEffect} from "react";

function FetchCCIData({ stockCode, onCCIFetch }) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/get_stock_cci/${stockCode}/`)
                .then(response => {
                    if(!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    if(onCCIFetch) {
                        onCCIFetch(data)
                    }
                })
                .catch(error => console.error("fetchCCI is not work", error));
        }
    }, [stockCode])
    return null;
}

export default FetchCCIData;