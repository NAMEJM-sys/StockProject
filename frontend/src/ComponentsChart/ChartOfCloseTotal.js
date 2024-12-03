import React, { useState, useEffect } from "react";
import Highcharts from "highcharts";
import FetchStockDataForCode from "../ComponentsFetch/FetchStockOrignal/FetchStockDataForCode";
import HighchartsReact from "highcharts-react-official";
import HighchartsMore from "highcharts/highcharts-more"; // highcharts-more 모듈 추가
import HighchartsStock from "highcharts/modules/stock";

// 모듈 활성화
HighchartsMore(Highcharts);
HighchartsStock(Highcharts);

function ChartOfCloseTotal({ stockCode }) {
    const [stockData, setStockData] = useState([]);
    const [options, setOptions] = useState({});
    const [chartType, setChartType] = useState('line'); // 차트 유형 상태 추가 ('line'이 기본값)

    useEffect(() => {
        if (stockData.length > 0 && stockCode) {

            const highValues = stockData.map(item => item.high);
            const lowValues = stockData.map(item => item.low);
            const maxHigh = Math.max(...highValues); // 고가 중 가장 높은 값
            const minLow = Math.min(...lowValues);   // 저가 중 가장 낮은 값

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

            // Set chart options based on chartType
            setOptions({
                chart: {
                    type: chartType, // chartType 상태에 따라 차트 유형 변경
                    zoomType: 'x',
                    spacing: [10, 0, 10, 10],
                    height: 500,
                    events:{
                        render: function () {
                            this.yAxis[0].axisTitle.attr({
                                x: this.plotLeft + 30,
                                y: this.plotTop + 20
                            });

                            this.yAxis[1].axisTitle.attr({
                                x: this.plotLeft + 25,
                                y: this.plotTop + (this.plotHeight * 0.85) - 40
                            });
                        }
                    },
                },
                plotOptions: {
                    series: {
                        animation: false // 시리즈별 애니메이션 비활성화
                    }
                },
                title: {
                    text: '',
                },
                accessibility: {
                    enabled: false // 접근성 모듈 비활성화
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
                        height: '25%',
                        offset: 0,
                        lineWidth: 2,
                        labels: {
                            enabled: false // 볼륨에 라벨 비활성화
                        },
                        opposite: true,
                    },
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
                ],
                legend: {
                    enabled: false,
                },
                credits: {
                    enabled: false, // Disable the "Highcharts.com" text
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
                scrollbar: {
                    enabled: false, // 하단 스크롤바 활성화
                },
            });
        }
    }, [stockData, stockCode, chartType]); // chartType이 변경될 때마다 차트 업데이트

    if (!stockCode) return null;

    return (
        <div className="Comprehensive-Analysis-main-chart-container" style={{ width: '100%' }}>
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
        </div>
    );
}

export default ChartOfCloseTotal;