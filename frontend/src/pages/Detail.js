import React, { useState, useEffect } from "react";
import Select from "react-select";
import { FixedSizeList as List } from "react-window";
import { useLocation } from 'react-router-dom';
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import FetchStockList from "../ComponentsFetch/FetchStockOrignal/FetchStockList";
import FetchLatestStockData from "../ComponentsFetch/FetchStockOrignal/FetchLatestStockData";
import ChartOfClose from "../ComponentsChart/ChartOfClose";
import ChartOfRSI from "../ComponentsChart/ChartOfRSI";
import ChartOfMACD from "../ComponentsChart/ChartOfMACD";
import ChartOfADX from "../ComponentsChart/ChartOfADX";
import ChartOfSAR from "../ComponentsChart/ChartOfSAR";
import ChartOfMFI from "../ComponentsChart/ChartOfMFI";
import ChartOfKeltner from "../ComponentsChart/ChartOfKeltner";
import ChartOfCCI from "../ComponentsChart/ChartOfCCI";
import ChartOfIchimoku from "../ComponentsChart/ChartOfIchimoku";
import MomentumTotalCalculation from "../ComponentsCalculations/MomentumTotalCalculation";
import TestMoving from "../ComponentsChart/TestMoving";
import FetchRSIAnalysis from "../ComponentsFetch/FetchAnalysis/FetchRSIAnalysis";
import FetchMFIAnalysis from "../ComponentsFetch/FetchAnalysis/FetchMFIAnalysis";
import FetchCCIAnalysis from "../ComponentsFetch/FetchAnalysis/FetchCCIAnalysis";
import FetchMACDAnalysis from "../ComponentsFetch/FetchAnalysis/FetchMACDAnalysis";
import FetchADXAnalysis from "../ComponentsFetch/FetchAnalysis/FetchADXAnalysis";
import FetchSARAnalysis from "../ComponentsFetch/FetchAnalysis/FetchSARAnalysis";
import FetchKeltnerAnalysis from "../ComponentsFetch/FetchAnalysis/FetchKeltnerAnalysis";
import FetchIchimokuAnalysis from "../ComponentsFetch/FetchAnalysis/FetchIchimokuAnalysis";
import FetchCCICalculation from "../ComponentsFetch/FetchCalculation/FetchCCICalculation";
import FetchMACDCalculation from "../ComponentsFetch/FetchCalculation/FetchMACDCalculation";
import FetchADXCalculation from "../ComponentsFetch/FetchCalculation/FetchADXCalculation";
import FetchRSICalculation from "../ComponentsFetch/FetchCalculation/FetchRSICalculation";
import FetchMFICalculation from "../ComponentsFetch/FetchCalculation/FetchMFICalculation";
import FetchSARCalculation from "../ComponentsFetch/FetchCalculation/FetchSARCalculation";
import FetchKeltnerCalculation from "../ComponentsFetch/FetchCalculation/FetchKeltnerCalculation";
import FetchIchimokuCalculation from "../ComponentsFetch/FetchCalculation/FetchIchimokuCalculation";


import './Detail.css';
import '../styles/LinkText.css';
import Navbar from "../components/Navbar";
import FetchStochasticCalculation from "../ComponentsFetch/FetchCalculation/FetchStochasticCalculation";
import FetchEMA10Calculation from "../ComponentsFetch/FetchMovingAverage/FetchEMA10Calculation";
import FetchSMA10Calculation from "../ComponentsFetch/FetchMovingAverage/FetchSMA10Calculation";
import FetchEMA20Calculation from "../ComponentsFetch/FetchMovingAverage/FetchEMA20Calculation";
import FetchSMA20Calculation from "../ComponentsFetch/FetchMovingAverage/FetchSMA20Calculation";
import FetchEMA30Calculation from "../ComponentsFetch/FetchMovingAverage/FetchEMA30Calculation";
import FetchSMA30Calculation from "../ComponentsFetch/FetchMovingAverage/FetchSMA30Calculation";
import FetchEMA50Calculation from "../ComponentsFetch/FetchMovingAverage/FetchEMA50Calculation";
import FetchSMA50Calculation from "../ComponentsFetch/FetchMovingAverage/FetchSMA50Calculation";
import FetchEMA100Calculation from "../ComponentsFetch/FetchMovingAverage/FetchEMA100Calculation";
import FetchSMA100Calculation from "../ComponentsFetch/FetchMovingAverage/FetchSMA100Calculation";
import FetchEMA200Calculation from "../ComponentsFetch/FetchMovingAverage/FetchEMA200Calculation";
import FetchSMA200Calculation from "../ComponentsFetch/FetchMovingAverage/FetchSMA200Calculation";

const MenuList = ({ options, children, maxHeight, getValue }) => {
    const height = 35;
    const [value] = getValue() || [];
    const initialOffset = value ? options.findIndex(option => option.value === value) * height : 0;

    return (
        <List
            height={maxHeight}
            itemCount={children.length}
            itemSize={height}
            initialScrollOffset={initialOffset}
        >
            {({ index, style }) => (
                <div style={style}>
                    {children[index]}
                </div>
            )}
        </List>
    );
};

function Detail() {
    const location = useLocation();
    const initialStockCode = location.state?.stockCode || "";
    const initialStockName = location.state?.stockName || "";
    const [stockData, setStockData] = useState([]);
    const [stockList, setStockList] = useState([]);
    const [latestData, setLatestData] = useState([]);
    const [availableStocks, setAvailableStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState({ value: initialStockCode, label: initialStockName });
    const [filteredData, setFilteredData] = useState([]);
    const [activeTab, setActiveTab] = useState(null);
    const [inputValue, setInputValue] = useState("");
    const [indicatorResults, setIndicatorResults] = useState([]);

    const handleResultUpdate = (newResult) => {
        setIndicatorResults((prevState) => {
            const updateResults = [...prevState];
            const existingIndex = updateResults.findIndex((result) => result.name === newResult.name);

            if(existingIndex !== -1) {
                if (updateResults[existingIndex].value !== newResult.value) {
                    updateResults[existingIndex] = newResult;
                }
            } else {
                updateResults.push(newResult);
            }

            return updateResults;
        });
    };

    const oscillatorOrder = ['RSI(14)', 'CCI(20)', 'MFI(14)', 'ADX(14, 14, 1)', 'MACD(12, 26, close, 9)', 'Stochastic %K(14, 3, 3)', 'Momentum(10)'];
    const movingAverageOrder = ['Exponential Moving Average(10)','Simple Moving Average(10)',
                            'Exponential Moving Average(20)','Simple Moving Average(20)',
                            'Exponential Moving Average(30)','Simple Moving Average(30)',
                            'Exponential Moving Average(50)','Simple Moving Average(50)',
                            'Exponential Moving Average(100)','Simple Moving Average(100)',
                            'Exponential Moving Average(200)','Simple Moving Average(200)',
                            'Parabolic SAR(0.02, 0.02, 0.2)', 'Keltner Channel(20, 2)', 'Ichimoku Cloud(9, 26, 52, 26)'];

    // Helper function to sort based on predefined order
    const sortResultsByOrder = (results, order) => {
        return order.map(name => results.find(result => result.name === name) || { name, value: '-', damm: '-', recommendation: '-' });
    };

    const handleLatestStockData = (data) => {
        setLatestData(data);
    };

    const handleDataFetch = (data) => {
        setStockData(data);
    };

    const handleListFetch = (data) => {
        setStockList(data);
    };

    const handleTabClick = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

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

    useEffect(() => {
        if (stockData.length > 0 && selectedStock) {
            const filtered = stockData.sort((b, a) => new Date(a.date) - new Date(b.date));
            setFilteredData(filtered);
        }
    }, [stockData, selectedStock]);

    const handleSelectChange = (selectedOption) => {
        setSelectedStock(selectedOption);
    };

    const customStyles = {
        option: (provided) => ({
            ...provided,
            whiteSpace: 'nowrap',
            fontSize: '14px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '2.1em',
        }),
        container: (provided) => ({
            ...provided,
            width: '450px'
        })
    };

    return (
        <>
            <Navbar />

            <div className="detail-container">
                <FetchADXCalculation stockCode={selectedStock.value} onADXCalculationFetch={handleResultUpdate}/>
                <FetchRSICalculation stockCode={selectedStock.value} onRSICalculationFetch={handleResultUpdate}/>
                <FetchCCICalculation stockCode={selectedStock.value} onCCICalculationFetch={handleResultUpdate}/>
                <FetchMFICalculation stockCode={selectedStock.value} onMFICalculationFetch={handleResultUpdate}/>
                <FetchMACDCalculation stockCode={selectedStock.value} onMACDCalculationFetch={handleResultUpdate}/>
                <FetchSARCalculation stockCode={selectedStock.value} onSARCalculationFetch={handleResultUpdate}/>
                <FetchKeltnerCalculation stockCode={selectedStock.value} onKeltnerCalculationFetch={handleResultUpdate}/>
                <FetchIchimokuCalculation stockCode={selectedStock.value} onIchimokuCalculationFetch={handleResultUpdate}/>
                <FetchStochasticCalculation stockCode={selectedStock.value} onStochasticCalculationFetch={handleResultUpdate}/>
                <MomentumTotalCalculation stockCode={selectedStock.value} onResultUpdate={handleResultUpdate}/>
                <FetchEMA10Calculation stockCode={selectedStock.value} onEMACalculationFetch={handleResultUpdate}/>
                <FetchSMA10Calculation stockCode={selectedStock.value} onSMACalculationFetch={handleResultUpdate}/>
                <FetchEMA20Calculation stockCode={selectedStock.value} onEMACalculationFetch={handleResultUpdate}/>
                <FetchSMA20Calculation stockCode={selectedStock.value} onSMACalculationFetch={handleResultUpdate}/>
                <FetchEMA30Calculation stockCode={selectedStock.value} onEMACalculationFetch={handleResultUpdate}/>
                <FetchSMA30Calculation stockCode={selectedStock.value} onSMACalculationFetch={handleResultUpdate}/>
                <FetchEMA50Calculation stockCode={selectedStock.value} onEMACalculationFetch={handleResultUpdate}/>
                <FetchSMA50Calculation stockCode={selectedStock.value} onSMACalculationFetch={handleResultUpdate}/>
                <FetchEMA100Calculation stockCode={selectedStock.value} onEMACalculationFetch={handleResultUpdate}/>
                <FetchSMA100Calculation stockCode={selectedStock.value} onSMACalculationFetch={handleResultUpdate}/>
                <FetchEMA200Calculation stockCode={selectedStock.value} onEMACalculationFetch={handleResultUpdate}/>
                <FetchSMA200Calculation stockCode={selectedStock.value} onSMACalculationFetch={handleResultUpdate}/>


                <div className="search-bar">
                    <Select
                        components={{MenuList}}
                        options={availableStocks}
                        onChange={handleSelectChange}
                        value={selectedStock}
                        placeholder="종목을 검색하세요"
                        styles={customStyles}
                        inputValue={inputValue}
                        onInputChange={(value) => setInputValue(value)}
                    />
                </div>

                <div className="indicator-tabs">
                    <button className={activeTab === 'RSI' ? 'active-tab' : ''}
                            onClick={() => handleTabClick('RSI')}>RSI
                    </button>
                    <button className={activeTab === 'MFI' ? 'active-tab' : ''}
                            onClick={() => handleTabClick('MFI')}>MFI
                    </button>
                    <button className={activeTab === 'CCI' ? 'active-tab' : ''}
                            onClick={() => handleTabClick('CCI')}>CCI
                    </button>
                    <button className={activeTab === 'MACD' ? 'active-tab' : ''}
                            onClick={() => handleTabClick('MACD')}>MACD
                    </button>
                    <button className={activeTab === 'ADX' ? 'active-tab' : ''}
                            onClick={() => handleTabClick('ADX')}>ADX
                    </button>
                    <button className={activeTab === 'Parabolic SAR' ? 'active-tab' : ''}
                            onClick={() => handleTabClick('Parabolic SAR')}>Parabolic SAR
                    </button>
                    <button className={activeTab === 'Keltner Channel' ? 'active-tab' : ''}
                            onClick={() => handleTabClick('Keltner Channel')}>Keltner Channel
                    </button>
                    <button className={activeTab === 'Ichimoku Cloud' ? 'active-tab' : ''}
                            onClick={() => handleTabClick('Ichimoku Cloud')}>Ichimoku Cloud
                    </button>
                </div>

                <div className="detail-main-content">
                    <div className="detail-chart">
                        <FetchStockDataForCode stockCode={selectedStock.value} onSDFCFetch={handleDataFetch}/>
                        <FetchStockList onListFetch={handleListFetch}/>
                        <FetchLatestStockData onLSDFetch={handleLatestStockData}/>

                        {selectedStock && (
                            <>
                                <h3 className="detail-chart-text">{selectedStock.label} 차트</h3>

                                {activeTab !== "ADX" && activeTab !== "MACD" && activeTab !== "RSI" && activeTab !== "CCI" && activeTab !== "Parabolic SAR" && activeTab !== "Keltner Channel" &&
                                    activeTab !== "Ichimoku Cloud" && activeTab !== "MFI" && (
                                        <ChartOfClose stockCode={selectedStock.value}/>
                                    )}

                                {activeTab === "RSI" && (
                                    <ChartOfRSI stockCode={selectedStock.value}/>
                                )}
                                {activeTab === "MACD" && (
                                    <ChartOfMACD stockCode={selectedStock.value}/>
                                )}
                                {activeTab === "ADX" && (
                                    <ChartOfADX stockCode={selectedStock.value}/>
                                )}
                                {activeTab === "Parabolic SAR" && (
                                    <ChartOfSAR stockCode={selectedStock.value}/>
                                )}
                                {activeTab === "MFI" && (
                                    <ChartOfMFI stockCode={selectedStock.value}/>
                                )}
                                {activeTab === "CCI" && (
                                    <ChartOfCCI stockCode={selectedStock.value}/>
                                )}
                                {activeTab === "Keltner Channel" && (
                                    <ChartOfKeltner stockCode={selectedStock.value}/>
                                )}
                                {activeTab === "Ichimoku Cloud" && (
                                    <ChartOfIchimoku stockCode={selectedStock.value}/>
                                )}
                            </>
                        )}
                    </div>

                    <div className="analysis-display">
                        <h3 className="analysis-display-main-text">{selectedStock.label} 분석</h3>

                        {/* Conditionally render analysis based on availability of data */}
                        {activeTab === "RSI" && stockData.length > 0 && (
                            <>
                                <div className="textbox">
                                    <FetchRSIAnalysis stockCode={selectedStock.value} selectedAnalysis={['1']}/>
                                </div>
                                <div className="textbox">
                                    <FetchRSIAnalysis stockCode={selectedStock.value} selectedAnalysis={['2']}/>
                                </div>
                                <div className="textbox">
                                    <FetchRSIAnalysis stockCode={selectedStock.value} selectedAnalysis={['3']}/>
                                </div>
                                <div className="textbox">
                                    <FetchRSIAnalysis stockCode={selectedStock.value} selectedAnalysis={['4']}/>
                                </div>
                                <div className="textbox">
                                    <FetchRSIAnalysis stockCode={selectedStock.value} selectedAnalysis={['5']}/>
                                </div>
                            </>
                        )}
                        {activeTab === "MACD" && stockData.length > 0 && (
                            <>
                                <div className="textbox">
                                    <FetchMACDAnalysis stockCode={selectedStock.value} selectedAnalysis={['1']}/>
                                </div>
                                <div className="textbox">
                                    <FetchMACDAnalysis stockCode={selectedStock.value} selectedAnalysis={['2']}/>
                                </div>
                                <div className="textbox">
                                    <FetchMACDAnalysis stockCode={selectedStock.value} selectedAnalysis={['3']}/>
                                </div>
                                <div className="textbox">
                                    <FetchMACDAnalysis stockCode={selectedStock.value} selectedAnalysis={['4']}/>
                                </div>
                                <div className="textbox">
                                    <FetchMACDAnalysis stockCode={selectedStock.value} selectedAnalysis={['5']}/>
                                </div>
                            </>
                        )}
                        {activeTab === "ADX" && stockData.length > 0 && (
                            <>
                                <div className="textbox">
                                    <FetchADXAnalysis stockCode={selectedStock.value} selectedAnalysis={['1']}/>
                                </div>
                                <div className="textbox">
                                    <FetchADXAnalysis stockCode={selectedStock.value} selectedAnalysis={['2']}/>
                                </div>
                                <div className="textbox">
                                    <FetchADXAnalysis stockCode={selectedStock.value} selectedAnalysis={['3']}/>
                                </div>
                                <div className="textbox">
                                    <FetchADXAnalysis stockCode={selectedStock.value} selectedAnalysis={['4']}/>
                                </div>
                            </>
                        )}
                        {activeTab === "Parabolic SAR" && stockData.length > 0 && (
                            <>
                                <div className="textbox">
                                    <FetchSARAnalysis stockCode={selectedStock.value} selectedAnalysis={['1']}/>
                                </div>
                                <div className="textbox">
                                    <FetchSARAnalysis stockCode={selectedStock.value} selectedAnalysis={['2']}/>
                                </div>
                                <div className="textbox">
                                    <FetchSARAnalysis stockCode={selectedStock.value} selectedAnalysis={['3']}/>
                                </div>
                                <div className="textbox">
                                    <FetchSARAnalysis stockCode={selectedStock.value} selectedAnalysis={['4']}/>
                                </div>
                            </>
                        )}
                        {activeTab === "MFI" && stockData.length > 0 && (
                            <>
                                <div className="textbox">
                                    <FetchMFIAnalysis stockCode={selectedStock.value} selectedAnalysis={['1']}/>
                                </div>
                                <div className="textbox">
                                    <FetchMFIAnalysis stockCode={selectedStock.value} selectedAnalysis={['2']}/>
                                </div>
                                <div className="textbox">
                                    <FetchMFIAnalysis stockCode={selectedStock.value} selectedAnalysis={['3']}/>
                                </div>
                                <div className="textbox">
                                    <FetchMFIAnalysis stockCode={selectedStock.value} selectedAnalysis={['4']}/>
                                </div>
                            </>
                        )}
                        {activeTab === "CCI" && stockData.length > 0 && (
                            <>
                                <div className="textbox">
                                    <FetchCCIAnalysis stockCode={selectedStock.value} selectedAnalysis={['1']}/>
                                </div>
                                <div className="textbox">
                                    <FetchCCIAnalysis stockCode={selectedStock.value} selectedAnalysis={['2']}/>
                                </div>
                                <div className="textbox">
                                    <FetchCCIAnalysis stockCode={selectedStock.value} selectedAnalysis={['3']}/>
                                </div>
                                <div className="textbox">
                                    <FetchCCIAnalysis stockCode={selectedStock.value} selectedAnalysis={['4']}/>
                                </div>
                            </>
                        )}
                        {activeTab === "Keltner Channel" && stockData.length > 0 && (
                            <>
                                <div className="textbox">
                                    <FetchKeltnerAnalysis stockCode={selectedStock.value} selectedAnalysis={['1']}/>
                                </div>
                                <div className="textbox">
                                    <FetchKeltnerAnalysis stockCode={selectedStock.value} selectedAnalysis={['2']}/>
                                </div>
                                <div className="textbox">
                                    <FetchKeltnerAnalysis stockCode={selectedStock.value} selectedAnalysis={['3']}/>
                                </div>
                                <div className="textbox">
                                    <FetchKeltnerAnalysis stockCode={selectedStock.value} selectedAnalysis={['4']}/>
                                </div>
                            </>
                        )}
                        {activeTab === "Ichimoku Cloud" && stockData.length > 0 && (
                            <>
                                <div className="textbox">
                                    <FetchIchimokuAnalysis stockCode={selectedStock.value} selectedAnalysis={['1']}/>
                                </div>
                                <div className="textbox">
                                    <FetchIchimokuAnalysis stockCode={selectedStock.value} selectedAnalysis={['2']}/>
                                </div>
                                <div className="textbox">
                                    <FetchIchimokuAnalysis stockCode={selectedStock.value} selectedAnalysis={['3']}/>
                                </div>
                                <div className="textbox">
                                    <FetchIchimokuAnalysis stockCode={selectedStock.value} selectedAnalysis={['4']}/>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                <TestMoving stockCode={selectedStock.value}/>

                <div className="table-container">
                    {/* Left Column */}
                    <div className="table-column">
                        <h3>Oscillators</h3>
                        <table className="analysis-table">
                            <thead>
                            <tr>
                                <th>이름</th>
                                <th>값</th>
                                <th>점수</th>
                                <th>추천</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortResultsByOrder(indicatorResults.filter(result => oscillatorOrder.includes(result.name)), oscillatorOrder).map((result, index) => (
                                <tr key={index}>
                                    <td>{result.name}</td>
                                    <td>{result.value}</td>
                                    <td>{result.damm}</td>
                                    <td style={{ color: result.recommendation === '강한 매수' ? 'red' :
                                                        result.recommendation === '매수' ? 'orange' :
                                                        result.recommendation === '매도' ? 'blue' :
                                                        result.recommendation === '강한 매도' ? 'darkblue' : 'gray' }}> {result.recommendation} </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Right Column */}
                    <div className="table-column">
                        <h3>Moving Averages</h3>
                        <table className="analysis-table">
                            <thead>
                            <tr>
                                <th>이름</th>
                                <th>값</th>
                                <th>점수</th>
                                <th>추천</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortResultsByOrder(indicatorResults.filter(result => movingAverageOrder.includes(result.name)), movingAverageOrder).map((result, index) => (
                                <tr key={index}>
                                    <td>{result.name}</td>
                                    <td>{result.value}</td>
                                    <td>{result.damm}</td>
                                    <td style={{
                                        color: result.recommendation === '강한 매수' ? 'red' :
                                               result.recommendation === '매수' ? 'orange' :
                                               result.recommendation === '매도' ? 'blue' :
                                               result.recommendation === '강한 매도' ? 'darkblue' : 'gray'
                                    }}> {result.recommendation} </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>


                <div className="detail-table">
                    <h3>{selectedStock ? selectedStock.label : "종목"} 종목 데이터</h3>
                    <table>
                        <thead>
                        <tr>
                            <th>일자</th>
                            <th>종가</th>
                            <th>고가</th>
                            <th>저가</th>
                            <th>시가</th>
                            <th>거래량</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredData.map((data, index) => (
                            <tr key={index}>
                                <td>{data.date}</td>
                                <td>{data.close}</td>
                                <td>{data.high}</td>
                                <td>{data.low}</td>
                                <td>{data.open}</td>
                                <td>{data.volume}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Detail;