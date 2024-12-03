import React, { useEffect, useState } from "react";
import FetchADXData from "../ComponentsFetch/FetchStockOrignal/FetchADXData";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import FetchStockList from "../ComponentsFetch/FetchStockOrignal/FetchStockList";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsStock from "highcharts/modules/stock";
import "../styles/ChangeChart.css"

HighchartsStock(Highcharts);

function ChartOfADX({ stockCode }) {
    const [stockData, setStockData] = useState([]);
    const [stockList, setStockList] = useState([]);
    const [ADXData, setADXData] = useState([]);
    const [options, setOptions] = useState({});
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        if(stockData.length > 0 && stockList.length > 0 && ADXData.length > 0) {
            const highValues = stockData.map(item => item.high);
            const lowValues = stockData.map(item => item.low);
            const maxHigh = Math.max(...highValues);
            const minLow = Math.min(...lowValues);

            const formattedADXData = ADXData.map(item => {
                return [
                    new Date(item.date).getTime(),
                    item.ADX
                ];
            });

            const formattedClosePriceData = stockData.map(item => ({
                x: new Date(item.date).getTime(),
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
            }));

            const formattedVolumeData = stockData.map(item => ({
                x: new Date(item.date).getTime(),
                y: item.volume,
            }));

            setOptions( {
                chart: {
                    height: 700,
                    width: 680,
                    spacing: [10, -60, 10, 10],
                    zoomType: 'x',
                    events: {
                        render: function () {
                            this.yAxis[0].axisTitle.attr({
                                x: this.plotLeft + 40,
                                y: this.plotTop + 25
                            });

                            this.yAxis[1].axisTitle.attr({
                                x: this.plotLeft + 30,
                                y: this.plotTop + (this.plotHeight * 0.55) + 125
                            });

                            this.yAxis[2].axisTitle.attr({
                                x: this.plotLeft + 22,
                                y: this.plotTop + (this.plotHeight * 0.85) + 8
                            });
                        }
                    }
                },
                title: {
                    text: '',
                },
                accessibility: {
                  enabled: false
                },
                xAxis: {
                    type: 'datetime',
                    labels: {
                        format: '{value:%m. %d}', // 날짜 형식
                    },
                    crosshair: true,
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
                        height: '70%',
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
                            rotation: 0,
                        },
                        top: '72%',
                        height: '10%',
                        offset: 0,
                        lineWidth: 2,
                        labels: {
                            enabled: false // 볼륨에 라벨 비활성화
                        },
                        opposite: true,
                    },
                    {
                        title: {
                            text: 'ADX',
                            style: {
                                fontSize: '11px'
                            },
                            rotation: 0,
                        },
                        offset: 0,
                        lineWidth: 2,
                        top: '83%',
                        height: '17%',
                        min: 0,
                        max: 50,
                        tickPositions: [0, 10, 20, 30, 40, 50],
                        opposite: true,
                        labels: {
                            formatter: function () {
                                if(this.value === 50) {
                                    return '';
                                }
                                return this.value;
                            }
                        }
                    }
                ],
                series: [
                    {
                        name: 'Close Price',
                        type: chartType === 'line' ? 'line' : 'candlestick', // 차트 유형 변경
                        data: chartType === 'line'
                            ? formattedClosePriceData.map(item => [item.x, item.close]) // Line 차트에선 종가만 사용
                            : formattedClosePriceData.map(item => [item.x, item.open, item.high, item.low, item.close]), // Candlestick 차트에선 open, high, low, close 사용
                        marker: { enabled: false, },
                        yAxis: 0, // 첫 번째 yAxis (Close Price)
                        pointWidth: chartType === 'candlestick' ? undefined : null,
                        color: chartType === 'line' ? '#0071e3' : '#d32f2f', // Line 차트의 색상 (파란색) 및 Candlestick 하락 색상 (빨간색)
                        upColor: chartType === 'candlestick' ? '#0071e3' : undefined, // 상승 캔들 색상 (파란색)
                        pointPadding: chartType === 'candlestick' ? 0.2 : undefined, // 캔들 차트 간의 간격을 자동 조정
                        groupPadding: chartType === 'candlestick' ? 0.1 : undefined, // 확대 시 캔들 차트 간 간격 조정
                    },
                    {
                        name: 'Volume',
                        type: 'column',
                        data: formattedVolumeData,
                        yAxis: 1,
                        color: '#A9A9A9', // Volume 컬럼 색상
                        pointWidth: 2,
                    },
                    {
                        name: 'ADX',
                        type: 'line',
                        data: formattedADXData,
                        marker: {
                            enabled: false,
                        },
                        yAxis: 2,
                        color: '#8E44AD',
                        lineWidth: 1.5,
                    },
                ],
                tooltip: {
                    shared: true,
                    crosshairs: true,
                    formatter: function () {
                        let tooltipHtml = `<b>${Highcharts.dateFormat('%m. %d', this.x)}</b><br/>`;
                        this.points.forEach(point => {
                            tooltipHtml += `${point.series.name}: <b>${point.y.toFixed(2)}</b><br/>`;
                        });
                        return tooltipHtml;
                    }
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
                credits: {
                    enabled: false,
                },
                legend: {
                    enabled: false,
                },
                scrollbar: {
                    enabled: true, // 하단 스크롤바 활성화
                }
            })
        }
    }, [stockData, stockList, ADXData, chartType])

    return (
        <div>
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
                <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData}/>
                <FetchADXData stockCode={stockCode} onADXFetch={setADXData}/>
                <FetchStockList onListFetch={setStockList}/>
            </div>
        </div>
    )
}

export default ChartOfADX;