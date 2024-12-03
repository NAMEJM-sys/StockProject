import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import SolidGauge from 'highcharts/modules/solid-gauge';
import FetchFinalCalculation from "../ComponentsFetch/FetchCalculation/FetchFinalCalculation";

SolidGauge(Highcharts);

function FinalGaugeChart ({ stockCode }) {
    const [averageScore, setAverageScore] = useState(null);
    const [adjustedScore, setAdjustedScore] = useState(null);  // 추가


    useEffect(() => {
        if(averageScore) {
            setAdjustedScore((10 - averageScore).toFixed(2));
        }
    }, [averageScore]);

    const chartOptions = {
        chart: {
            type: 'solidgauge',
            width: 300,  // 너비 설정
            height: 200,  // 높이 설정
        },
        title: {
            text: '',
        },
        pane: {
            center: ['50%', '70%'],
            size: '130%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },
        yAxis: {
            min: 0,
            max: 10,
            stops: [
                [0.1, '#55BF3B'], // 초록
                [0.5, '#DDDF0D'], // 노랑
                [0.9, '#DF5353'], // 빨강
            ],
            lineWidth: 0,
            tickWidth: 0,
            minorTickInterval: null,
            tickAmount: 2,
            labels: {
                y: 16,
            },
        },
        plotOptions: {
            solidgauge: {
                dataLabels: {
                    y: 5,
                    borderWidth: 0,
                    useHTML: true
                }
            },
            series: {
                animation: false // 시리즈별 애니메이션 비활성화
            }
        },
        series: [{
            name: 'Average Score',
            data: [parseFloat(adjustedScore) || 0],
            dataLabels: {
                align: 'center',
                verticalAlign: 'bottom', // 최종 점수를 상단에 배치하기 위한 옵션
                format: '<div style="text-align:center"><span style="font-size:25px">{y}</span><br/>' +
                    '<span style="font-size:12px;opacity:0.4">점수</span></div>',
                y: 50, // y 축 위치 조정 (상단으로 이동)
            },
            tooltip: {
                valueSuffix: ' 점수'
            }
        }],
        credits: {
            enabled: false,
        },
    };

    return (
        <div>
            <FetchFinalCalculation stockCode={stockCode} onFinalCalculationFetch={setAverageScore}/>
            <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
            />
        </div>
    );
}

export default FinalGaugeChart;