import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import FetchRealTime from "../ComponentsFetch/FetchStockOrignal/FetchRealTime";
import FetchLatestStockData from "../ComponentsFetch/FetchStockOrignal/FetchLatestStockData";
import ChartOfClose from "../ComponentsChart/ChartOfClose";
import Navbar from "../components/Navbar";
import './Home.css';
import { FixedSizeList as List } from "react-window";
import Select from "react-select";
import CustomOption from './CustomOption';

const MenuList = ({ options, children, maxHeight, getValue }) => {
    const height = 40;
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

function Home() {
    const [stockData, setStockData] = useState([]); // 실시간 데이터
    const [stockList, setStockList] = useState([]); // 종목 리스트
    const [latestStockData, setLatestStockData] = useState([]); // 당일 데이터를 포함한 종목 데이터
    const [filteredData, setFilteredData] = useState([]); // 필터링된 데이터
    const [selectedStock, setSelectedStock] = useState(null); // 선택된 종목
    const [availableStocks, setAvailableStocks] = useState([]);
    const navigate = useNavigate();
    const [expandedRows, setExpandedRows] = useState([]); // 확장된 행 관리
    const [inputValue, setInputValue] = useState("");
    const [topStockData, setTopStockData] = useState([]); // 상위 10개 종목 데이터
    const [rowRefs, setRowRefs] = useState({}); // 각 종목 tr을 참조하는 ref 객체
    const [step, setStep] = useState(0); // 각 단계별 순서 관리를 위한 state

    // 종목명 클릭 시 확장된 행을 관리하는 함수
    const handleStockClick = (stockCode) => {
        if (expandedRows.includes(stockCode)) {
            setExpandedRows(expandedRows.filter(row => row !== stockCode)); // 이미 열려 있으면 닫기
        } else {
            setExpandedRows([...expandedRows, stockCode]); // 선택한 종목의 행 열기
            setSelectedStock(stockCode); // 차트를 표시할 종목 설정
        }
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

    const handlePageExit = () => {
        const stockCodes = filteredData.map(stock => stock.stock_code);
        console.log("Sending stock codes:", stockCodes);

        fetch('http://127.0.0.1:8000/api/delete_home_stock_codes/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ stock_codes: stockCodes })
        }).then(response => {
            console.log("Delete request sent:", response.status);
            return response.json();
        }).then(data => {
            console.log("Response data:", data);
        }).catch(error => {
            console.log("Error sending delete request:", error);
        });
    };

    const navigateToComprehensiveAnalysis = (stockCode, stockName) => {
        handlePageExit();  // 페이지 이동 전에 데이터 삭제
        navigate('/comprehensiveanalysis', {
            state: {
                stockCode: stockCode,
                stockName: stockName
            }
        });
    };

    // 1단계: Redis에 데이터를 저장하고 step 1로 이동
    useEffect(() => {
        if (step === 0) {
            fetch(`http://127.0.0.1:8000/api/step1_home_useEffect/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({}) // 필요한 데이터가 있으면 여기 포함
            })
            .then(response => response.json())
            .then(data => {
                setStep(1); // step 1로 이동
            }).catch(error => console.error('Error in step 1:', error));
        }
    }, [step]);

    // 2단계: 실시간 데이터를 받아온 후 step 2로 이동
    useEffect(() => {
        if (step === 1) {
            fetch(`http://127.0.0.1:8000/api/step2_home_useEffect/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({})
            })
            .then(response => response.json())
            .then(data => {
                setStockData(data); // 실시간 데이터 설정
                setStep(2); // step 2로 이동
            })
            .catch(error => console.error('Error in step 2:', error));
        }
    }, [step]);

    // 3단계: 종목 리스트를 불러온 후 step 3로 이동
    useEffect(() => {
        if (step === 2) {
            fetch(`http://127.0.0.1:8000/api/stock_list/`) // FetchStockList API 호출
                .then(response => response.json())
                .then(data => {
                    setStockList(data);
                    setStep(3); // step 3로 이동
                }).catch(error => console.error('Error in step 3:', error));
        }
    }, [step]);

    // 최신 데이터와 실시간 데이터를 결합하여 필터링된 데이터 생성
    useEffect(() => {
        if (stockList.length > 0 && Object.keys(stockData).length > 0 && latestStockData.length > 0) {
            const formattedData = Object.keys(stockData)
                .map(stockCode => {
                    const matchingStock = stockList.find(stock => stock.code === stockCode);
                    const matchingLatestStock = latestStockData.find(stock => stock.stock_code === stockCode);

                    if (matchingStock || matchingLatestStock) {
                        const combinedData = {
                            ...stockData[stockCode],
                            stock_code: stockCode,
                            stock_name: matchingStock?.name || matchingLatestStock?.name,
                        };
                        return combinedData;
                    }
                    return null;
                })
                .filter(data => data !== null)
                .sort((a, b) => b.volume - a.volume);

            setFilteredData(formattedData);

            const availableOptions = [
                ...stockList.map(stock => ({
                    value: stock.code,
                    label: stock.name
                })),
                ...latestStockData.map(stock => ({
                    value: stock.stock_code,
                    label: stock.name
                }))
            ];
            setAvailableStocks(availableOptions);
        }
    }, [stockList, stockData, latestStockData]);

    // 종목 리스트 업데이트 시 참조 업데이트
    useEffect(() => {
        const refs = filteredData.reduce((acc, data) => {
            acc[data.stock_code] = React.createRef();
            return acc;
        }, {});
        setRowRefs(refs);
    }, [filteredData]);

    const handleSelectChange = (selectedOption) => {
        setSelectedStock(selectedOption);
        setExpandedRows([selectedOption.value]);

        if (rowRefs[selectedOption.value]) {
            rowRefs[selectedOption.value].current.scrollIntoView({
                behavior: "smooth",
                block: "center",
            });
        }
    };

    return (
        <>
            <Navbar />
            <div className='home-container'>
                {step >= 2 && <FetchRealTime onDataFetch={setStockData} />}
                <FetchLatestStockData onLSDFetch={setLatestStockData} /> {/* 최신 데이터 추가 */}
                <div className="home-search-bar">
                    <Select
                        components={{ MenuList, Option: (props) => <CustomOption {...props} handlePageExit={handlePageExit} /> }}
                        options={availableStocks}
                        onChange={handleSelectChange}
                        value={selectedStock}
                        placeholder="종목을 검색하세요"
                        styles={customStyles}
                        inputValue={inputValue}
                        onInputChange={(value) => setInputValue(value)}
                    />
                </div>

                <div className='home-table-container'>
                    <h3 className="table-h3"> 실시간 시세</h3>
                    <div className="home-table-scroll-wrapper">
                        <table className="home-realtime-table">
                            <thead>
                            <tr>
                                <th width="10px">종목명</th>
                                <th>현재가</th>
                                <th>전일대비</th>
                                <th>등락율</th>
                                <th>고가</th>
                                <th>저가</th>
                                <th>시가</th>
                                <th>거래량</th>
                            </tr>
                            </thead>
                            <tbody>
                            {filteredData.map((data, index) => (
                                <React.Fragment key={index}>
                                    <tr ref={rowRefs[data.stock_code]}>
                                        <td>
                                            <button
                                                className="stock-name-button"
                                                onClick={() => handleStockClick(data.stock_code)}
                                            >
                                                {data.stock_name}
                                            </button>
                                        </td>
                                        <td>{data.current_price}원</td>
                                        <td>{data.onday}원</td>
                                        <td
                                            style={{
                                                color: parseFloat(data.ratio) < 0 ? 'red' : 'skyblue'
                                            }}
                                        >
                                            {data.ratio}%
                                        </td>
                                        <td>{data.high_price}원</td>
                                        <td>{data.low_price}원</td>
                                        <td>{data.open_price}원</td>
                                        <td>{data.volume}</td>
                                    </tr>
                                    {expandedRows.includes(data.stock_code) && (
                                        <tr>
                                            <td colSpan="8">
                                                <div className="home-chart-container">
                                                    <ChartOfClose stockCode={data.stock_code} />
                                                    <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '10px' }}>
                                                        <button onClick={() => navigateToComprehensiveAnalysis(data.stock_code, data.stock_name)} className="more-button"> 종합 분석
                                                        </button>
                                                        <button onClick={() => navigate('/techChart', {
                                                            state: {
                                                                stockCode: data.stock_code,
                                                                stockName: data.stock_name
                                                            }
                                                        })} className="like-button"> 기술적 차트
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className='home-rank-container'>
                    <h3>오늘의 추천 종목</h3>
                    <table className="table">
                        <thead>
                        <tr>
                            <th>Rank</th>
                            <th>종목명</th>
                            <th>현재가</th>
                            <th>변동률</th>
                            <th>거래량</th>
                        </tr>
                        </thead>
                        <tbody>
                        {topStockData.map((stock, index) => (
                            <tr key={index}>
                                <td width='10px'>{index + 1}</td>
                                <td>{stock.stock_name}</td>
                                <td>{stock.current_price}원</td>
                                <td
                                    style={{
                                        color: parseFloat(stock.change_rate) < 0 ? 'red' : 'skyblue'
                                    }}
                                >
                                    {stock.change_rate}%
                                </td>
                                <td>{stock.volume}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Home;