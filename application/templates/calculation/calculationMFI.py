import pandas as pd
import numpy as np

def mfi_calculation1(stock_data, mfi_data):
    def get_mfi_state_score(current_mfi):
        if current_mfi > 80:
            return 7
        elif current_mfi < 20:
            return 3
        else:
            return 5

    def get_ma_crossover_score(current_mfi_ma_crossover):
        if current_mfi_ma_crossover == 1:
            return 3
        elif current_mfi_ma_crossover == -1:
            return 7
        else:
            return 5

    def get_price_mfi_trend_score (price_trend_direction, mfi_trend_direction):
        if price_trend_direction == '상승' and mfi_trend_direction == '상승':
            return 3  # 상승 추세
        elif price_trend_direction == '하락' and mfi_trend_direction == '하락':
            return 7  # 하락 추세
        elif price_trend_direction == '상승' and mfi_trend_direction == '하락':
            return 6  # 가격 상승, MFI 하락 (약화 가능성)
        elif price_trend_direction == '하락' and mfi_trend_direction == '상승':
            return 4  # 가격 하락, MFI 상승 (반등 가능성)
        else:
            return 5  # 중립 상태

    def calculateOverallScore (current_mfi, current_mfi_ma_crossover, price_trend_direction, mfi_trend_direction):
        mfi_state_score = get_mfi_state_score(current_mfi)
        ma_crossover_score = get_ma_crossover_score(current_mfi_ma_crossover)
        trend_score = get_price_mfi_trend_score(price_trend_direction, mfi_trend_direction)

        element_scores = [mfi_state_score, ma_crossover_score, trend_score]
        weights = [1, 2, 3]
        weighted_scores = [score * weight for score, weight in zip(element_scores, weights)]
        total_weight = sum(weights)
        overall_score = sum(weighted_scores) / total_weight

        return round(overall_score, 2)  # 소수점 2자리까지 표시


    if len(mfi_data) < 14:
        return {"error": "데이터가 충분하지 않습니다."}

    stock_data_df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close', 'volume')))

    # 최신 RSI 데이터
    last_mfi_entry = mfi_data.iloc[-1]
    current_mfi = last_mfi_entry['MFI']
    current_mfi_ma_crossover = last_mfi_entry.get('MFI_MA_Crossover', None)

    # 가격 및 RSI 추세 계산
    price_trend_direction = "상승" if stock_data_df.iloc[-1]['close'] > stock_data_df.iloc[-14]['close'] else "하락"
    mfi_trend_direction = "상승" if current_mfi > mfi_data.iloc[-14]['MFI'] else "하락"

    # 종합 점수 계산
    score = calculateOverallScore(current_mfi, current_mfi_ma_crossover, price_trend_direction,
                                            mfi_trend_direction)

    # 분석 결과 반환
    return {
        "current_mfi": round(current_mfi, 2),
        "score": score
    }

def mfi_calculation2(stock_data, mfi_data):
    swing_range = 2
    data_length = min(len(mfi_data), len(stock_data))

    if data_length < swing_range*2:
        return {'score': None, 'message': '데이터가 충분하지 않습니다.'}

    stock_data_list = list(stock_data.values('date', 'high', 'low', 'close', 'volume'))

    price_lows = find_swing_lows(stock_data_list, swing_range, 'close')
    price_highs = find_swing_highs(stock_data_list, swing_range, 'close')

    mfi_data_list = mfi_data.to_dict('records')


    # RSI 저점과 고점 찾기
    mfi_lows = find_swing_lows(mfi_data_list, swing_range, 'MFI')
    mfi_highs = find_swing_highs(mfi_data_list, swing_range, 'MFI')

    divergence_type = None  # 다이버전스 유형 ('bullish', 'bearish', None)


    # 상승 다이버전스 감지 (Bullish Divergence)
    if len(price_lows) >= 2 and len(mfi_lows) >= 2:
        prev_price_low = price_lows[-2]
        recent_price_low = price_lows[-1]

        prev_mfi_low = next((mfi for mfi in mfi_lows if mfi['date'] == prev_price_low['date']), None)
        recent_mfi_low =next((mfi for mfi in mfi_lows if mfi['date'] == recent_price_low['date']), None)

        if prev_mfi_low and recent_mfi_low:
            if recent_price_low['value'] < prev_price_low['value'] and recent_mfi_low['value'] > prev_mfi_low['value'] :
                divergence_type = 'bullish'


    # 하락 다이버전스 감지 (Bearish Divergence)
    if len(price_highs) >= 2 and len(mfi_highs) >= 2:
        prev_price_high = price_highs[-2]
        recent_price_high = price_highs[-1]

        prev_mfi_high = next((mfi for mfi in mfi_highs if mfi['date'] == prev_price_high['date']), None)
        recent_mfi_high = next((mfi for mfi in mfi_highs if mfi['date'] == recent_price_high['date']), None)

        if prev_mfi_high and recent_mfi_high:
            if recent_price_high['value'] > prev_price_high['value'] and recent_mfi_high['value'] < prev_mfi_high['value']:
                divergence_type = 'bearish'


    score = 5  # 기본 점수 (중립)
    if divergence_type == 'bullish':
        score = 3  # 매수 신호
    elif divergence_type == 'bearish':
        score = 7  # 매도 신호

    return {'score': score, 'divergence_type': divergence_type}

def find_swing_lows(data, swingRange, valueKey):
    swingLows = []
    for i in range(swingRange, len(data) - swingRange):
        isSwingLow = True
        for j in range(1, swingRange + 1):
            if data[i - j][valueKey] <= data[i][valueKey] or data[i + j][valueKey] <= data[i][valueKey]:
                isSwingLow = False
                break
        if isSwingLow:
            swingLows.append({'value': data[i][valueKey], 'index': i, 'date': data[i]['date']})
    return swingLows

def find_swing_highs(data, swingRange, valueKey):
    swingHighs = []
    for i in range(swingRange, len(data) - swingRange):
        isSwingHigh = True
        for j in range(1, swingRange + 1):
            if data[i - j][valueKey] >= data[i][valueKey] or data[i + j][valueKey] >= data[i][valueKey]:
                isSwingHigh = False
                break
        if isSwingHigh:
            swingHighs.append({'value': data[i][valueKey], 'index': i, 'date': data[i]['date']})
    return swingHighs

def mfi_calculation3(mfi_data, period=14):
    lastIndex = len(mfi_data) - 1
    if lastIndex < period:
        return {'score': None, 'message': '데이터가 충분하지 않습니다.'}

    current_data = mfi_data.iloc[lastIndex]

    current_volatility = current_data.get('MFI_Volatility', None)
    current_z_score = current_data.get('MFI_Z_Score', None)

    if current_volatility is None or current_z_score is None:
        return {'score': None, 'message': '변동성 또는 Z-스코어 데이터를 불러오는 데 문제가 발생했습니다.'}

    volatility_values = mfi_data['MFI_Volatility'].iloc[lastIndex - period + 1 : lastIndex + 1]
    avg_volatility = np.mean(volatility_values)

    is_high_volatility = current_volatility > avg_volatility
    is_high_z_score = abs(current_z_score) > 2

    score = 5
    if is_high_volatility and is_high_z_score:
        score = 8  # 매도 경계
    elif is_high_volatility and not is_high_z_score:
        score = 4  # 매수 경계
    elif not is_high_volatility and is_high_z_score:
        score = 6  # 주의
    else:
        score = 5  # 보통

    return {
        'score': score,
    }

def mfi_calculation4(mfi_data):
    if mfi_data.empty:
        return {'score': None, 'current_rsi': None}

    last_row = mfi_data.iloc[-1]
    current_mfi = last_row['MFI']

    fib_levels = {
        'Fib_23.6': last_row['Fib_23.6'],
        'Fib_38.2': last_row['Fib_38.2'],
        'Fib_50': last_row['Fib_50'],
        'Fib_61.8': last_row['Fib_61.8'],
        'Fib_78.6': last_row['Fib_78.6']
    }

    calculated_score = 5

    if current_mfi >= fib_levels['Fib_61.8']:
        calculated_score = 3
    elif current_mfi <= fib_levels['Fib_38.2']:  # 38.2% 이하
        calculated_score = 7  # 매도 신호
    else:
        calculated_score = 5  # 보통 상태

    return {
        'score': calculated_score,
        'current_mfi': round(current_mfi, 2)  # 당일 RSI 값
    }

def mfi_calculation_all(stock_data, mfi_data):
    """
    모든 RSI 분석 함수들을 종합하여 점수와 당일 RSI 값을 반환하는 함수.
    - rsi_calculation1부터 rsi_calculation5까지 종합
    """

    # 각 계산 함수 실행 및 점수 합산
    result1 = mfi_calculation1(stock_data, mfi_data)
    result2 = mfi_calculation2(stock_data, mfi_data)
    result3 = mfi_calculation3(mfi_data)
    result4 = mfi_calculation4(mfi_data)

    # 결과에서 점수 추출
    scores = [
        result1.get('score', 5),
        result2.get('score', 5),
        result3.get('score', 5),
        result4.get('score', 5),
    ]

    # 가중치 설정
    weights = [3, 2, 1, 2]

    # 가중 평균 계산
    weighted_scores = [score * weight for score, weight in zip(scores, weights)]
    total_weight = sum(weights)
    average_score = sum(weighted_scores) / total_weight

    # 당일 RSI 값 (rsi_calculation1에서 반환된 값 사용)
    current_mfi = result1.get('current_mfi', None)

    # 추천 결과 계산 (average_score에 따른 결과)
    recommendation = calculate_recommendation(average_score)

    # 최종 결과 반환
    return {
        "name": "MFI(14)",
        "value": current_mfi,
        "damm": round(average_score, 2),
        "recommendation": recommendation
    }

def calculate_recommendation(average_score):
    """
    average_score에 따른 추천 결과 계산 함수
    """
    if average_score <= 2.0:
        return '강한 매수'
    elif average_score <= 4.0:
        return '매수'
    elif average_score <= 6.0:
        return '보통'
    elif average_score <= 8.0:
        return '매도'
    else:
        return '강한 매도'






