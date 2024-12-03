import React, { useEffect, useState } from "react";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import HighchartsStock from "highcharts/modules/stock";
import "../styles/ChangeChart.css";
import FetchChartMACDData from "../ComponentsFetch/FetchChart/FetchChartMACDData";

HighchartsStock(Highcharts);

function ChartOfMACD({ stockCode }) {
    const [stockData, setStockData] = useState([]);
    const [MACDData, setMACDData] = useState([]);
    const [options, setOptions] = useState({});
    const [chartType, setChartType] = useState('line');

    useEffect(() => {
        if (stockData.length > 0 && MACDData.length > 0) {
            const highValues = stockData.map(item => item.high);
            const lowValues = stockData.map(item => item.low);
            const maxHigh = Math.max(...highValues);
            const minLow = Math.min(...lowValues)

            const formattedMACDData = MACDData.map(item => {
                const time = new Date(item.date).getTime();
                return {
                    time,
                    MACDLine: item.MACD_Line,
                    SignalLine: item.Signal_Line,
                    Histogram: item.Histogram,
                };
            });

            const formattedClosePriceData = stockData.map(item => ({
                x: new Date(item.date).getTime(),
                high: item.high,
                low: item.low,
                open: item.open,
                close: item.close,
            }));

            const formattedVolumeData = stockData.map(item => ({
                x: new Date(item.date).getTime(),
                y: item.volume,
            }));

            setOptions({
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
                                x: this.plotLeft + 27,
                                y: this.plotTop + (this.plotHeight * 0.85) + 8
                            });
                        },
                    },
                },
                title: {
                    text: "",
                },
                accessibility: {
                    enabled: false, // 접근성 모듈 비활성화
                },
                xAxis: {
                    type: "datetime",
                    labels: {
                        format: "{value:%m. %d}",
                    },
                    crosshair: true, // 마우스 호버 시 십자선 표시
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
                        height: '70%',
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
                            text: "MACD",
                            style: {
                                fontSize: "11px", // 폰트 크기
                            },
                            rotation: 0, // 수평 방향으로 제목 회전
                        },
                        top: '83%',
                        height: '17%',
                        offset: 0,
                        lineWidth: 2,
                        opposite: true,
                    },
                ],
                series: [
                    {
                        name: "Close Price",
                        type: chartType === 'line' ? 'line' : 'candlestick',
                        data: chartType === 'line'
                            ? formattedClosePriceData.map(item => [item.x, item.close])
                            : formattedClosePriceData.map(item => [item.x, item.open, item.high, item.low, item.close]),
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
                        name: "Volume",
                        type: "column",
                        data: formattedVolumeData,
                        yAxis: 1,
                        color: "#A9A9A9",
                        pointWidth: 1.5,
                    },
                    {
                        name: "MACD Line",
                        data: formattedMACDData.map((item) => [
                            item.time,
                            item.MACDLine,
                        ]),
                        type: "line",
                        marker: {
                            enabled: false,
                        },
                        yAxis: 2,
                        color: "#0071e3",
                        lineWidth: 1.5,
                    },
                    {
                        name: "Signal Line",
                        data: formattedMACDData.map((item) => [
                            item.time,
                            item.SignalLine,
                        ]),
                        type: "line",
                        marker: {
                            enabled: false,
                        },
                        yAxis: 2,
                        color: "#FF0000",
                        lineWidth: 1.5,
                    },
                    {
                        name: "Histogram",
                        data: formattedMACDData.map((item) => [
                            item.time,
                            item.Histogram,
                        ]),
                        type: "column",
                        yAxis: 2,
                        color: "#00FF00",
                        pointWidth: 1.5,
                    },
                ],
                tooltip: {
                    shared: true, // 툴팁 공유
                    crosshairs: true, // 십자선 표시
                    formatter: function () {
                        let tooltipHtml = `<b>${Highcharts.dateFormat("%m-%d", this.x)}</b><br/>`;
                        this.points.forEach((point) => {
                            tooltipHtml += `${point.series.name}: <b>${point.y.toFixed(2)}</b><br/>`;
                        });
                        return tooltipHtml;
                    },
                },
                credits: {
                    enabled: false,
                },
                legend: {
                    enabled: false,
                },
                plotOptions: {
                    series: {
                        states: {
                            inactive: {
                                opacity: 1, // 마우스를 올렸을 때 다른 라인의 투명도를 1로 설정해 희미해지지 않도록 설정
                            },
                            hover: {
                                enabled: true, // 마우스 호버 시 희미해지는 기능 비활성화
                            },
                        },
                    },
                },
                rangeSelector: {
                    enabled: true, // 범위 선택 옵션 활성화
                    inputEnabled: false,
                    buttons: [
                        {
                            type: "month",
                            count: 1,
                            text: "1m",
                        },
                        {
                            type: "month",
                            count: 3,
                            text: "3m",
                        },
                        {
                            type: "month",
                            count: 6,
                            text: "6m",
                        },
                        {
                            type: "ytd",
                            text: "YTD",
                        },
                        {
                            type: "year",
                            count: 1,
                            text: "1y",
                        },
                        {
                            type: "all",
                            text: "All",
                        },
                    ],
                    selected: 5, // Default 선택 범위 설정 (3개월)
                },
                scrollbar: {
                    enabled: true, // 하단 스크롤바 활성화
                },
            });
        }
    }, [stockData, MACDData, chartType]);

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
                        Line
                    </button>
                </div>
                <FetchStockDataForCode stockCode={stockCode} onSDFCFetch={setStockData}/>
                <FetchChartMACDData stockCode={stockCode} onChartMACDFetch={setMACDData}/>
            </div>
        </div>
    );
}

export default ChartOfMACD;