import {useEffect, useState} from "react";

function FetchRealTimeDataForRSI({ onRTRSIFetch }) {
    const [stockData, setStockData] = useState([]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try{
                const response = await fetch('http://127.0.0.1:8000/api/get_rsi_realtime_data/')
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                if(JSON.stringify(data) !== JSON.stringify(stockData)) {
                    setStockData(data);
                    if(onRTRSIFetch) {
                        onRTRSIFetch(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching RSI analysis:', error);
            }
        };

        if(!initialized) {
            fetchData();
            setInitialized(true);
        }

        const intervalId = setInterval(fetchData, 10000);

        return () => clearInterval(intervalId);
    },[])
    return null;
}

export default FetchRealTimeDataForRSI;