import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from "../components/Navbar";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import FetchStockList from "../ComponentsFetch/FetchStockOrignal/FetchStockList";
import FetchLatestStockData from "../ComponentsFetch/FetchStockOrignal/FetchLatestStockData";
import './AnalysisTab.css';

function Comprehensive() {
    const navigate = useNavigate();
    const location = useLocation();
    const initialStockCode = location.state?.stockCode || "";
    const initialStockName = location.state?.stockName || "";
    const [stockData, setStockData] = useState([]);
    const [stockList, setStockList] = useState([]);
    const [latestData, setLatestData] = useState([]);
    const [activeTab, setActiveTab] = useState('종합 분석');

    const [availableStocks, setAvailableStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState({ value: initialStockCode, label: initialStockName });

    // Available stocks filtering when stock data and stock list are available
    useEffect(() => {
        if (stockData.length > 0 && stockList.length > 0) {
            const available = stockList.filter(code => latestData.stock_code === code.stockCode)
                .map(stock => ({
                    value: stock.code,
                    label: `${stock.name}`
                }));
            setAvailableStocks(available);
        }
    }, [stockData, stockList, latestData]);

    // Handle stock list fetching
    const handleListFetch = (data) => {
        setStockList(data);
    };

    // Handle stock data fetching
    const handleDataFetch = (data) => {
        setStockData(data);
    };

    // Handle latest stock data fetching
    const handleLatestStockData = (data) => {
        setLatestData(data);
    };

    // Handle tab click with optimized navigation
    const handleTabClick = (tab, path) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
            navigate(path, {
                state: {
                    stockCode: selectedStock.value,
                    stockName: selectedStock.label,
                },
                replace: true // Use replace to avoid adding to history stack, making navigation smoother
            });
        }
    };

    return (
        <>
            <FetchStockDataForCode stockCode={selectedStock.value} onSDFCFetch={handleDataFetch}/>
            <FetchStockList onListFetch={handleListFetch}/>
            <FetchLatestStockData onLSDFetch={handleLatestStockData}/>

            <Navbar/>
            <div className="Comprehensive-Analysis-container">
                <div className="Comprehensive-Analysis-indicator-tabs">
                    <button
                        className={activeTab === '종합 분석' ? 'active-tab' : ''}
                        onClick={() => navigate('/comprehensive', {
                            state: {
                                stockCode: selectedStock.value,
                                stockName: selectedStock.label,
                            }
                        })}
                    >
                        종합 분석
                    </button>
                    <button
                        className={activeTab === '테크니컬 분석' ? 'active-tab' : ''}
                        onClick={() => navigate('/technicalanalysis',{
                            state: {
                                stockCode: selectedStock.value,
                                stockName: selectedStock.label,
                            }
                        })}
                    >
                        테크니컬 분석
                    </button>
                    <button
                        className={activeTab === '지표 분석' ? 'active-tab' : ''}
                        onClick={() => navigate('/stockanalysis', {
                            state: {
                                stockCode: selectedStock.value,
                                stockName: selectedStock.label,
                            }
                        })}
                    >
                        지표 분석
                    </button>
                </div>
            </div>
        </>
    );
}

export default Comprehensive;