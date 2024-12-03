import React from 'react';
import { components } from 'react-select';
import { useNavigate } from 'react-router-dom';
import './CustomOption.css';

const CustomOption = (props) => {
    const navigate = useNavigate();

    const handleComprehensiveAnalysis = (stockCode, stockName) => {
        // props로 받은 handlePageExit 함수를 호출하여 데이터 삭제
        props.handlePageExit();  // 페이지 이동 전에 데이터 삭제
        navigate('/comprehensiveanalysis', {
            state: {
                stockCode: stockCode,
                stockName: stockName,
            }
        });
    };

    return (
        <components.Option {...props}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{props.data.label}</span> {/* 기본적으로 종목명을 표시 */}
                <div>
                    {/* 1번 버튼 (선택 시 동작) */}
                    <button
                        style={{ marginRight: '5px' }}
                        onClick={() => {
                            props.selectOption(props.data);
                        }} className="select-research-button">
                        선택
                    </button>

                    {/* 2번 버튼 (종합 분석 페이지로 이동) */}
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // 부모 클릭 이벤트가 실행되지 않도록 방지
                            handleComprehensiveAnalysis(props.data.value, props.data.label);
                        }} className="select-research-button">
                        분석
                    </button>
                </div>
            </div>
        </components.Option>
    );
};

export default CustomOption;