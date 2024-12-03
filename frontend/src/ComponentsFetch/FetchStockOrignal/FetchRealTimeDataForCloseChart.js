import { useState, useEffect } from "react";

function FetchRealTimeDataForCloseChart({ stockCode, onSDFCFetch }) {
    const [stockData, setStockData] = useState([]);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/post_stock_real_data_for_code/${stockCode}/`);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                if (JSON.stringify(data) !== JSON.stringify(stockData)) {
                    setStockData(data);
                    if (onSDFCFetch) {
                        onSDFCFetch(data);
                    }
                }
            } catch (error) {
                console.error('Error fetching chart data:', error);
            }
        };

        // 실시간 데이터를 주기적으로 가져오기 전에 차트를 맞춰서 한 번 호출
        if (!initialized) {
            fetchData();
            setInitialized(true);
        }

        const intervalId = setInterval(fetchData, 10000); // 10초 주기

        // 컴포넌트 언마운트 시 인터벌 클리어
        return () => clearInterval(intervalId);
    }, [stockCode, onSDFCFetch]);

    return null;
}

export default FetchRealTimeDataForCloseChart;