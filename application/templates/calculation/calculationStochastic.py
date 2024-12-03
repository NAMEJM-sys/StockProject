import pandas as pd
import numpy as np

def find_swing_lows(data, swingRange, valueKey):
    swingLows = []
    for i in range(swingRange, len(data) - swingRange):
        isSwingLow = True
        for j in range(1, swingRange + 1):
            # Pandas DataFrame 접근 방법 수정
            if data.iloc[i - j][valueKey] <= data.iloc[i][valueKey] or data.iloc[i + j][valueKey] <= data.iloc[i][valueKey]:
                isSwingLow = False
                break
        if isSwingLow:
            swingLows.append({'value': data.iloc[i][valueKey], 'index': i, 'date': data.iloc[i]['date']})
    return swingLows

def find_swing_highs(data, swingRange, valueKey):
    swingHighs = []
    for i in range(swingRange, len(data) - swingRange):
        isSwingHigh = True
        for j in range(1, swingRange + 1):
            # Pandas DataFrame 접근 방법 수정
            if data.iloc[i - j][valueKey] >= data.iloc[i][valueKey] or data.iloc[i + j][valueKey] >= data.iloc[i][valueKey]:
                isSwingHigh = False
                break
        if isSwingHigh:
            swingHighs.append({'value': data.iloc[i][valueKey], 'index': i, 'date': data.iloc[i]['date']})
    return swingHighs

def calculate_divergence_and_trend_score(stock_data, stochastic_data):
    swing_range = 2
    data_length = min(len(stock_data), len(stochastic_data))

    if isinstance(stock_data, pd.DataFrame) is False:
        stock_data = pd.DataFrame(list(stock_data.values('date', 'close')))

    if isinstance(stochastic_data, np.ndarray):
        stochastic_data = pd.DataFrame(stochastic_data, columns=['date', 'perK'])

    if data_length < swing_range * 2:
        return {"error": "데이터가 충분하지 않습니다."}

    # 스윙 하한값 및 스윙 상한값 계산
    price_lows = find_swing_lows(stock_data, swing_range, 'close')
    price_highs = find_swing_highs(stock_data, swing_range, 'close')

    stoch_lows = find_swing_lows(stochastic_data, swing_range, 'perK')
    stoch_highs = find_swing_highs(stochastic_data, swing_range, 'perK')

    divergence_type = None  # 'bullish', 'bearish', None

    # 상승 다이버전스 감지
    if len(price_lows) >= 2 and len(stoch_lows) >= 2:
        prev_price_low = price_lows[-2]
        recent_price_low = price_lows[-1]
        prev_stoch_low = next((low for low in stoch_lows if low['date'] == prev_price_low['date']), None)
        recent_stoch_low = next((low for low in stoch_lows if low['date'] == recent_price_low['date']), None)

        if prev_stoch_low and recent_stoch_low:
            if recent_price_low['value'] < prev_price_low['value'] and recent_stoch_low['value'] > prev_stoch_low['value']:
                divergence_type = 'bullish'

    # 하락 다이버전스 감지
    if len(price_highs) >= 2 and len(stoch_highs) >= 2:
        prev_price_high = price_highs[-2]
        recent_price_high = price_highs[-1]
        prev_stoch_high = next((high for high in stoch_highs if high['date'] == prev_price_high['date']), None)
        recent_stoch_high = next((high for high in stoch_highs if high['date'] == recent_price_high['date']), None)

        if prev_stoch_high and recent_stoch_high:
            if recent_price_high['value'] > prev_price_high['value'] and recent_stoch_high['value'] < prev_stoch_high['value']:
                divergence_type = 'bearish'

    # 점수 부여
    calculated_score = 5  # 기본 점수
    if divergence_type == 'bullish':
        calculated_score = 3  # 매수
    elif divergence_type == 'bearish':
        calculated_score = 7  # 매도

    return {"score": calculated_score}

def stochastic_total_calculation(stock_data, stochastic_data):
    calculated_score_data = calculate_divergence_and_trend_score(stock_data, stochastic_data)

    if "error" in calculated_score_data:
        return calculated_score_data


    calculated_score = calculated_score_data['score']

    weights = {
        'basic': 2,  # 백엔드 기본 점수 가중치
        'calculated': 3  # 클라이언트 계산 점수 가중치
    }

    # 최신 스토캐스틱 데이터의 점수와 계산된 점수를 가중치로 결합
    latest_data = stochastic_data.iloc[-1]
    backend_score = latest_data['score']

    total_score = (backend_score * weights['basic'] + calculated_score * weights['calculated']) / (weights['basic'] + weights['calculated'])

    # 점수에 따른 추천 생성
    recommendation = get_recommendation(total_score)

    return {
        "name": "Stochastic %K(14, 3, 3)",
        "value": round(latest_data['perK'], 2),
        "damm": round(total_score, 2),
        "recommendation": recommendation
    }

def get_recommendation(score):
    if score <= 2.0:
        return '강한 매수'
    elif score <= 4.0:
        return '매수'
    elif score <= 6.0:
        return '보통'
    elif score <= 8.0:
        return '매도'
    else:
        return '강한 매도'