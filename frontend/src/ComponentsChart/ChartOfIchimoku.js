import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import HighchartsMore from 'highcharts/highcharts-more';
import HighchartsStock from 'highcharts/modules/stock';
import FetchStockDataForCode from '../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode';
import FetchIchimokuData from '../ComponentsFetch/FetchStockOrignal/FetchIchimokuData';
import '../styles/ChangeChart.css'

HighchartsMore(Highcharts);
HighchartsStock(Highcharts);


const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0 5px 15px rgba(0,0,0,.5)',
    zIndex: 1000,
    width: '300px',
    borderRadius: '8px'
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999
};

function Modal({ show, onClose, children }) {
    if (!show) return null;
    return (
        <>
            <div style={overlayStyle} onClick={onClose}></div>
            <div style={modalStyle}>
                {children}
                <button onClick={onClose}>닫기</button>
            </div>
        </>
    );
}

function ChartOfIchimoku({ stockCode }) {
    const [stockData, setStockData] = useState([]);
    const [ichimokuData, setIchimokuData] = useState([]);
    const [options, setOptions] = useState({});
    const [chartType, setChartType] = useState('line');
    const [showModal, setShowModal] = useState(false);
    const [lineVisibility, setLineVisibility] = useState({
        tenkan: true,
        kijun: true,
        spanA: true,
        spanB: true,
        chikou: true,
        ichimokuPositive: true,
        ichimokuNegative: true,
    });

    useEffect(() => {
        if (stockData.length > 0 && ichimokuData.length > 0 && stockCode) {
            const highValues = stockData.map(item => item.high);
            const lowValues = stockData.map(item => item.low);
            const maxHigh = Math.max(...highValues);
            const minLow = Math.min(...lowValues);

            const formattedClosePriceData = stockData.map(item => ({
                date: new Date(item.date).getTime(),
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close
            }));

            const formattedIchimokuData = ichimokuData.map(item => {
                const time = new Date(item.date).getTime();
                return {
                    time,
                    Tenkan_sen: item.Tenkan_sen,
                    Kijun_sen: item.Kijun_sen,
                    Senkou_Span_A: item.Senkou_Span_A,
                    Senkou_Span_B: item.Senkou_Span_B,
                    Chikou_Span: item.Chikou_Span,
                    CloudAreaPositive: item.Senkou_Span_A > item.Senkou_Span_B ? {
                        low: item.Senkou_Span_B,
                        high: item.Senkou_Span_A
                    } : null,
                    CloudAreaNegative: item.Senkou_Span_A <= item.Senkou_Span_B ? {
                        low: item.Senkou_Span_A,
                        high: item.Senkou_Span_B
                    } : null,
                }
            });

            const formattedVolumesData = stockData.map(item =>({
                x: new Date(item.date).getTime(),
                y: item.volume,
            }));

            setOptions({
                chart: {
                    type: 'line',
                    zoomType: 'x',
                    spacing: [10, -60, 10, 10],
                    height: 550,
                    width: 680,
                    events: {
                        render: function () {
                            const chart = this;

                            this.yAxis[0].axisTitle.attr({
                                x: this.plotLeft + 40,
                                y: this.plotTop + 25
                            });

                            this.yAxis[1].axisTitle.attr({
                                x: this.plotLeft + 30,
                                y: this.plotTop + (this.plotHeight * 0.55) + 125
                            });

                            if (!chart.customButton) { // 버튼이 없는 경우에만 생성
                                chart.customButton = chart.renderer.button('', this.plotLeft + 76, this.plotTop + 11, function () {
                                    setShowModal(true);
                                }, {
                                    zIndex: 3,
                                    width: 4,
                                    height: 4,
                                    r: 5
                                })
                                .attr({
                                    fill: '#f0f0f0', // 버튼 배경색
                                    stroke: '#FFFFFF',
                                    'stroke-width': 1
                                })
                                .css({
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    textAlign: 'center',
                                })
                                .add();
                            }
                        },
                    },
                },
                title: {
                    text: ''
                },
                xAxis: {
                    type: 'datetime',
                    labels: { format: '{value:%m-%d}' }
                },
                yAxis: [
                    {
                        title: {
                            text: "Close Price",
                            style: {
                                fontSize: "12px",
                            },
                            rotation: 0,
                        },
                        height: '75%',
                        lineWidth: 2,
                        opposite: true,
                        min: minLow,
                        max: maxHigh,
                        tickAmount: 4,
                    },
                    {
                        title: {
                            text: "Volume",
                            style: {
                                fontSize: "12px",
                            },
                            rotation: 0,
                        },
                        top: '77%',
                        height: '23%',
                        offset: 0,
                        lineWidth: 2,
                        labels: {
                            enabled: false
                        },
                        opposite: true,
                    }
                ],
                series: [
                    {
                        name: 'Close Price',
                        type: chartType === 'line' ? 'line' : 'candlestick', // 차트 유형 변경
                        data: chartType === 'line'
                            ? formattedClosePriceData.map(item => [item.date, item.close]) // Line 차트에선 종가만 사용
                            : formattedClosePriceData.map(item => [item.date, item.open, item.high, item.low, item.close]), // Candlestick 차트에선 OHLC 사용
                        yAxis: 0,
                        pointWidth: chartType === 'candlestick' ? undefined : null,
                        color: chartType === 'line' ? '#0071e3' : '#d32f2f', // Line 차트의 색상 (파란색) 및 Candlestick 하락 색상 (빨간색)
                        upColor: chartType === 'candlestick' ? '#0071e3' : undefined, // 상승 캔들 색상 (파란색)
                        pointPadding: chartType === 'candlestick' ? 0.2 : undefined, // 캔들 차트 간의 간격을 자동 조정
                        groupPadding: chartType === 'candlestick' ? 0.1 : undefined, // 확대 시 캔들 차트 간 간격 조정
                    },
                    {
                        name: 'Tenkan-sen (전환선)',
                        data: formattedIchimokuData.map((item) => [
                            item.time,
                            item.Tenkan_sen,
                        ]),
                        visible: lineVisibility.tenkan,
                        color: '#FF5733',
                        yAxis: 0,
                        marker: { enabled: false },
                        lineWidth: 1,
                    },
                    {
                        name: 'Kijun-sen (기준선)',
                        data: formattedIchimokuData.map((item) => [
                            item.time,
                            item.Kijun_sen,
                        ]),
                        visible: lineVisibility.kijun,
                        color: '#FFC300',
                        yAxis: 0,
                        marker: { enabled: false },
                        lineWidth: 1,
                    },
                    {
                        name: 'Senkou Span A (선행스팬 A)',
                        data: formattedIchimokuData.map((item) => [
                            item.time,
                            item.Senkou_Span_A,
                        ]),
                        visible: lineVisibility.spanA,
                        yAxis: 0,
                        color: '#33FF57',
                        marker: { enabled: false },
                        lineWidth: 1.5,
                    },
                    {
                        name: 'Senkou Span B (선행 스팬 B)',
                        data: formattedIchimokuData.map((item) => [
                            item.time,
                            item.Senkou_Span_B,
                        ]),
                        visible: lineVisibility.spanB,
                        yAxis: 0,
                        color: '#C70039',
                        marker: { enabled: false },
                        lineWidth: 1,
                    },
                    {
                        name: 'Chikou Span (후행스팬)',
                        data: formattedIchimokuData.map((item) => [
                            item.time,
                            item.Chikou_Span,
                        ]),
                        visible: lineVisibility.chikou,
                        yAxis: 0,
                        color: '#8B4513',
                        marker: { enabled: false },
                        lineWidth: 1,
                    },
                    {
                        type: 'arearange',
                        name: 'Ichimonu Cloud Positive',
                        data: formattedIchimokuData.filter(item => item.CloudAreaPositive)
                            .map(item => ({
                                x: item.time,
                                low: item.CloudAreaPositive.low,
                                high: item.CloudAreaPositive.high,
                            })),
                        visible: lineVisibility.ichimokuPositive,
                        yAxis: 0,
                        marker: { enabled: false },
                        color: 'rgba(50, 205, 50, 0.2)', // 옅은 붉은색
                        enableMouseTracking: false, // 구름에 마우스 호버 시 툴팁 비활성화
                    },
                    {
                        type: 'arearange',
                        name: 'Ichimonu Cloud Nagative',
                        data: formattedIchimokuData.filter(item => item.CloudAreaNegative)
                            .map(item => ({
                                x:item.time,
                                low: item.CloudAreaNegative.low,
                                high: item.CloudAreaNegative.high,
                            })),
                        visible: lineVisibility.ichimokuNegative,
                        yAxis: 0,
                        marker: { enabled: false },
                        color: 'rgba(255, 99, 132, 0.3)', // 옅은 붉은색
                        enableMouseTracking: false, // 구름에 마우스 호버 시 툴팁 비활성화
                    },
                    {
                        name: 'volumes',
                        data: formattedVolumesData,
                        type: "column",
                        yAxis: 1,
                        color: "#A9A9A9",
                        pointWidth: 1.5,
                    }
                ],
                legend: {
                    enabled: false // 범례 숨기기
                },
                credits: {
                    enabled: false // Disable the "Highcharts.com" text
                },
                plotOptions: {
                    series: {
                        states: {
                            inactive: {
                                opacity: 1 // 마우스를 올렸을 때 다른 라인의 투명도를 1로 설정해 희미해지지 않도록 설정
                            },
                            hover: {
                                enabled: false // 마우스 호버 시 희미해지는 기능 비활성화
                            }
                        }
                    }
                },
                tooltip: {
                    shared: false, // 툴팁이 공유되는 경우에도 희미해질 수 있으니 비활성화
                    crosshairs: false // 크로스헤어 기능도 끔
                },
                scrollbar: {
                    enabled: true, // 하단 스크롤바 활성화
                },
                rangeSelector: {
                    enabled: true, // 범위 선택 옵션 활성화
                    inputEnabled: false,
                    buttons: [
                        {
                            type: 'month',
                            count: 1,
                            text: '1m'
                        },
                        {
                            type: 'month',
                            count: 3,
                            text: '3m'
                        },
                        {
                            type: 'month',
                            count: 6,
                            text: '6m'
                        },
                        {
                            type: 'ytd',
                            text: 'YTD'
                        },
                        {
                            type: 'year',
                            count: 1,
                            text: '1y'
                        },
                        {
                            type: 'all',
                            text: 'All'
                        }
                    ],
                    selected: 5 // Default 선택 범위 설정 (3개월)
                },
            });
        }
    }, [stockData, ichimokuData, stockCode, chartType, lineVisibility ]);

    const toggleLineVisibility = (line) => {
        setLineVisibility(prev => ({ ...prev, [line]: !prev[line] }));
    };

    return (
        <div className="chart-controls">
            <div>
                <HighchartsReact highcharts={Highcharts} options={options}/>
            </div>

            <div className="custom-buttons">
                <button
                    className={`custom-button-line ${chartType === 'line' ? 'active' : ''}`}
                    onClick={() => setChartType('line')}
                >
                    Line
                </button>
                <button
                    className={`custom-button-candle ${chartType === 'candlestick' ? 'active' : ''}`}
                    onClick={() => setChartType('candlestick')}
                >
                    Candle
                </button>
            </div>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <h4>Ichimoku Settings</h4>
                <label>
                    <input
                        type="checkbox"
                        checked={lineVisibility.tenkan}
                        onChange={() => toggleLineVisibility('tenkan')}
                    />
                    Tenkan-sen<br/>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={lineVisibility.kijun}
                        onChange={() => toggleLineVisibility('kijun')}
                    />
                    Kijun-sen<br/>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={lineVisibility.spanA}
                        onChange={() => toggleLineVisibility('spanA')}
                    />
                    Senkou Span A<br/>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={lineVisibility.spanB}
                        onChange={() => toggleLineVisibility('spanB')}
                    />
                    Senkou Span B<br/>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={lineVisibility.chikou}
                        onChange={() => toggleLineVisibility('chikou')}
                    />
                    Chikou Span<br/>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={lineVisibility.ichimokuPositive}
                        onChange={() => toggleLineVisibility('ichimokuPositive')}
                    />
                    Ichimonu Cloud Positive<br/>
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={lineVisibility.ichimokuNegative}
                        onChange={() => toggleLineVisibility('ichimokuNegative')}
                    />
                    Ichimonu Cloud Negative<br/>
                </label>
            </Modal>

            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData}/>
            <FetchIchimokuData stockCode={stockCode} onIchimokuFetch={setIchimokuData}/>
        </div>
    );
}

export default ChartOfIchimoku;