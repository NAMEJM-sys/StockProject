import React from 'react';
import GaugeChartOfOscillators from './GaugeChartOfOscillators';
import GaugeChartOfMovingAverages from './GaugeChartOfMovingAverages';
import FinalChart from './FinalChart';
import '../pages/Detail.css';

const CombinedChartLayout = ({ stockCode }) => {
  return (
    <div className="chart-container">
      {/* Oscillators chart on the left */}
      <div className="chart-box">
        <GaugeChartOfOscillators stockCode={stockCode} />
      </div>

      {/* Final score chart in the center */}
      <div className="final-chart">
        <FinalChart stockCode={stockCode} />
      </div>

      {/* Moving Averages chart on the right */}
      <div className="chart-box">
        <GaugeChartOfMovingAverages stockCode={stockCode} />
      </div>
    </div>
  );
};

export default CombinedChartLayout;