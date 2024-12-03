import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more"; // highcharts-more 모듈 추가
import HighchartsStock from "highcharts/modules/stock";  // Highcharts Stock 모듈 추가
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import FetchKeltnerData from "../ComponentsFetch/FetchStockOrignal/FetchKeltnerData";
import '../styles/ChangeChart.css'

HighchartsMore(Highcharts);
HighchartsStock(Highcharts);

function ChartOfKeltner({ stockCode }) {
    const [stockData, setStockData] = useState([]);
    const [keltnerData, setKeltnerData] = useState([]);
    const [options, setOptions] = useState({});
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        if (stockData.length > 0 && keltnerData.length > 0 && stockCode) {
            const highValues = stockData.map(item => item.high);
            const lowValues = stockData.map(item => item.low);
            const maxHigh = Math.max(...highValues);
            const minLow = Math.min(...lowValues)

            const formattedClosePriceData = stockData.map(item => ({
                    date: new Date(item.date).getTime(),
                    high: item.high,
                    low: item.low,
                    open: item.open,
                    close: item.close,
                }))


            const formattedKeltnerData = keltnerData.map(item => {
                const time = new Date(item.date).getTime();
                return {
                    time,
                    upperBand: item.Upper_Band,
                    middleLine: item.Middle_Line,
                    lowerBand: item.Lower_Band,
                };
            })

            const formattedVolumeData = stockData.map(item => ({
                x: new Date(item.date).getTime(),
                y: item.volume,
            }));

            const areaRangeData = formattedKeltnerData.map(item => [
                item.time,
                item.lowerBand, // 하단 값
                item.upperBand  // 상단 값
            ]);

            console.log(areaRangeData);

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
                                y: this.plotTop + (this.plotHeight * 0.55) + 125
                            });
                        },
                    },
                },
                title: {
                    text: '',
                },
                xAxis: {
                    type: 'datetime', // datetime 유형으로 변경
                    labels: {
                        format: '{value:%m-%d}', // 날짜 형식
                    },
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
                            : formattedClosePriceData.map(item => [item.date, item.open, item.high, item.low, item.close]), // Candlestick 차트에선 open, high, low, close 사용
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
                        name: 'Keltner Channel (Area)',
                        type: 'arearange',
                        data: areaRangeData,
                        color: 'rgba(211, 211, 211, 0.3)',
                        yAxis: 0,
                        lineWidth: 0,
                        enableMouseTracking: false,
                    },
                    {
                        name: 'Upper Band',
                        data: formattedKeltnerData.map((item) => [
                            item.time,
                            item.upperBand,
                        ]),
                        color: '#8A8A8A', // 하늘색
                        lineWidth: 1.5,
                        yAxis: 0,
                        marker: {
                            enabled: false,
                        },
                        dashStyle: 'solid',
                    },
                    {
                        name: 'Middle Line',
                        data: formattedKeltnerData.map((item) => [
                            item.time,
                            item.middleLine,
                        ]),
                        color: '#8A8A8A', // 하늘색
                        lineWidth: 1.5,
                        yAxis: 0,
                        marker: {
                            enabled: false,
                        },
                        dashStyle: 'solid',
                    },
                    {
                        name: 'Lower Band',
                        data: formattedKeltnerData.map((item) => [
                            item.time,
                            item.lowerBand,
                        ]),
                        color: '#8A8A8A', // 하늘색
                        lineWidth: 1.5,
                        yAxis: 0,
                        marker: {
                            enabled: false,
                        },
                        dashStyle: 'solid',
                    },
                    {
                        name: "Volume",
                        type: "column",
                        data: formattedVolumeData,
                        yAxis: 1,
                        color: "#A9A9A9",
                        pointWidth: 1.5,
                    },
                ],
                legend: {
                    enabled: false, // Show legend to distinguish between lines
                },
                credits: {
                    enabled: false, // Disable the "Highcharts.com" text
                },
                tooltip: {
                    shared: true,
                    crosshairs: true,
                    formatter: function () {
                        let tooltipHtml = `<b>${Highcharts.dateFormat("%m-%d", this.x)}</b><br/>`;
                        this.points.forEach((point) => {
                            tooltipHtml += `${point.series.name}: <b>${point.y.toFixed(2)}</b><br/>`;
                        });
                        return tooltipHtml;
                    },
                },
                scrollbar: {
                    enabled: true, // 하단 스크롤바 활성화
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
    }, [stockData, keltnerData, stockCode, chartType]);

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
                <FetchKeltnerData stockCode={stockCode} onKelFetch={setKeltnerData}/>
            </div>
        </div>
    );
}

export default ChartOfKeltner;