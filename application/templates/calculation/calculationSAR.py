import pandas as pd

def sar_calculation1(sar_data):
    if sar_data.empty or len(sar_data) < 2:
        return {"error": "데이터가 충분하지 않습니다."}

    last_index = sar_data.index[-1]
    current_price = sar_data.loc[last_index, 'close']
    current_sar = sar_data.loc[last_index, 'Parabolic_SAR']
    prev_price = sar_data.loc[last_index - 1, 'close']
    prev_sar = sar_data.loc[last_index - 1, 'Parabolic_SAR']

    score = 5  # 기본 보통

    # 1. 현재 추세 방향 판단
    if current_price > current_sar:
        score = 3  # 매수
    elif current_price < current_sar:
        score = 7  # 매도

    # 2. 추세 반전 신호 감지
    if prev_price <= prev_sar and current_price > current_sar:
        score -= 2  # 매수 신호 강화
    elif prev_price >= prev_sar and current_price < current_sar:
        score += 2  # 매도 신호 강화

    # 점수 범위 조정
    score = max(1, min(10, score))

    return {
        "score": score,
        "current_sar": current_sar
    }

def sar_calculation2(sar_data):
    if sar_data.empty or len(sar_data) < 2:
        return {"error": "데이터가 충분하지 않습니다."}

    up_trend_days = 0
    down_trend_days = 0

    # 최근 데이터부터 거꾸로 순회하여 연속된 추세 일수를 계산
    for i in range(len(sar_data) - 1, -1, -1):
        current_price = sar_data.iloc[i]['close']
        current_sar = sar_data.iloc[i]['Parabolic_SAR']

        if current_price > current_sar:
            if down_trend_days > 0:
                break
            up_trend_days += 1
        elif current_price < current_sar:
            if up_trend_days > 0:
                break
            down_trend_days += 1
        else:
            break

    score = 5  # 기본 보통

    if up_trend_days >= 3:
        score = 3  # 매수 강화
    elif up_trend_days > 0:
        score = 4  # 매수
    elif down_trend_days >= 3:
        score = 7  # 매도 강화
    elif down_trend_days > 0:
        score = 6  # 매도

    return {
        "score": score
    }


def sar_calculation3(sar_data, period=5):
    """
    Calculate SAR trend strength score based on AF values over a given period.

    :param sar_data: DataFrame containing 'AF', 'close', 'Parabolic_SAR' columns.
    :param period: Period to calculate the trend strength score.
    :return: Dictionary with the calculated score or an error message.
    """
    if sar_data.empty or len(sar_data) < period:
        return {"error": "데이터가 충분하지 않습니다."}

    # Extract the most recent 'AF' values for the given period
    recent_af_values = sar_data['AF'].tail(period).tolist()

    # Calculate the differences between consecutive AF values
    af_differences = [recent_af_values[i] - recent_af_values[i - 1] for i in range(1, len(recent_af_values))]

    # Count positive and negative changes in AF values
    positive_changes = sum(1 for diff in af_differences if diff > 0)
    negative_changes = sum(1 for diff in af_differences if diff < 0)

    # Get the most recent AF, close price, and SAR value
    current_af = recent_af_values[-1]
    current_price = sar_data.iloc[-1]['close']
    current_sar = sar_data.iloc[-1]['Parabolic_SAR']

    # Determine if the current trend is up or down
    is_up_trend = current_price > current_sar
    score_adjustment = 0

    # Adjust score based on the trend in AF values
    if positive_changes == len(af_differences):
        # AF has been increasing, indicating stronger trend
        if is_up_trend:
            score_adjustment -= 1  # Strengthening buy signal
        else:
            score_adjustment += 1  # Strengthening sell signal
    elif negative_changes == len(af_differences):
        # AF has been decreasing, indicating weaker trend
        if is_up_trend:
            score_adjustment += 1  # Weakening buy signal
        else:
            score_adjustment -= 1  # Weakening sell signal

    # Base score is 5
    score = 5 + score_adjustment

    # Ensure score is between 1 and 10
    score = max(1, min(10, score))

    return {
        "score": score
    }


def calculate_ema(prices, period):
    k = 2 / (period + 1)
    ema = prices[0]
    ema_values = [ema]

    for i in range(1, len(prices)):
        ema = prices[i] * k + ema * (1 - k)
        ema_values.append(ema)

    return ema_values


def sar_calculation4(sar_data, stock_data, period=14):

    df_stock_data = pd.DataFrame(list(stock_data.values('close')))
    indexDf = len(df_stock_data)

    closing_prices = df_stock_data['close']
    recent_prices = closing_prices[-period:]

    recent_prices = recent_prices.reset_index(drop=True)

    # EMA 계산
    ema_array = calculate_ema(recent_prices, period)
    current_ema = ema_array[-1]

    current_price = closing_prices[indexDf-1]
    current_sar = sar_data.iloc[-1]['Parabolic_SAR']

    score = 5  # 기본 보통

    if current_price > current_sar and current_price > current_ema:
        score = 3  # 매수 강화
    elif current_price < current_sar and current_price < current_ema:
        score = 7  # 매도 강화

    return {
        "score": score,
        "current_sar": current_sar,
        "current_ema": current_ema
    }

def sar_calculation_all(sar_data, stock_data):
    """
    Combine all SAR calculation functions and return a weighted final score.
    :param sar_data: DataFrame containing SAR data.
    :param stock_data: DataFrame containing stock data for SAR 4.
    :return: Dictionary with combined score, weighted average, and recommendation.
    """
    # Execute each SAR calculation function
    result1 = sar_calculation1(sar_data)
    result2 = sar_calculation2(sar_data)
    result3 = sar_calculation3(sar_data)
    result4 = sar_calculation4(sar_data, stock_data)

    # Extract scores and apply weights
    scores = [
        result1.get('score', 5),
        result2.get('score', 5),
        result3.get('score', 5),
        result4.get('score', 5)
    ]

    # Set weights for each calculation
    weights = {
        'sar1': 3,
        'sar2': 2,
        'sar3': 3,
        'sar4': 2
    }

    # Apply weighted average
    weighted_scores = [
        scores[0] * weights['sar1'],
        scores[1] * weights['sar2'],
        scores[2] * weights['sar3'],
        scores[3] * weights['sar4']
    ]

    total_weight = sum(weights.values())
    average_score = sum(weighted_scores) / total_weight

    current_sar = result1.get('current_sar', None)

    sar1_score = result1.get('score', None)
    sar2_score = result2.get('score', None)
    sar3_score = result3.get('score', None)
    sar4_score = result4.get('score', None)



    # Generate final recommendation based on average score
    recommendation = calculate_recommendation(average_score)

    return {
        "name": "Parabolic SAR(0.02, 0.02, 0.2)",
        "value": current_sar,
        "damm": round(average_score, 2),
        "recommendation": recommendation
    }


def calculate_recommendation(average_score):
    """
    Calculate recommendation based on average score.
    :param average_score: Weighted average score.
    :return: Recommendation as a string.
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