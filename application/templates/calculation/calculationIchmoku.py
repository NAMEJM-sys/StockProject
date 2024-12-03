
def ichimoku_calculation1(ichimoku_data):
    if ichimoku_data.empty or len(ichimoku_data) < 2:
        return {"error": "데이터가 충분하지 않습니다."}

    last_index = ichimoku_data.index[-1]
    prev_data = ichimoku_data.iloc[-2]
    current_data = ichimoku_data.iloc[-1]

    prev_tenkan = prev_data['Tenkan_sen']
    prev_kijun = prev_data['Kijun_sen']
    current_tenkan = current_data['Tenkan_sen']
    current_kijun = current_data['Kijun_sen']

    score = 5  # 기본 보통

    if prev_tenkan <= prev_kijun and current_tenkan > current_kijun:
        score = 3  # 매수
    elif prev_tenkan >= prev_kijun and current_tenkan < current_kijun:
        score = 7  # 매도

    return {
        "score": score,
        "prev_kijun": prev_kijun
    }

def ichimoku_calculation2(ichimoku_data):
    if ichimoku_data.empty or len(ichimoku_data) < 26:
        return {"error": "데이터가 충분하지 않습니다."}

    last_index = ichimoku_data.index[-1]
    current_data = ichimoku_data.iloc[-1]

    current_close = current_data['close']
    senkou_a = current_data['Senkou_Span_A']
    senkou_b = current_data['Senkou_Span_B']

    upper_cloud = max(senkou_a, senkou_b)
    lower_cloud = min(senkou_a, senkou_b)

    score = 5  # 기본 보통

    if current_close > upper_cloud:
        score = 3  # 매수
    elif current_close < lower_cloud:
        score = 7  # 매도

    prev_data = ichimoku_data.iloc[-2]
    prev_close = prev_data['close']

    if prev_close <= lower_cloud and current_close > upper_cloud:
        score -= 1  # 매수 신호 강화
    elif prev_close >= upper_cloud and current_close < lower_cloud:
        score += 1  # 매도 신호 강화

    score = max(1, min(10, score))

    return {"score": score}

def ichimoku_calculation3(ichimoku_data):
    if ichimoku_data.empty or len(ichimoku_data) < 26:
        return {"error": "데이터가 충분하지 않습니다."}

    last_index = len(ichimoku_data) - 27  # Chikou Span은 26일 뒤로 이동
    if last_index < 0:
        return {"error": "데이터가 충분하지 않습니다."}

    current_data = ichimoku_data.iloc[last_index]
    chikou_span = int(current_data['Chikou_Span'])
    current_close = int(current_data['close'])

    score = 5  # 기본 보통

    if chikou_span > current_close:
        score = 3  # 매수
    elif chikou_span < current_close:
        score = 7  # 매도

    return {"score": score}

def ichimoku_calculation4(ichimoku_data):
    if ichimoku_data.empty or len(ichimoku_data) < 52:
        return {"error": "데이터가 충분하지 않습니다."}

    last_index = len(ichimoku_data) - 26  # 구름대는 26일 앞에 표시됨
    current_data = ichimoku_data.iloc[last_index]

    senkou_a = current_data['Senkou_Span_A']
    senkou_b = current_data['Senkou_Span_B']
    cloud_color = current_data['Cloud_Colour']

    cloud_thickness = abs(senkou_a - senkou_b)
    is_thick_cloud = cloud_thickness > (current_data['close'] * 0.03)

    score = 5  # 기본 보통

    if is_thick_cloud and cloud_color == 'Bullish':
        score = 3  # 매수 강화
    elif is_thick_cloud and cloud_color == 'Bearish':
        score = 7  # 매도 강화

    return {"score": score}


def ichimoku_calculation_all(ichimoku_data):
    """
    Combine all Ichimoku calculation functions and return a weighted final score.
    """
    # 각 계산 함수 실행
    result1 = ichimoku_calculation1(ichimoku_data)
    result2 = ichimoku_calculation2(ichimoku_data)
    result3 = ichimoku_calculation3(ichimoku_data)
    result4 = ichimoku_calculation4(ichimoku_data)

    # 결과에서 점수 추출
    scores = [
        result1.get('score', 5),
        result2.get('score', 5),
        result3.get('score', 5),
        result4.get('score', 5)
    ]

    # 가중치 설정
    weights = {
        'ichimoku1': 3,
        'ichimoku2': 2,
        'ichimoku3': 3,
        'ichimoku4': 2
    }

    # 가중 평균 계산
    weighted_scores = [
        scores[0] * weights['ichimoku1'],
        scores[1] * weights['ichimoku2'],
        scores[2] * weights['ichimoku3'],
        scores[3] * weights['ichimoku4']
    ]

    total_weight = sum(weights.values())
    average_score = sum(weighted_scores) / total_weight

    prev_kijun = result1.get('prev_kijun', None)

    # 추천 결과 계산
    recommendation = calculate_recommendation(average_score)

    # 최종 결과 반환
    return {
        "name": "Ichimoku Cloud(9, 26, 52, 26)",
        "value": round(prev_kijun, 2),
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