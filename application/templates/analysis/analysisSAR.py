
def sar_analysis1(sar_data, period=5):
    """
    추세 방향 및 반전 지점 식별
    """
    if sar_data.empty or len(sar_data) < period + 1:
        return {"error": "데이터가 충분하지 않습니다."}

    recent_data = sar_data.tail(period)
    up_trend_count = sum(recent_data['close'] > recent_data['Parabolic_SAR'])
    down_trend_count = sum(recent_data['close'] < recent_data['Parabolic_SAR'])

    # 추세 방향 판단
    if up_trend_count == period:
        trend = "상승 추세"
    elif down_trend_count == period:
        trend = "하락 추세"
    else:
        trend = "추세 불명확"

    # 추세 반전 신호 감지
    prev_data = sar_data.tail(period + 1).head(period)
    trend_reversal = None
    for i in range(period):
        prev_close = prev_data.iloc[i]['close']
        prev_sar = prev_data.iloc[i]['Parabolic_SAR']
        current_close = recent_data.iloc[i]['close']
        current_sar = recent_data.iloc[i]['Parabolic_SAR']
        date = recent_data.iloc[i]['date']
        if prev_close <= prev_sar and current_close > current_sar:
            trend_reversal = {
                "date": date.strftime('%Y-%m-%d'),
                "type": "상승 추세로의 반전"
            }
            break
        elif prev_close >= prev_sar and current_close < current_sar:
            trend_reversal = {
                "date": date.strftime('%Y-%m-%d'),
                "type": "하락 추세로의 반전"
            }
            break

    result = {
        "trend": trend,
        "trend_reversal": trend_reversal
    }
    return result

def sar_analysis2(sar_data):
    """
    추세 지속성 분석
    """
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

    result = {
        "up_trend_days": up_trend_days,
        "down_trend_days": down_trend_days
    }
    return result


def sar_analysis3(sar_data, period=5):
    """
    추세 강도 분석
    """
    if sar_data.empty or len(sar_data) < period:
        return {"error": "데이터가 충분하지 않습니다."}

    recent_af_values = sar_data['AF'].tail(period).tolist()

    # AF의 변화 추세 분석
    af_differences = [recent_af_values[i] - recent_af_values[i - 1] for i in range(1, len(recent_af_values))]

    positive_changes = sum(1 for diff in af_differences if diff > 0)
    negative_changes = sum(1 for diff in af_differences if diff < 0)

    current_af = recent_af_values[-1]

    if positive_changes == len(af_differences):
        trend_strength = "강화"
    elif negative_changes == len(af_differences):
        trend_strength = "약화"
    else:
        trend_strength = "변화 없음"

    result = {
        "current_af": current_af,
        "trend_strength": trend_strength
    }
    return result


def calculate_ema(prices, period):
    k = 2 / (period + 1)
    ema_values = []
    ema = prices[0]
    ema_values.append(ema)
    for price in prices[1:]:
        ema = price * k + ema * (1 - k)
        ema_values.append(ema)
    return ema_values


def sar_analysis4(sar_data, period=14):
    """
    거짓 신호 필터링 및 종합 분석
    """
    if sar_data.empty or len(sar_data) < period:
        return {"error": "데이터가 충분하지 않습니다."}

    closing_prices = sar_data['close'].tolist()
    recent_prices = closing_prices[-period:]

    # EMA 계산
    ema_values = calculate_ema(recent_prices, period)
    current_ema = ema_values[-1]
    prev_ema = ema_values[-2]

    current_price = closing_prices[-1]
    prev_price = closing_prices[-2]

    # EMA의 추세 판단
    if current_price > current_ema and prev_price <= prev_ema:
        price_trend = '상승 추세로 전환'
    elif current_price < current_ema and prev_price >= prev_ema:
        price_trend = '하락 추세로 전환'
    elif current_price > current_ema:
        price_trend = '상승 추세'
    elif current_price < current_ema:
        price_trend = '하락 추세'
    else:
        price_trend = '추세 불명확'

    current_sar = sar_data.iloc[-1]['Parabolic_SAR']

    # Parabolic SAR과의 결합 분석
    if current_price > current_sar and current_price > current_ema:
        combined_signal = '상승 추세 지지'
    elif current_price < current_sar and current_price < current_ema:
        combined_signal = '하락 추세 지지'
    else:
        combined_signal = '신호 불일치'

    result = {
        "price_trend": price_trend,
        "combined_signal": combined_signal
    }
    return result

