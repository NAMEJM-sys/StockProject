import {useEffect} from "react";

function FetchChartCCIData({ stockCode, onChartCCIFetch }) {
    useEffect(() => {
        if (stockCode) {
            fetch(`http://127.0.0.1:8000/api/get_chart_CCI_data/${stockCode}/`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Network response was not ok");
                    }
                    return response.json();
                })
                .then(data => {
                    if(onChartCCIFetch) {
                        onChartCCIFetch(data);
                    }
                })
                .catch(error => console.error('Error fetching ChartCCI data', error));
        }
    }, [stockCode]);
    return null;
}

export default FetchChartCCIData;