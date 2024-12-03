import React, {useState, useEffect} from "react";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import HighchartsStock from "highcharts/modules/stock"; // Highcharts Stock 모듈 추가
import "../styles/ChangeChart.css";
import FetchChartCCIData from "../ComponentsFetch/FetchChart/FetchChartCCIdata";

HighchartsStock(Highcharts);

function ChartOfCCI({ stockCode }) {
    const [stockData, setStockData] = useState([])
    const [CCIData, setCCIData] = useState([])
    const [options, setOptions] = useState({})
    const [chartType, setChartType] = useState('line'); // 차트 유형 상태


    useEffect(() => {
        if(stockData.length > 0 && CCIData.length>0 && stockCode) {

            const highValues = stockData.map(item => item.high);
            const lowValues = stockData.map(item => item.low);
            const maxHigh = Math.max(...highValues);
            const minLow = Math.min(...lowValues);

            const formattedCCIData = CCIData.map(item => {
                return [
                    new Date(item.date).getTime(),
                    item.CCI
                ];
            });

            const formattedClosePriceData = stockData.map(item => ({
                x: new Date(item.date).getTime(),
                close: item.close,
                open: item.open,
                low: item.low,
                high: item.high,
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
                            text: 'RSI(30, 70)',
                            style: {
                                fontSize: '11px',
                            },
                            rotation: 0,
                        },
                        top: '83%',
                        height: '17%',
                        offset:0,
                        lineWidth:2,
                        softMin: -200,
                        softMax: 200,
                        tickInterval: 100,  // Y축 간격을 50 단위로 설정
                        tickPixelInterval: 40,  // 픽셀 간격을 40px로 설정해 간격을 더 세밀하게 조정
                        endOnTick: true,  // Y축이 가장 가까운 tick에서 끝나도록 설정
                        startOnTick: true,  // Y축이 가장 가까운 tick에서 시작되도록 설정
                        minorTicks: false,  // 보조 눈금선을 비활성화
                        gridLineWidth: 0,  // Y축의 그리드 라인 제거
                        plotBands: [{
                            from: -100,
                            to: 100,
                            color: 'rgba(221, 221, 132, 0.3)' // RSI 범위 표시 (30~70 사이 반투명 영역)
                        }],
                        labels: {
                            step: 2,
                            formatter: function () {
                                if (this.value === -220 || this.value === 0 || this.value === 230) {
                                    return '';  // 20과 80은 빈 문자열로 숨기기
                                }
                                return this.value;  // 나머지 값은 그대로 표시
                            }
                        },
                        plotLines: [
                            {
                                value: 100,
                                color: '#A9A9A9',
                                dashStyle: 'dash',
                                width: 1,
                                zIndex: 5,
                            },
                            {
                                value: -100,
                                color: '#A9A9A9',
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
                        name: 'Volume',
                        type: 'column',
                        data: formattedVolumeData,
                        yAxis: 1,
                        color: '#A9A9A9', // Volume 컬럼 색상
                        pointWidth: 2,
                    },
                    {
                        name: 'CCI',
                        type: 'line',
                        data: formattedCCIData,
                        marker: {
                            enabled: false,
                        },
                        yAxis: 2,
                        color: '#CCCC66',
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
    }, [stockData, CCIData, stockCode, chartType]);

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
                <FetchChartCCIData stockCode={stockCode} onChartCCIFetch={setCCIData}/>
            </div>
        </div>
    );
}

export default ChartOfCCI