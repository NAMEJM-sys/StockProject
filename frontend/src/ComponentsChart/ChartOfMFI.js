import React, { useState, useEffect } from "react";
import FetchChartMFIData from "../ComponentsFetch/FetchChart/FetchChartMFIData";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import HighchartsStock from "highcharts/modules/stock";
import "../styles/ChangeChart.css";

HighchartsStock(Highcharts);

function ChartOfMFI({ stockCode }) {
    const [stockData, setStockData] = useState([]);
    const [MFIData, setMFIData] = useState([]);
    const [options, setOptions] = useState({});
    const [chartType, setChartType] = useState('line');


    useEffect(() => {
        if (stockData.length > 0 && MFIData.length > 0 && stockCode) {

            const highValues = stockData.map(item => item.high);
            const lowValues = stockData.map(item => item.low);
            const maxHigh = Math.max(...highValues);
            const minLow = Math.min(...lowValues);

            const formattedMFIData = MFIData.map(item => [
                new Date(item.date).getTime(),
                item.MFI
            ]);

            const formattedVolumeData = stockData.map(item => ({
                x: new Date(item.date).getTime(),
                y: item.volume,
            }));

            const formattedClosePriceData = stockData.map(item => ({
                x: new Date(item.date).getTime(),
                close: item.close,
                open: item.open,
                low: item.low,
                high: item.high,
            }));

            setOptions({
                chart: {
                    height: 730, // 차트 전체 높이 설정
                    width: 680,
                    spacing: [10, -60, 10, 10],
                    zoomType: 'x', // x축을 기준으로 확대 가능
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
                                x: this.plotLeft + 38,
                                y: this.plotTop + (this.plotHeight * 0.85) + 15
                            });
                        }
                    }
                },
                title: {
                    text: ' ' // 차트 제목 비움
                },
                accessibility: {
                    enabled: false // 접근성 비활성화
                },
                xAxis: {
                    type: 'datetime', // x축은 날짜 형식
                    labels: {
                        format: '{value:%m. %d}', // 날짜 형식
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
                            rotation: 0, //
                        },
                        top: '72%',
                        height: '10%',
                        offset: 0,
                        lineWidth: 2,
                        labels: {
                            enabled: false
                        },
                        opposite: true,
                    },
                    {
                        title: {
                            text: 'MFI(20, 80)',
                            style: {
                                fontSize: '11px', // 폰트 크기
                            },
                            rotation: 0,
                        },
                        top: '83%',
                        height: '17%',
                        offset: 0,
                        lineWidth: 2,
                        min: 0,
                        max: 100,
                        tickPositions: [5, 20, 80, 95],
                        plotBands: [{
                            from: 20,
                            to: 80,
                            color: 'rgba(144, 238, 144, 0.1)' // MFI의 20~80 구간에 반투명 색상 추가
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
                                value: 80,
                                color: 'gray',
                                dashStyle: 'dash',
                                width: 1,
                                zIndex: 5,
                            },
                            {
                                value: 20,
                                color: 'gray',
                                dashStyle: 'dash',
                                width: 1,
                                zIndex: 5,
                            }
                        ],
                        opposite: true, // 왼쪽에 위치
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
                        data: formattedVolumeData, // Volume 데이터
                        yAxis: 1, // 세 번째 yAxis (Volume)
                        color: '#A9A9A9', // Volume 컬럼 색상
                        pointWidth: 2,
                    },
                    {
                        name: 'MFI',
                        type: 'line',
                        data: formattedMFIData, // MFI 데이터
                        marker: {
                            enabled: false,
                        },
                        yAxis: 2, // 두 번째 yAxis (MFI)
                        color: '#66CC75', // MFI 라인 색상
                        lineWidth: 1.5,
                    },
                ],
                legend: {
                    enabled: false // 범례 활성화
                },
                credits: {
                    enabled: false // "Highcharts.com" 텍스트 비활성화
                },
                tooltip: {
                    shared: true, // 툴팁 공유
                    crosshairs: true, // 십자선 표시
                    formatter: function () {
                        let tooltipHtml = `<b>${Highcharts.dateFormat('%m-%d', this.x)}</b><br/>`;
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
                scrollbar: {
                    enabled: true, // 하단 스크롤바 활성화
                }
            });
        }
    }, [stockData, MFIData, stockCode, chartType]);

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
                <FetchChartMFIData stockCode={stockCode} onChartMFIFetch={setMFIData}/>
            </div>
        </div>
    );
}

export default ChartOfMFI;