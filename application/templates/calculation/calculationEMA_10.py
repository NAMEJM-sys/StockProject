
def calculate_slope(x, y):
    n = len(x)
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum([xi * yi for xi, yi in zip(x, y)])
    sum_x_squared = sum([xi ** 2 for xi in x])

    # 선형 회귀 기울기 공식
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x_squared - sum_x ** 2)

    return slope

def ema10_calculation1(stockData ,EMA):

    current_ema10 = EMA.iloc[-1]['EMA_10']
    current_close = stockData.iloc[-1]['close']

    score = 5
    if current_ema10 > current_close:
        score = 9
    elif current_ema10 < current_close:
        score = 1
    else:
        score = 5

    return {
        'score': score,
        'EMA_10': current_ema10,
    }

def ema10_calculation2(EMA, period=5):
    ema_trend = EMA['EMA_10'].iloc[-period:].values
    x_values = list(range(len(ema_trend)))

    slope = calculate_slope(x_values, ema_trend)

    score = 5
    if slope > 0:
        score = 1
    elif slope < 0:
        score = 9
    else:
        score = 5

    return {
        'score': score,
    }

def ema10_calculation_all(stockData, EMA):
    result1 = ema10_calculation1(stockData, EMA)
    result2 = ema10_calculation2(EMA)

    scores =[result1.get('score', 5), result2.get('score', 5)]

    scores_test = result1.get('score')

    weights = [1, 2]

    weighted_scores = [score * weight for score, weight in zip(scores, weights)]
    total_weight = sum(weights)
    average_score = sum(weighted_scores) / total_weight

    current_ema10 = result1.get('EMA_10', None)
    recommendation = calculate_recommendation(scores_test)

    return {
        "name": "Exponential Moving Average(10)",
        "value": round(current_ema10, 0),
        "damm": round(scores_test, 0),
        "recommendation": recommendation,
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