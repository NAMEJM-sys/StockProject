import React, { useState, useEffect } from "react";
import {useLocation, useNavigate} from 'react-router-dom';
import Navbar from "../components/Navbar";
import Select from "react-select";
import {FixedSizeList as List} from "react-window";

import './ComprehensiveAnalysis.css'
import TestMoving from "../ComponentsChart/TestMoving";
import ChartOfCloseTotal from "../ComponentsChart/ChartOfCloseTotal";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import FetchStockList from "../ComponentsFetch/FetchStockOrignal/FetchStockList";
import FetchLatestStockData from "../ComponentsFetch/FetchStockOrignal/FetchLatestStockData";
import FetchADXCalculation from "../ComponentsFetch/FetchCalculation/FetchADXCalculation";
import FetchRSICalculation from "../ComponentsFetch/FetchCalculation/FetchRSICalculation";
import FetchCCICalculation from "../ComponentsFetch/FetchCalculation/FetchCCICalculation";
import FetchMFICalculation from "../ComponentsFetch/FetchCalculation/FetchMFICalculation";
import FetchMACDCalculation from "../ComponentsFetch/FetchCalculation/FetchMACDCalculation";
import FetchSARCalculation from "../ComponentsFetch/FetchCalculation/FetchSARCalculation";
import FetchKeltnerCalculation from "../ComponentsFetch/FetchCalculation/FetchKeltnerCalculation";
import FetchIchimokuCalculation from "../ComponentsFetch/FetchCalculation/FetchIchimokuCalculation";
import FetchStochasticCalculation from "../ComponentsFetch/FetchCalculation/FetchStochasticCalculation";
import MomentumTotalCalculation from "../ComponentsCalculations/MomentumTotalCalculation";
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
import ChartOfRSI from "../ComponentsChart/ChartOfRSI";
import ChartOfMACD from "../ComponentsChart/ChartOfMACD";
import ChartOfADX from "../ComponentsChart/ChartOfADX";
import ChartOfSAR from "../ComponentsChart/ChartOfSAR";
import ChartOfMFI from "../ComponentsChart/ChartOfMFI";
import ChartOfCCI from "../ComponentsChart/ChartOfCCI";
import ChartOfKeltner from "../ComponentsChart/ChartOfKeltner";
import ChartOfIchimoku from "../ComponentsChart/ChartOfIchimoku";
import FetchRSIAnalysis from "../ComponentsFetch/FetchAnalysis/FetchRSIAnalysis";
import FetchMACDAnalysis from "../ComponentsFetch/FetchAnalysis/FetchMACDAnalysis";
import FetchADXAnalysis from "../ComponentsFetch/FetchAnalysis/FetchADXAnalysis";
import FetchSARAnalysis from "../ComponentsFetch/FetchAnalysis/FetchSARAnalysis";
import FetchMFIAnalysis from "../ComponentsFetch/FetchAnalysis/FetchMFIAnalysis";
import FetchCCIAnalysis from "../ComponentsFetch/FetchAnalysis/FetchCCIAnalysis";
import FetchKeltnerAnalysis from "../ComponentsFetch/FetchAnalysis/FetchKeltnerAnalysis";
import FetchIchimokuAnalysis from "../ComponentsFetch/FetchAnalysis/FetchIchimokuAnalysis";

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

function ComprehensiveAnalysis() {
    const location = useLocation();
    const initialStockCode = location.state?.stockCode || "";
    const initialStockName = location.state?.stockName || "";
    const [stockData, setStockData] = useState([]);
    const [stockList, setStockList] = useState([]);
    const [latestData, setLatestData] = useState([]);
    const [availableStocks, setAvailableStocks] = useState([]);
    const [selectedStock, setSelectedStock] = useState({ value: initialStockCode, label: initialStockName });
    const [indicatorResults, setIndicatorResults] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [filteredData, setFilteredData] = useState([]);
    const [activeTab, setActiveTab] = useState('종합 분석');
    const [activeIndicatorTab, setActiveIndicatorTab] = useState('RSI');
    const navigate = useNavigate();

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

    useEffect(() => {
        const postStockCode = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/api/handle_post_request/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ stockCode: selectedStock.value }),
                });
                if (!response.ok) {
                    throw new Error('Something went wrong!');
                }
                const data = await response.json();

                console.log('Response from server:', data);
            } catch (error) {
                console.error('Error:', error);
            }
        };

        if (selectedStock.value) {
            postStockCode(); // Send stockCode when page is loaded
        }

    }, [selectedStock.value]);


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
        if (stockData.length > 0 && selectedStock.value) {
            const filtered = stockData.sort((b, a) => new Date(a.date) - new Date(b.date));
            setFilteredData(filtered);
        }
    }, [stockData, selectedStock.value]);

    const handleSelectChange = (selectedOption) => {
        setSelectedStock(selectedOption);
    };

    const handleListFetch = (data) => {
        setStockList(data);
    };

    const handleDataFetch = (data) => {
        setStockData(data);
    };

    const handleTabClick = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const handleIndicatorTabClick = (tab) => {
        if (activeIndicatorTab !== tab) {
            setActiveIndicatorTab(tab);
        }
    };

    const handleLatestStockData = (data) => {
        setLatestData(data);
    };

    const sortResultsByOrder = (results, order) => {
        return order.map(name => results.find(result => result.name === name) || { name, value: '-', damm: '-', recommendation: '-' });
    };

    return (
        <>
            <Navbar/>
            <div className="Comprehensive-Analysis-container">
                {/* 종목 검색 바 */}
                <div className="Comprehensive-Analysis-search-bar">
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

                {/* 탭 메뉴 */}
                <div className="Comprehensive-Analysis-indicator-tabs">
                    <button
                        className={activeTab === '종합 분석' ? 'active-tab' : ''}
                        onClick={() => handleTabClick('종합 분석')}
                    >
                        종합 분석
                    </button>
                    <button
                        className={activeTab === '테크니컬 분석' ? 'active-tab' : ''}
                        onClick={() => handleTabClick('테크니컬 분석')}
                    >
                        테크니컬 분석
                    </button>
                    <button
                        className={activeTab === '지표 분석' ? 'active-tab' : ''}
                        onClick={() => handleTabClick('지표 분석')}
                    >
                        지표 분석
                    </button>
                </div>

                {activeTab ==='지표 분석' && (
                    <>
                        <div className="indicator-tabs">
                            <button className={activeIndicatorTab === 'RSI' ? 'active-tab' : ''}
                                    onClick={() => handleIndicatorTabClick('RSI')}>RSI
                            </button>
                            <button className={activeIndicatorTab === 'MFI' ? 'active-tab' : ''}
                                    onClick={() => handleIndicatorTabClick('MFI')}>MFI
                            </button>
                            <button className={activeIndicatorTab === 'CCI' ? 'active-tab' : ''}
                                    onClick={() => handleIndicatorTabClick('CCI')}>CCI
                            </button>
                            <button className={activeIndicatorTab === 'MACD' ? 'active-tab' : ''}
                                    onClick={() => handleIndicatorTabClick('MACD')}>MACD
                            </button>
                            <button className={activeIndicatorTab === 'ADX' ? 'active-tab' : ''}
                                    onClick={() => handleIndicatorTabClick('ADX')}>ADX
                            </button>
                            <button className={activeIndicatorTab === 'Parabolic SAR' ? 'active-tab' : ''}
                                    onClick={() => handleIndicatorTabClick('Parabolic SAR')}>Parabolic SAR
                            </button>
                            <button className={activeIndicatorTab === 'Keltner Channel' ? 'active-tab' : ''}
                                    onClick={() => handleIndicatorTabClick('Keltner Channel')}>Keltner Channel
                            </button>
                            <button className={activeIndicatorTab === 'Ichimoku Cloud' ? 'active-tab' : ''}
                                    onClick={() => handleIndicatorTabClick('Ichimoku Cloud')}>Ichimoku Cloud
                            </button>
                        </div>

                        <div className="detail-main-content">
                            <div className="detail-chart">
                                {selectedStock && (
                                    <>
                                        <h3 className="detail-chart-text">{selectedStock.label}차트</h3>

                                        {activeIndicatorTab === "RSI" && (
                                            <ChartOfRSI stockCode={selectedStock.value}/>
                                        )}
                                        {activeIndicatorTab === "MACD" && (
                                            <ChartOfMACD stockCode={selectedStock.value}/>
                                        )}
                                        {activeIndicatorTab === "ADX" && (
                                            <ChartOfADX stockCode={selectedStock.value}/>
                                        )}
                                        {activeIndicatorTab === "Parabolic SAR" && (
                                            <ChartOfSAR stockCode={selectedStock.value}/>
                                        )}
                                        {activeIndicatorTab === "MFI" && (
                                            <ChartOfMFI stockCode={selectedStock.value}/>
                                        )}
                                        {activeIndicatorTab === "CCI" && (
                                            <ChartOfCCI stockCode={selectedStock.value}/>
                                        )}
                                        {activeIndicatorTab === "Keltner Channel" && (
                                            <ChartOfKeltner stockCode={selectedStock.value}/>
                                        )}
                                        {activeIndicatorTab === "Ichimoku Cloud" && (
                                            <ChartOfIchimoku stockCode={selectedStock.value}/>
                                        )}
                                    </>
                                )}
                            </div>

                            <div className="analysis-display">
                                <h3 className="analysis-display-main-text">{selectedStock.label} 분석</h3>

                                {/* Conditionally render analysis based on availability of data */}
                                {activeIndicatorTab === "RSI" && stockData.length > 0 && (
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
                                {activeIndicatorTab === "MACD" && stockData.length > 0 && (
                                    <>
                                        <div className="textbox">
                                            <FetchMACDAnalysis stockCode={selectedStock.value}
                                                               selectedAnalysis={['1']}/>
                                        </div>
                                        <div className="textbox">
                                            <FetchMACDAnalysis stockCode={selectedStock.value}
                                                               selectedAnalysis={['2']}/>
                                        </div>
                                        <div className="textbox">
                                            <FetchMACDAnalysis stockCode={selectedStock.value}
                                                               selectedAnalysis={['3']}/>
                                        </div>
                                        <div className="textbox">
                                            <FetchMACDAnalysis stockCode={selectedStock.value}
                                                               selectedAnalysis={['4']}/>
                                        </div>
                                        <div className="textbox">
                                            <FetchMACDAnalysis stockCode={selectedStock.value}
                                                               selectedAnalysis={['5']}/>
                                        </div>
                                    </>
                                )}
                                {activeIndicatorTab === "ADX" && stockData.length > 0 && (
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
                                {activeIndicatorTab === "Parabolic SAR" && stockData.length > 0 && (
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
                                {activeIndicatorTab === "MFI" && stockData.length > 0 && (
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
                                {activeIndicatorTab === "CCI" && stockData.length > 0 && (
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
                                {activeIndicatorTab === "Keltner Channel" && stockData.length > 0 && (
                                    <>
                                        <div className="textbox">
                                            <FetchKeltnerAnalysis stockCode={selectedStock.value}
                                                                  selectedAnalysis={['1']}/>
                                        </div>
                                        <div className="textbox">
                                            <FetchKeltnerAnalysis stockCode={selectedStock.value}
                                                                  selectedAnalysis={['2']}/>
                                        </div>
                                        <div className="textbox">
                                            <FetchKeltnerAnalysis stockCode={selectedStock.value}
                                                                  selectedAnalysis={['3']}/>
                                        </div>
                                        <div className="textbox">
                                            <FetchKeltnerAnalysis stockCode={selectedStock.value}
                                                                  selectedAnalysis={['4']}/>
                                        </div>
                                    </>
                                )}
                                {activeIndicatorTab === "Ichimoku Cloud" && stockData.length > 0 && (
                                    <>
                                        <div className="textbox">
                                            <FetchIchimokuAnalysis stockCode={selectedStock.value}
                                                                   selectedAnalysis={['1']}/>
                                        </div>
                                        <div className="textbox">
                                            <FetchIchimokuAnalysis stockCode={selectedStock.value}
                                                                   selectedAnalysis={['2']}/>
                                        </div>
                                        <div className="textbox">
                                            <FetchIchimokuAnalysis stockCode={selectedStock.value}
                                                                   selectedAnalysis={['3']}/>
                                        </div>
                                        <div className="textbox">
                                            <FetchIchimokuAnalysis stockCode={selectedStock.value}
                                                                   selectedAnalysis={['4']}/>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* 메인 컨텐츠 */}
                <div className="Comprehensive-Analysis-main-content">
                    <div className="Comprehensive-Analysis-main-container">
                        <FetchStockDataForCode stockCode={selectedStock.value} onSDFCFetch={handleDataFetch}/>
                        <FetchStockList onListFetch={handleListFetch}/>
                        <FetchLatestStockData onLSDFetch={handleLatestStockData}/>

                        {selectedStock && (
                            <>
                                {activeTab === '종합 분석' && (
                                    <>
                                        <h3 className="detail-chart-text">{selectedStock.label} 차트</h3>
                                        <ChartOfCloseTotal stockCode={selectedStock.value}/>


                                        <h3 className="Comprehensive-Analysis-Score">{selectedStock.label} 테크니컬 종합
                                            점수</h3>
                                        <TestMoving stockCode={selectedStock.value}/>
                                    </>
                                )}
                                {activeTab === '테크니컬 분석' && (
                                    <>
                                        <h3 className="Comprehensive-Analysis-Score-Tec">{selectedStock.label} 테크니컬 종합
                                            점수</h3>
                                        <TestMoving stockCode={selectedStock.value}/>

                                        <h3 className="Comprehensive-Analysis-Score-Tec-De">테크니컬 상세 점수</h3>
                                        <div className="table-container">
                                            <FetchADXCalculation stockCode={selectedStock.value}
                                                                 onADXCalculationFetch={handleResultUpdate}/>
                                            <FetchRSICalculation stockCode={selectedStock.value}
                                                                 onRSICalculationFetch={handleResultUpdate}/>
                                            <FetchCCICalculation stockCode={selectedStock.value}
                                                                 onCCICalculationFetch={handleResultUpdate}/>
                                            <FetchMFICalculation stockCode={selectedStock.value}
                                                                 onMFICalculationFetch={handleResultUpdate}/>
                                            <FetchMACDCalculation stockCode={selectedStock.value}
                                                                  onMACDCalculationFetch={handleResultUpdate}/>
                                            <FetchSARCalculation stockCode={selectedStock.value}
                                                                 onSARCalculationFetch={handleResultUpdate}/>
                                            <FetchKeltnerCalculation stockCode={selectedStock.value}
                                                                     onKeltnerCalculationFetch={handleResultUpdate}/>
                                            <FetchIchimokuCalculation stockCode={selectedStock.value}
                                                                      onIchimokuCalculationFetch={handleResultUpdate}/>
                                            <FetchStochasticCalculation stockCode={selectedStock.value}
                                                                        onStochasticCalculationFetch={handleResultUpdate}/>
                                            <MomentumTotalCalculation stockCode={selectedStock.value}
                                                                      onResultUpdate={handleResultUpdate}/>
                                            <FetchEMA10Calculation stockCode={selectedStock.value}
                                                                   onEMACalculationFetch={handleResultUpdate}/>
                                            <FetchSMA10Calculation stockCode={selectedStock.value}
                                                                   onSMACalculationFetch={handleResultUpdate}/>
                                            <FetchEMA20Calculation stockCode={selectedStock.value}
                                                                   onEMACalculationFetch={handleResultUpdate}/>
                                            <FetchSMA20Calculation stockCode={selectedStock.value}
                                                                   onSMACalculationFetch={handleResultUpdate}/>
                                            <FetchEMA30Calculation stockCode={selectedStock.value}
                                                                   onEMACalculationFetch={handleResultUpdate}/>
                                            <FetchSMA30Calculation stockCode={selectedStock.value}
                                                                   onSMACalculationFetch={handleResultUpdate}/>
                                            <FetchEMA50Calculation stockCode={selectedStock.value}
                                                                   onEMACalculationFetch={handleResultUpdate}/>
                                            <FetchSMA50Calculation stockCode={selectedStock.value}
                                                                   onSMACalculationFetch={handleResultUpdate}/>
                                            <FetchEMA100Calculation stockCode={selectedStock.value}
                                                                    onEMACalculationFetch={handleResultUpdate}/>
                                            <FetchSMA100Calculation stockCode={selectedStock.value}
                                                                    onSMACalculationFetch={handleResultUpdate}/>
                                            <FetchEMA200Calculation stockCode={selectedStock.value}
                                                                    onEMACalculationFetch={handleResultUpdate}/>
                                            <FetchSMA200Calculation stockCode={selectedStock.value}
                                                                    onSMACalculationFetch={handleResultUpdate}/>

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
                                                            <td>
                                                                <button
                                                                    className="stock-name-button"
                                                                    onClick={() => navigate('/StockAnalysis', {
                                                                        state: {
                                                                            stockCode: selectedStock.value,
                                                                            stockName: selectedStock.label,
                                                                        }
                                                                    })}
                                                                >
                                                                    {result.name}
                                                                </button>
                                                            </td>
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
                                                            <td style={{ color: result.recommendation === '강한 매수' ? 'red' :
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
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}

export default ComprehensiveAnalysis;