import {useEffect} from "react";

function FetchStockList({ onListFetch}) {
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/stock_list/')
            .then(response => response.json())
            .then(data => {
                if(onListFetch){
                    onListFetch(data);
                }
            })
            .catch(error => console.error('Error Stock Data:', error));
    }, [])
    return null;
}

export default FetchStockList