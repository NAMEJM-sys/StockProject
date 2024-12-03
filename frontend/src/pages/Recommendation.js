import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import FetchTop5Data from '../ComponentsFetch/FetchStockOrignal/FetchTop5Data';
import FetchStockList from '../ComponentsFetch/FetchStockOrignal/FetchStockList'; // FetchStockList 컴포넌트
import './Recommendation.css';

function Recommendation() {
    const [top5Stocks, setTop5Stocks] = useState([]); // 상위 5개의 종목 데이터를 저장할 상태
    const [stockList, setStockList] = useState([]); // 전체 종목 목록 저장
    const [selectedStock, setSelectedStock] = useState(null); // 선택된 종목 코드
    const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수

    // FetchTop5Data의 콜백 핸들러
    const handleTopFetch = (data) => {
        setTop5Stocks(data); // 상위 5개의 종목 데이터를 상태에 저장
    };

    // FetchStockList의 콜백 핸들러
    const handleListFetch = (data) => {
        setStockList(data); // 전체 종목 목록을 상태에 저장
    };

    // 특정 종목을 선택했을 때 해당 종목의 세부 데이터를 가져오는 함수
    const handleStockClick = (stockCode, stockName) => {
        setSelectedStock(stockCode); // 클릭한 종목의 코드를 저장
        navigate(`/detail`, { state: { stockCode, stockName } }); // 종목 코드와 이름을 사용하여 상세 페이지로 이동
    };

    return (
        <div className="recommendation-container">
            <FetchTop5Data onTopFetch={handleTopFetch} />
            <FetchStockList onListFetch={handleListFetch} />

            <h2>TOP 10</h2>
            <ul>
                {top5Stocks.map((stock, index) => (
                    <li key={index} onClick={() => handleStockClick(stock.stock_code, stock.stock_name)}>
                        <span className="rank">{index + 1}등</span>
                        <span className="stock-name">{stock.stock_name}</span>
                        <span className="stock-code">({stock.stock_code})</span>
                    </li>
                ))}
            </ul>


        </div>
    );
}

export default Recommendation;