import {useEffect} from "react";

function FetchLatestStockData({ onLSDFetch }) {
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/latest_stock_data/')
            .then(response => response.json())
            .then(data => {
                if(onLSDFetch){
                    onLSDFetch(data);
                }
            })
            .catch(error => console.error('Error Stock Data:', error));
    }, []);
    return null;
}
export default FetchLatestStockData;