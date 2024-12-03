
def macd_calculation1(df_macd, period=14):
    if len(df_macd) < period + 1:
        return {"error": "데이터가 충분하지 않습니다."}

    lastIndex = len(df_macd) - 1

    currentMACD = df_macd.iloc[lastIndex]['MACD_Line']
    currentSignal = df_macd.iloc[lastIndex]['Signal_Line']
    prevMACD = df_macd.iloc[lastIndex - 1]['MACD_Line']
    prevSignal = df_macd.iloc[lastIndex - 1]['Signal_Line']

    score = 5  # 기본 보통

    # 1. MACD와 Signal Line의 교차 분석
    if prevMACD < prevSignal and currentMACD > currentSignal:
        score = 3  # 매수
    elif prevMACD > prevSignal and currentMACD < currentSignal:
        score = 7  # 매도

    # 2. 크로스오버 예상 시점 계산 (선형 회귀)
    macd_indices = df_macd.index[-period:].tolist()
    macd_values = df_macd['MACD_Line'].iloc[-period:].tolist()
    signal_values = df_macd['Signal_Line'].iloc[-period:].tolist()

    # 선형 회귀 계산
    n = period
    sumX = sum(macd_indices)
    sumYMacd = sum(macd_values)
    sumYSignal = sum(signal_values)
    sumXYMacd = sum(x * y for x, y in zip(macd_indices, macd_values))
    sumXYSignal = sum(x * y for x, y in zip(macd_indices, signal_values))
    sumX2 = sum(x ** 2 for x in macd_indices)

    denominator = n * sumX2 - sumX ** 2
    if denominator == 0:
        slopeMacd = 0
        slopeSignal = 0
    else:
        slopeMacd = (n * sumXYMacd - sumX * sumYMacd) / denominator
        interceptMacd = (sumYMacd - slopeMacd * sumX) / n

        slopeSignal = (n * sumXYSignal - sumX * sumYSignal) / denominator
        interceptSignal = (sumYSignal - slopeSignal * sumX) / n

    a = slopeMacd - slopeSignal
    b = interceptMacd - interceptSignal

    daysToCrossover = None

    if a != 0:
        t_crossover = -b / a
        daysToCrossover = t_crossover - df_macd.index[-1]
        if daysToCrossover >= 0 and daysToCrossover <= 3:
            if slopeMacd > slopeSignal:
                score -= 1  # 매수 쪽으로
            else:
                score += 1  # 매도 쪽으로

    # 3. MACD 히스토그램 추세 분석
    currentHistogram = df_macd.iloc[lastIndex]['Histogram']
    prevHistogram = df_macd.iloc[lastIndex - 1]['Histogram']

    if currentHistogram > prevHistogram:
        score -= 1  # 매수 쪽으로
    elif currentHistogram < prevHistogram:
        score += 1  # 매도 쪽으로

    # 점수 범위 조정
    score = max(1, min(10, score))

    # 지표 이름 및 지표 값
    indicator_value = round(currentMACD, 2)

    # 추천 결과 계산

    return {
        'value': indicator_value,
        'score': score,
    }

def find_swing_points(data, key, window_size=3):
    swings = []
    for i in range(window_size, len(data) - window_size):
        is_swing_high = all(data[i][key] > data[i - j][key] and data[i][key] > data[i + j][key] for j in range(1, window_size + 1))
        is_swing_low = all(data[i][key] < data[i - j][key] and data[i][key] < data[i + j][key] for j in range(1, window_size + 1))
        if is_swing_high:
            swings.append({'type': 'high', 'value': data[i][key], 'index': i, 'date': data[i]['date']})
        if is_swing_low:
            swings.append({'type': 'low', 'value': data[i][key], 'index': i, 'date': data[i]['date']})
    return swings

def macd_calculation2(df_macd, df_stock, swing_range=3):
    data_length = min(len(df_macd), len(df_stock))

    if data_length < swing_range * 2:
        return {"error": "데이터가 충분하지 않습니다."}

    # 데이터 준비
    stock_data_list = df_stock.tail(data_length).reset_index().to_dict('records')
    macd_data_list = df_macd.tail(data_length).reset_index().to_dict('records')

    # 스윙 포인트 찾기
    price_swings = find_swing_points(stock_data_list, 'close', swing_range)
    macd_swings = find_swing_points(macd_data_list, 'MACD_Line', swing_range)

    divergence_type = None  # 'bullish', 'bearish', or None

    # 상승 다이버전스 감지
    price_lows = [s for s in price_swings if s['type'] == 'low']
    macd_lows = [s for s in macd_swings if s['type'] == 'low']

    if len(price_lows) >= 2 and len(macd_lows) >= 2:
        prev_price_low = price_lows[-2]
        recent_price_low = price_lows[-1]

        prev_macd_low = next((s for s in macd_lows if s['index'] == prev_price_low['index']), None)
        recent_macd_low = next((s for s in macd_lows if s['index'] == recent_price_low['index']), None)

        if prev_macd_low and recent_macd_low:
            if recent_price_low['value'] < prev_price_low['value'] and recent_macd_low['value'] > prev_macd_low['value']:
                divergence_type = 'bullish'

    # 하락 다이버전스 감지
    price_highs = [s for s in price_swings if s['type'] == 'high']
    macd_highs = [s for s in macd_swings if s['type'] == 'high']

    if len(price_highs) >= 2 and len(macd_highs) >= 2:
        prev_price_high = price_highs[-2]
        recent_price_high = price_highs[-1]

        prev_macd_high = next((s for s in macd_highs if s['index'] == prev_price_high['index']), None)
        recent_macd_high = next((s for s in macd_highs if s['index'] == recent_price_high['index']), None)

        if prev_macd_high and recent_macd_high:
            if recent_price_high['value'] > prev_price_high['value'] and recent_macd_high['value'] < prev_macd_high['value']:
                divergence_type = 'bearish'

    # 점수 부여
    score = 5  # 기본 보통
    if divergence_type == 'bullish':
        score = 3  # 매수
    elif divergence_type == 'bearish':
        score = 7  # 매도


    return {
        'score': score,
    }

def macd_calculation3(df_macd, period=5):
    if len(df_macd) < period + 1:
        return {"error": "데이터가 충분하지 않습니다."}

    lastIndex = len(df_macd) - 1
    currentHistogram = df_macd.iloc[lastIndex]['Histogram']
    prevHistogram = df_macd.iloc[lastIndex - 1]['Histogram']

    scoreAdjustment = 0

    # Histogram이 0선을 상향 또는 하향 돌파할 때
    if prevHistogram < 0 and currentHistogram > 0:
        scoreAdjustment -= 1  # 매수 쪽으로
    elif prevHistogram > 0 and currentHistogram < 0:
        scoreAdjustment += 1  # 매도 쪽으로

    # Histogram의 연속적인 증감 추세 분석
    increasingCount = 0
    decreasingCount = 0
    for i in range(lastIndex - period + 1, lastIndex):
        if df_macd.iloc[i + 1]['Histogram'] > df_macd.iloc[i]['Histogram']:
            increasingCount +=1
        elif df_macd.iloc[i + 1]['Histogram'] < df_macd.iloc[i]['Histogram']:
            decreasingCount +=1

    if increasingCount >= 3:
        scoreAdjustment -=1  # 매수 쪽으로
    elif decreasingCount >= 3:
        scoreAdjustment +=1  # 매도 쪽으로

    # 기본 점수는 5점
    score = 5 + scoreAdjustment
    score = max(1, min(10, score))

    # 지표 이름 및 지표 값
    indicator_value = round(currentHistogram, 2)

    # 추천 결과 계산

    return {
        'value': indicator_value,
        'score': score,
    }

def macd_calculation4(df_macd_multi):
    if df_macd_multi.empty:
        return {"error": "데이터가 충분하지 않습니다."}

    lastIndex = len(df_macd_multi) -1
    currentData = df_macd_multi.iloc[lastIndex]

    # 데이터 검증
    required_columns = ['MACD_12_26_9', 'Signal_12_26_9', 'MACD_50_100_9', 'Signal_50_100_9']
    for col in required_columns:
        if col not in df_macd_multi.columns:
            return {"error": "다중 기간 MACD 데이터가 부족합니다."}

    # 단기 MACD
    shortMACD = currentData['MACD_12_26_9']
    shortSignal = currentData['Signal_12_26_9']

    # 장기 MACD
    longMACD = currentData['MACD_50_100_9']
    longSignal = currentData['Signal_50_100_9']

    score = 5  # 기본 보통

    shortTrend = '상승' if shortMACD > shortSignal else '하락'
    longTrend = '상승' if longMACD > longSignal else '하락'

    if shortTrend == '상승' and longTrend == '상승':
        score = 3  # 강한 매수
    elif shortTrend == '하락' and longTrend == '하락':
        score = 7  # 강한 매도
    else:
        score = 5  # 보통

    indicator_value = round(shortMACD, 2)

    return {
        'value': indicator_value,
        'score': score,
    }


def macd_calculation5(df_macd, period=5):
    if len(df_macd) < period + 1:
        return {"error": "데이터가 충분하지 않습니다."}

    recent_df = df_macd.tail(period + 1).copy()
    recent_df['MACD_Change'] = recent_df['MACD_Line'].diff()

    macd_changes = recent_df['MACD_Change'].abs().tolist()

    avg_macd_change = sum(macd_changes[1:-1]) / (period -1)
    current_macd_change = macd_changes[-1]

    scoreAdjustment = 0

    if abs(current_macd_change) > abs(avg_macd_change):
        # 현재 MACD 추세 방향 판단
        currentMACD = recent_df.iloc[-1]['MACD_Line']
        currentSignal = recent_df.iloc[-1]['Signal_Line']

        if currentMACD > currentSignal:
            scoreAdjustment -=1  # 매수 쪽으로
        elif currentMACD < currentSignal:
            scoreAdjustment +=1  # 매도 쪽으로

    score = 5 + scoreAdjustment
    score = max(1, min(10, score))

    indicator_value = round(current_macd_change, 4)

    return {
        'value': indicator_value,
        'score': score,
    }


def macd_calculation_all(df_macd, df_macd_multi, df_stock):
    """
    모든 MACD 분석 함수들을 종합하여 점수와 지표 값을 반환하는 함수.
    """
    # 각 계산 함수 실행 및 점수 합산
    result1 = macd_calculation1(df_macd)
    result2 = macd_calculation2(df_macd, df_stock)
    result3 = macd_calculation3(df_macd)
    result4 = macd_calculation4(df_macd_multi)
    result5 = macd_calculation5(df_macd)

    # 결과에서 점수 추출
    scores = [
        result1.get('score', 5),
        result2.get('score', 5),
        result3.get('score', 5),
        result4.get('score', 5),
        result5.get('score', 5)
    ]

    # 가중치 설정
    weights = [3, 2, 1, 2, 2]

    # 가중 평균 계산
    weighted_scores = [score * weight for score, weight in zip(scores, weights)]
    total_weight = sum(weights)
    average_score = sum(weighted_scores) / total_weight

    # 지표 이름 및 지표 값 (result1에서 가져옴)
    indicator_name = result1.get('name', 'MACD')
    indicator_value = result1.get('value', None)

    # 추천 결과 계산
    recommendation = calculate_recommendation(average_score)

    return {
        "name": 'MACD(12, 26, close, 9)',
        "value": indicator_value,
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