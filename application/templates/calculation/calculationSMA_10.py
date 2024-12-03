
def calculate_slope(x, y):
    n = len(x)
    sum_x = sum(x)
    sum_y = sum(y)
    sum_xy = sum([xi * yi for xi, yi in zip(x, y)])
    sum_x_squared = sum([xi ** 2 for xi in x])

    # 선형 회귀 기울기 공식
    slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x_squared - sum_x ** 2)

    return slope

def sma10_calculation1(stockData ,SMA):

    current_sma10 = SMA.iloc[-1]['SMA_10']
    current_close = stockData.iloc[-1]['close']

    score = 5
    if current_sma10 > current_close:
        score = 7
    elif current_sma10 < current_close:
        score = 3
    else:
        score = 5

    return {
        'score': score,
        'SMA_10': current_sma10,
    }

def sma10_calculation2(SMA, period=5):
    sma_trend = SMA['SMA_10'].iloc[-period:].values
    x_values = list(range(len(sma_trend)))

    slope = calculate_slope(x_values, sma_trend)

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

def sma10_calculation_all(stockData, SMA):
    result1 = sma10_calculation1(stockData, SMA)
    result2 = sma10_calculation2(SMA)

    scores =[result1.get('score', 5), result2.get('score', 5)]

    weights = [1, 2]

    scores_test = result1.get('score')

    weighted_scores = [score * weight for score, weight in zip(scores, weights)]
    total_weight = sum(weights)
    average_score = sum(weighted_scores) / total_weight

    current_sma10 = result1.get('SMA_10', None)
    recommendation = calculate_recommendation(scores_test)

    return {
        "name": "Simple Moving Average(10)",
        "value": round(current_sma10, 0),
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