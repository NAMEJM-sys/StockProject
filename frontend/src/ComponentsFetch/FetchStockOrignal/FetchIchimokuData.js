import React, {useEffect} from "react";

function FetchIchimokuData ({ stockCode, onIchimokuFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/get_stock_ichimoku/${stockCode}/`)
                .then(response => {
                    if(!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json()
                })
                .then(data => {
                    if(onIchimokuFetch) {
                        onIchimokuFetch(data)
                    }
                }).catch(error => console.error("Ichimonu doesn't work now", error))
        }
    }, [stockCode])
    return null;
}

export default FetchIchimokuData