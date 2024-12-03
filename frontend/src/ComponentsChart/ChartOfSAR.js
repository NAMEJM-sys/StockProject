import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import FetchParabolicSARData from "../ComponentsFetch/FetchStockOrignal/FetchParabolicSARData";
import HighchartsStock from "highcharts/modules/stock";
import '../styles/ChangeChart.css'

HighchartsStock(Highcharts);

function ChartOfSAR({ stockCode }) {
    const [stockData, setStockData] = useState([]);
    const [stockSAR, setStockSAR] = useState([]);
    const [options, setOptions] = useState({});
    const [chartType, setChartType] = useState('line')

    useEffect(() => {
        if (stockData.length > 0 && stockSAR.length > 0 && stockCode) {
            const highValues = stockData.map(item => item.high);
            const lowValues = stockData.map(item => item.low);
            const maxHigh = Math.max(...highValues);
            const minLow = Math.min(...lowValues);

            const dataForChart = stockData.map(item => ({
                date: new Date(item.date).getTime(), // timestamp로 변경
                close: item.close,
                open: item.open,
                low: item.low,
                high: item.high,
                })).sort((a, b) => new Date(a.date) - new Date(b.date));

            const sarForChart = stockSAR
                .map(item => ({
                    date: new Date(item.date).getTime(), // timestamp로 변경
                    sar: item.Parabolic_SAR,
                }))
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            const formattedVolumeData = stockData.map(item => ({
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
                            this.yAxis[0].axisTitle.attr({
                                x: this.plotLeft + 40,
                                y: this.plotTop + 25
                            });

                            this.yAxis[1].axisTitle.attr({
                                x: this.plotLeft + 30,
                                y: this.plotTop + (this.plotHeight * 0.55) + 115
                            });
                        }
                    }
                },
                title: {
                    text: ``,
                },
                xAxis: {
                    type: 'datetime', // datetime 유형으로 변경
                    labels: {
                        format: '{value:%m-%d}', // 날짜 형식
                    },
                    crosshair: true, // 마우스 호버 시 십자선 표시
                },
                yAxis: [
                    {
                        title: {
                            text: 'Close Price',
                            style: {
                                fontSize: '12px',
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
                            text: 'Volume',
                            style: {
                                fontSize: '12px',
                            },
                            rotation: 0, //
                        },
                        top: '77%',
                        height: '23%',
                        offset: 0,
                        lineWidth: 2,
                        labels: {
                            enabled: false
                        },
                        opposite: true,
                    },

                ],
                series: [
                    {
                        name: 'Close Price',
                        type: chartType === 'line' ? 'line' : 'candlestick', // 차트 유형 변경
                        data: chartType === 'line'
                            ? dataForChart.map(item => [item.date, item.close]) // Line 차트에선 종가만 사용
                            : dataForChart.map(item => [item.date, item.open, item.high, item.low, item.close]), // Candlestick 차트에선 open, high, low, close 사용
                        marker: {
                            enabled: false,
                        },
                        yAxis: 0, // 첫 번째 yAxis (Close Price)
                        pointWidth: chartType === 'candlestick' ? undefined : null,
                        color: chartType === 'line' ? '#0071e3' : '#d32f2f', // Line 차트의 색상 (파란색) 및 Candlestick 하락 색상 (빨간색)
                        upColor: chartType === 'candlestick' ? '#0071e3' : undefined, // 상승 캔들 색상 (파란색)
                        pointPadding: chartType === 'candlestick' ? 0.2 : undefined, // 캔들 차트 간의 간격을 자동 조정
                        groupPadding: chartType === 'candlestick' ? 0.1 : undefined, // 확대 시 캔들 차트 간 간격 조정
                    },
                    {
                        name: 'Parabolic SAR',
                        type: 'scatter', // Scatter plot for SAR
                        data: sarForChart.map(item => [item.date, item.sar]),
                        marker: {
                            symbol: 'plus',
                            radius: 1, // 점 크기 설정
                        },
                        yAxis: 0,
                        color: '#4B4B4B', // 점 색상 설정 (Parabolic SAR 색상)
                        tooltip: {
                            pointFormat: 'Parabolic SAR: <b>{point.y}</b>',
                        },
                    },
                    {
                        name: 'Volume',
                        type: 'column',
                        data: formattedVolumeData, // Volume 데이터
                        yAxis: 1, // 세 번째 yAxis (Volume)
                        color: '#A9A9A9', // Volume 컬럼 색상
                        pointWidth: 2,
                    },
                ],
                legend: {
                    enabled: false, // Show legend to distinguish between Close Price and Parabolic SAR
                },
                credits: {
                    enabled: false, // Disable the "Highcharts.com" text
                },
                tooltip: {
                    shared: true,
                    crosshairs: true,
                },
                plotOptions: {
                    series: {
                        states: {
                            inactive: {
                                opacity: 1 // 마우스를 올렸을 때 다른 라인의 투명도를 1로 설정해 희미해지지 않도록 설정
                            },
                            hover: {
                                enabled: true // 마우스 호버 시 희미해지는 기능 비활성화
                            }
                        }
                    }
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
    }, [stockData, stockSAR, stockCode, chartType]);

    return (
        <div>
            <div className="chart-controls">
                <div>
                    <HighchartsReact highcharts={Highcharts} options={options} />
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
                <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData}/>
                <FetchParabolicSARData stockCode={stockCode} onSARFetch={setStockSAR}/>
            </div>
        </div>
    );
}

export default ChartOfSAR;