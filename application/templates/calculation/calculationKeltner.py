import numpy as np


def calculate_channel_angle(keltner_data, period=14):
    if len(keltner_data) < period:
        return None

    # Extract the middle line values from the recent data
    recent_data = keltner_data.tail(period)
    middle_line_values = recent_data['Middle_Line'].tolist()

    indices = np.arange(period)
    sumX = np.sum(indices)
    sumY = np.sum(middle_line_values)
    sumXY = np.sum(indices * middle_line_values)
    sumX2 = np.sum(indices ** 2)

    n = period
    slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2)
    angle = np.arctan(slope) * (180 / np.pi)  # Convert slope to degrees

    return angle


def keltner_calculation1(keltner_data, period=14):
    angle = calculate_channel_angle(keltner_data, period)

    if angle is None:
        return {"error": "데이터가 충분하지 않습니다."}

    # 기본 점수 설정
    score = 5

    # 채널 기울기에 따른 점수
    if angle > 5:
        score -= 2  # 매수
    elif angle < -5:
        score += 2  # 매도

    current_data = keltner_data.iloc[-1]
    current_close = current_data['close']
    upper_band = current_data['Upper_Band']
    lower_band = current_data['Lower_Band']
    middle_line = current_data['Middle_Line']

    # 가격 위치에 따른 점수 조정
    if current_close > upper_band:
        if angle <= 5:
            score += 2  # 매도 강화
    elif current_close < lower_band:
        if angle >= -5:
            score -= 1  # 매수 강화
    elif current_close < middle_line:
        if angle >= -5:
            score -= 2

    # 점수 범위 제한
    score = max(1, min(10, score))

    return {
        "score": score,
        "middle_line": middle_line
    }

def keltner_calculation2(keltner_data, threshold=0.01, period=14):
    angle = calculate_channel_angle(keltner_data, period)

    if angle is None:
        return {"error": "데이터가 충분하지 않습니다."}

    current_data = keltner_data.iloc[-1]
    current_close = current_data['close']
    middle_line = current_data['Middle_Line']

    # 가격이 Middle Line 근처에 있는지 확인
    is_near_middle_line = abs(current_close - middle_line) / middle_line < threshold

    # 기본 점수
    score = 5

    # 기울기 및 가격 위치에 따른 점수
    if angle > 5 and is_near_middle_line:
        score = 3  # 매수
    elif angle < -5 and is_near_middle_line:
        score = 7  # 매도

    return {"score": score}

def keltner_calculation3(keltner_data, period=14):
    angle = calculate_channel_angle(keltner_data, period)

    if angle is None or len(keltner_data) < period + 1:
        return {"error": "데이터가 충분하지 않습니다."}

    # Extract the current and previous data
    last_index = keltner_data.index[-1]
    current_data = keltner_data.iloc[-1]
    prev_data = keltner_data.iloc[-2]

    current_close = current_data['close']
    current_upper = current_data['Upper_Band']
    current_lower = current_data['Lower_Band']

    prev_close = prev_data['close']
    prev_upper = prev_data['Upper_Band']
    prev_lower = prev_data['Lower_Band']

    # 기본 점수
    score = 5

    # Breakout 조건
    if prev_close <= prev_upper and current_close > current_upper and angle > 5:
        score = 3  # 매수
    elif prev_close >= prev_lower and current_close < current_lower and angle < -5:
        score = 7  # 매도

    return {"score": score}


def keltner_calculation4(keltner_data, period=14):
    angle = calculate_channel_angle(keltner_data, period)

    if angle is None:
        return {"error": "데이터가 충분하지 않습니다."}

    current_data = keltner_data.iloc[-1]
    current_close = current_data['close']
    upper_band = current_data['Upper_Band']
    lower_band = current_data['Lower_Band']

    # 기본 점수
    score = 5

    # Overbought/Oversold 점수 조정
    if current_close > upper_band:
        if angle <= 5:
            score = 7  # 매도
    elif current_close < lower_band:
        if angle >= -5:
            score = 3  # 매수

    return {"score": score}

def keltner_calculation_all(keltner_data):
    """
    Combine all Keltner calculation functions and return a weighted final score.
    """
    # 각 계산 함수 실행
    result1 = keltner_calculation1(keltner_data)
    result2 = keltner_calculation2(keltner_data)
    result3 = keltner_calculation3(keltner_data)
    result4 = keltner_calculation4(keltner_data)

    # 결과에서 점수 추출
    scores = [
        result1.get('score', 5),
        result2.get('score', 5),
        result3.get('score', 5),
        result4.get('score', 5)
    ]

    # 가중치 설정
    weights = {
        'kel1': 3,
        'kel2': 2,
        'kel3': 3,
        'kel4': 2
    }

    # 가중 평균 계산
    weighted_scores = [
        scores[0] * weights['kel1'],
        scores[1] * weights['kel2'],
        scores[2] * weights['kel3'],
        scores[3] * weights['kel4']
    ]

    total_weight = sum(weights.values())
    average_score = sum(weighted_scores) / total_weight

    middle_line = result1.get('middle_line', None)

    # 추천 결과 계산
    recommendation = calculate_recommendation(average_score)

    # 최종 결과 반환
    return {
        "name": "Keltner Channel(20, 2)",
        "value": round(middle_line, 2),
        "damm": round(average_score, 2),
        "recommendation": recommendation
    }

def calculate_recommendation(average_score):
    """
    Calculate recommendation based on average score.
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