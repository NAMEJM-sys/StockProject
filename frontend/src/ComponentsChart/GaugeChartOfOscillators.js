import React, { useState, useEffect } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import SolidGauge from 'highcharts/modules/solid-gauge';
import FetchOscillatorsCalculation from "../ComponentsFetch/FetchCalculation/FetchOscillatorsCalculation";

SolidGauge(Highcharts);

function GaugeChartOfOscillators ({ stockCode }) {
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
        title: '',
        pane: {
            center: ['60%', '80%'],
            size: '100%',
            startAngle: -90,
            endAngle: 90,
            background: {
                backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#EEE',
                innerRadius: '60%',
                outerRadius: '100%',
                shape: 'arc'
            }
        },
        tooltip: {
            enabled: false
        },
        yAxis: {
            min: 0,
            max: 10,
            stops: [
                [0.1, '#55BF3B'], // green
                [0.5, '#DDDF0D'], // yellow
                [0.9, '#DF5353'] // red
            ],
            lineWidth: 0,
            tickWidth: 0,
            minorTickInterval: null,
            tickAmount: 2,
            title: {
                text: ''
            },
            labels: {
                y: 16
            }
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
            data: [parseFloat(adjustedScore) || 0],  // 평균 점수 반영
            dataLabels: {
                format: '<div style="text-align:center"><span style="font-size:25px">{y}</span><br/>' +
                    '<span style="font-size:12px;opacity:0.4">점수</span></div>'
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
            <FetchOscillatorsCalculation stockCode={stockCode} onOscillatorCalculationFetch={setAverageScore}/>
            <HighchartsReact highcharts={Highcharts} options={chartOptions}/>
        </div>
    );
}

export default GaugeChartOfOscillators;