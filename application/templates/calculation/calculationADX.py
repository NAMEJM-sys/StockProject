import numpy as np

def adx_calculation1(adx_data, period=14):

    def calculate_ema(values, period):
        k = 2 / (period+1)
        ema = values[0]
        for index in range(1, len(values)):
            curr = values[index]
            ema = curr * k + ema * (1 - k)
        return ema

    if adx_data.empty or len(adx_data) < period:
        return {"error": "데이터가 충분하지 않습니다."}

    recent_adx = adx_data['ADX'].tail(period).tolist()
    avg_adx = calculate_ema(recent_adx, period)

    if avg_adx >= 25:
        score = 5  # 추세는 강하나 방향성은 추가 분석 필요
    elif avg_adx <= 20:
        score = 5  # 추세 약함
    else:
        score = 5  # 보통

    return {
        "avg_adx": avg_adx,
        "score": score
    }

def adx_calculation2(adx_data, period=14):

    def calculate_ema(values, period):
        k = 2 / (period + 1)
        ema = []

        for index, value in enumerate(values):
            if index == 0:
                ema.append(value)
            else:
                ema.append(value * k + ema[index - 1] * (1 - k))
        return ema

    di_plus_values = adx_data['DI14Plus']
    di_minus_values = adx_data['DI14Minus']

    di_plus_ema = calculate_ema(di_plus_values, period)
    di_minus_ema = calculate_ema(di_minus_values, period)

    current_di_plus_ema = di_plus_ema[-1]
    current_di_minus_ema = di_minus_ema[-1]
    prev_di_plus_ema = di_plus_ema[-2]
    prev_di_minus_ema = di_minus_ema[-2]

    if prev_di_plus_ema <= prev_di_minus_ema and current_di_plus_ema > current_di_minus_ema:
        score = 3  # 매수
    elif prev_di_plus_ema >= prev_di_minus_ema and current_di_plus_ema < current_di_minus_ema:
        score = 7  # 매도
    else:
        score = 5  # 보통

    return {
        "score": score
    }

def adx_calculation3(adx_data, period=14):
    if adx_data.empty or len(adx_data) < period:
        return {"error": "데이터가 충분하지 않습니다."}

    # 최근 데이터 추출
    recent_data = adx_data.tail(period)
    adx_values = recent_data['ADX']

    # 선형 회귀를 통한 ADX 추세 분석
    indices = np.arange(period)
    slope, intercept = np.polyfit(indices, adx_values, 1)

    # 점수 조정
    score_adjustment = 0
    if slope > 0:
        # 추세 강도 강화
        last_index = adx_data.index[-1]
        di_plus = adx_data.loc[last_index, 'DI14Plus']
        di_minus = adx_data.loc[last_index, 'DI14Minus']

        if di_plus > di_minus:
            score_adjustment -= 1  # 매수 쪽으로
        elif di_plus < di_minus:
            score_adjustment += 1  # 매도 쪽으로

    # 기본 점수는 5점
    score = 5 + score_adjustment
    score = max(1, min(10, score))

    return {
        "score": score
    }

def adx_calculation4(adx_data, period=14):
    def calculate_ema(values, period):
        k = 2 / (period + 1)
        ema = []

        for index, value in enumerate(values):
            if index == 0:
                ema.append(value)
            else:
                ema.append(value * k + ema[index - 1] * (1 - k))
        return ema

    if adx_data.empty or len(adx_data) < period:
        return {"error": "데이터가 충분하지 않습니다."}

    adx_values = adx_data['ADX'].tail(period)
    di_plus_values = adx_data['DI14Plus'].tail(period)
    di_minus_values = adx_data['DI14Minus'].tail(period)

    adx_ema = calculate_ema(adx_values, period)[-1]
    di_plus_ema = calculate_ema(di_plus_values, period)[-1]
    di_minus_ema = calculate_ema(di_minus_values, period)[-1]

    if adx_ema >= 25:
        if di_plus_ema > di_minus_ema:
            score = 3  # 강한 상승 추세 (매수)
        elif di_plus_ema < di_minus_ema:
            score = 7  # 강한 하락 추세 (매도)
        else:
            score = 5  # 보통
    else:
        score = 5  # 보통

    return {
        "score": score
    }

def adx_calculation_all(adx_data):
    """
    모든 ADX 계산 함수들을 종합하여 최종 점수와 지표 값을 반환하는 함수.
    """
    # 각 계산 함수 실행
    result1 = adx_calculation1(adx_data)
    result2 = adx_calculation2(adx_data)
    result3 = adx_calculation3(adx_data)
    result4 = adx_calculation4(adx_data)

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

    # ADX 지표 값 (result1에서 평균 ADX 값을 사용)
    avg_adx = result1.get('avg_adx', None)

    # 추천 결과 계산
    recommendation = calculate_recommendation(average_score)

    # 최종 결과 반환
    return {
        "name": "ADX(14, 14, 1)",
        "value": round(avg_adx, 2) if avg_adx is not None else None,
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