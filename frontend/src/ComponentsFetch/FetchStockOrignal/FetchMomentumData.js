import {useEffect} from "react";

function FetchMomentumData({ stockCode, onMomentumFetch }) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/get_stock_momentum/${stockCode}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    if(onMomentumFetch) {
                        onMomentumFetch(data);
                    }
                }).catch(error => console.error('Error fetching MomentumData', error));
        }
    }, [stockCode]);
}

export default FetchMomentumData;