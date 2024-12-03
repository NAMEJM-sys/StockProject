import {useEffect} from "react";

function FetchChartRSIData({ stockCode, onChartRSIFetch }) {
    useEffect(() => {
        if (stockCode) {
            fetch(`http://127.0.0.1:8000/api/get_chart_RSI_data/${stockCode}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    if(onChartRSIFetch) {
                        onChartRSIFetch(data);
                    }
                })
                .catch(error => console.error('Error fetching ChartRSI data', error));
        }
    }, [stockCode]);
    return null;
}

export default FetchChartRSIData;