import React, { useState, useEffect } from "react";
import FetchChartRSIData from "../ComponentsFetch/FetchChart/FetchChartRSIData";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsStock from "highcharts/modules/stock";
import "../styles/ChangeChart.css";
import FetchRealTimeDataForRSI from "../ComponentsFetch/FetchStockOrignal/FetchRealTimeDataForRSI";

HighchartsStock(Highcharts);

function ChartOfRSI({ stockCode }) {
    const [stockData, setStockData] = useState([]);
    const [rsiData, setRsiData] = useState([]);
    const [options, setOptions] = useState({});
    const [chartType, setChartType] = useState('line'); // 차트 유형 상태

    useEffect(() => {
        if (stockData.length > 0 && rsiData.length > 0) {
            // 고가 및 저가의 최솟값과 최대값 계산
            const highValues = stockData.map(item => item.high);
            const lowValues = stockData.map(item => item.low);
            const maxHigh = Math.max(...highValues); // 고가 중 가장 높은 값
            const minLow = Math.min(...lowValues);   // 저가 중 가장 낮은 값

            const formattedRSIData = rsiData.map(item => {
                return [
                    new Date(item.date).getTime(),
                    item.RSI
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

            setOptions({
                chart: {
                    height: 730,
                    width: 680,
                    spacing: [10, -60, 10, 10],
                    zoomType: 'x',
                    events: {
                        render: function () {
                            // Close Price 텍스트의 위치 강제 조정
                            this.yAxis[0].axisTitle.attr({
                                x: this.plotLeft + 40,
                                y: this.plotTop + 25
                            });

                            // MFI 텍스트의 위치 강제 조정
                            this.yAxis[1].axisTitle.attr({
                                x: this.plotLeft + 30,
                                y: this.plotTop + (this.plotHeight * 0.55) + 125
                            });

                            // Volume 텍스트의 위치 강제 조정
                            this.yAxis[2].axisTitle.attr({
                                x: this.plotLeft + 38,
                                y: this.plotTop + (this.plotHeight * 0.85) + 15
                            });
                        }
                    }
                },
                title: {
                    text: ''
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
                        min: minLow, // 최저가로 Y축 최소값 설정
                        max: maxHigh, // 최고가로 Y축 최대값 설정
                        tickAmount: 4, // 적절한 Y축 간격을 설정하여 범위를 제한
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
                            text: 'RSI(30, 70)',
                            style: {
                                fontSize: '11px',
                            },
                            rotation: 0,
                        },
                        top: '83%',
                        height: '17%',
                        offset: 0,
                        lineWidth: 2,
                        min: 0,
                        max: 100,
                        tickPositions: [5, 30, 70, 95],
                        plotBands: [{
                            from: 30,
                            to: 70,
                            color: 'rgba(221, 160, 221, 0.2)'
                        }],
                        labels: {
                            formatter: function () {
                                if (this.value === 5 || this.value === 95) {
                                    return '';
                                }
                                return this.value;
                            }
                        },
                        plotLines: [
                            {
                                value: 70,
                                color: 'gray',
                                dashStyle: 'dash',
                                width: 1,
                                zIndex: 5,
                            },
                            {
                                value: 30,
                                color: 'gray',
                                dashStyle: 'dash',
                                width: 1,
                                zIndex: 5,
                            }
                        ],
                        opposite: true,
                    }
                ],
                series: [
                    {
                        name: 'Close Price',
                        type: chartType === 'line' ? 'line' : 'candlestick', // 차트 유형 변경
                        data: chartType === 'line'
                            ? formattedClosePriceData.map(item => [item.x, item.close]) // Line 차트에선 종가만 사용
                            : formattedClosePriceData.map(item => [item.x, item.open, item.high, item.low, item.close]), // Candlestick 차트에선 open, high, low, close 사용
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
                        name: 'Volume',
                        type: 'column',
                        data: formattedVolumeData,
                        yAxis: 1,
                        color: '#A9A9A9', // Volume 컬럼 색상
                        pointWidth: 2,
                    },
                    {
                        name: 'RSI',
                        type: 'line',
                        data: formattedRSIData,
                        marker: {
                            enabled: false,
                        },
                        yAxis: 2,
                        color: '#8E44AD',
                        lineWidth: 1.5,
                    }
                ],
                legend: {
                    enabled: false // 범례 숨기기
                },
                credits: {
                    enabled: false // "Highcharts.com" 표시 비활성화
                },
                tooltip: {
                    shared: true,
                    crosshairs: true,
                    formatter: function () {
                        let tooltipHtml = `<b>${Highcharts.dateFormat('%m. %d', this.x)}</b><br/>`;
                        this.points.forEach(point => {
                            tooltipHtml += `${point.series.name}: <b>${point.y.toFixed(2)}</b><br/>`;
                        });
                        return tooltipHtml;
                    },
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
                scrollbar: {
                    enabled: true, // 하단 스크롤바 활성화
                }
            });
        }
    }, [stockData, rsiData, stockCode, chartType]);

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
            </div>
            <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData} />
            <FetchChartRSIData stockCode={stockCode} onChartRSIFetch={setRsiData} />
        </div>
    );
}

export default ChartOfRSI;