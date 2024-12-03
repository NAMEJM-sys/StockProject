import { useState, useEffect } from "react";

function FetchRealTime({ onDataFetch }) {
    const [stockData, setStockData] = useState([]);

    useEffect(() => {
        // 데이터를 불러오는 함수 정의
        const fetchData = () => {
            fetch('http://127.0.0.1:8000/api/get_home_realtime_by_volume/')
                .then(response => response.json())
                .then(data => {
                    setStockData(data); // 받아온 데이터를 상태로 저장
                    if (onDataFetch) {
                        onDataFetch(data)
                    }
                })
                .catch(error => console.error('Error fetching stock data:', error));
        };

        // 페이지 로드 시 데이터 최초 1회 호출
        fetchData();

        // 주기적으로 데이터를 갱신 (5초마다 호출)
        const intervalId = setInterval(fetchData, 5000);

        // 컴포넌트 언마운트 시 인터벌 클리어
        return () => clearInterval(intervalId);
    }, [onDataFetch]); // onDataFetch가 변경되면 재실행
    return null;
}

export default FetchRealTime;