import {useEffect} from "react";

function FetchChartMACDData({stockCode, onChartMACDFetch}) {
    useEffect(() => {
        if(stockCode) {
            fetch(`http://127.0.0.1:8000/api/get_chart_MACD_data/${stockCode}/`)
                .then(res => res.json())
                .then(data => {if(onChartMACDFetch) onChartMACDFetch(data);
                console.log(data)})
                .catch(e => e);
        }
    }, [stockCode]);
    return null;
}

export default FetchChartMACDData;