import numpy as np

def calculate_channel_angle(keltner_data, period=14):
    if len(keltner_data) < period:
        return None
    recent_data = keltner_data.tail(period)
    middle_line_values = recent_data['Middle_Line'].values

    indices = np.arange(period)
    n = period
    sumX = indices.sum()
    sumY = middle_line_values.sum()
    sumXY = (indices * middle_line_values).sum()
    sumX2 = (indices ** 2).sum()
    slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2)
    angle = np.arctan(slope) * (180 / np.pi)
    return angle

def keltner_analysis1(keltner_data, period=14):
    """
    채널 기울기와 가격 위치를 통한 추세 분석
    """
    angle = calculate_channel_angle(keltner_data, period)
    if angle is None:
        return {"error": "데이터가 충분하지 않습니다."}

    result = {}

    # 채널의 기울기에 따른 추세 판단
    if angle > 5:
        result['channel_trend'] = '상승 추세'
    elif angle < -5:
        result['channel_trend'] = '하락 추세'
    else:
        result['channel_trend'] = '추세 불명확'

    current_data = keltner_data.iloc[-1]
    current_close = current_data['close']
    upper_band = current_data['Upper_Band']
    lower_band = current_data['Lower_Band']
    middle_line = current_data['Middle_Line']

    # 가격과 채널의 위치 관계 분석
    if current_close > upper_band:
        price_position = 'Upper Band 위'
    elif current_close < lower_band:
        price_position = 'Lower Band 아래'
    elif current_close > middle_line:
        price_position = 'Middle Line 위'
    elif current_close < middle_line:
        price_position = 'Middle Line 아래'
    else:
        price_position = 'Middle Line과 동일'

    result['price_position'] = price_position
    result['angle'] = angle

    return result

def keltner_analysis2(keltner_data, threshold=0.01, period=14):
    """
    Trend Pullback 전략 분석
    """
    angle = calculate_channel_angle(keltner_data, period)
    if angle is None:
        return {"error": "데이터가 충분하지 않습니다."}

    result = {}
    current_data = keltner_data.iloc[-1]
    current_close = current_data['close']
    middle_line = current_data['Middle_Line']
    upper_band = current_data['Upper_Band']
    lower_band = current_data['Lower_Band']

    is_near_middle_line = abs(current_close - middle_line) / middle_line < threshold

    if angle > 5:
        result['channel_trend'] = '상승 추세'
        if is_near_middle_line:
            result['signal'] = '매수 기회 고려 가능 (가격이 Middle Line 부근)'
        elif current_close >= upper_band:
            result['signal'] = '이익 실현 또는 매도 기회 고려 (가격이 Upper Band 부근)'
    elif angle < -5:
        result['channel_trend'] = '하락 추세'
        if is_near_middle_line:
            result['signal'] = '매도 기회 고려 가능 (가격이 Middle Line 부근)'
        elif current_close <= lower_band:
            result['signal'] = '추가 하락 가능성 (가격이 Lower Band 부근)'
    else:
        result['channel_trend'] = '추세 불명확'
        if is_near_middle_line:
            result['signal'] = '변동성 낮음 (가격이 Middle Line 부근)'

    return result


def keltner_analysis3(keltner_data, period=14):
    """
    Break Out 전략 분석
    """
    angle = calculate_channel_angle(keltner_data, period)
    if angle is None or len(keltner_data) < period + 1:
        return {"error": "데이터가 충분하지 않습니다."}

    last_index = keltner_data.index[-1]
    prev_index = keltner_data.index[-2]

    current_data = keltner_data.loc[last_index]
    prev_data = keltner_data.loc[prev_index]

    current_close = current_data['close']
    prev_close = prev_data['close']
    current_upper = current_data['Upper_Band']
    current_lower = current_data['Lower_Band']
    prev_upper = prev_data['Upper_Band']
    prev_lower = prev_data['Lower_Band']

    result = {}

    # Upper Band 상향 돌파 확인
    if prev_close <= prev_upper and current_close > current_upper:
        if angle > 5:
            result['signal'] = '강한 매수 신호 (Upper Band 상향 돌파, 채널 상승 중)'
        else:
            result['signal'] = '매수 신호 (Upper Band 상향 돌파, 채널 상승 추세 아님)'
    # Lower Band 하향 돌파 확인
    elif prev_close >= prev_lower and current_close < current_lower:
        if angle < -5:
            result['signal'] = '강한 매도 신호 (Lower Band 하향 돌파, 채널 하락 중)'
        else:
            result['signal'] = '매도 신호 (Lower Band 하향 돌파, 채널 하락 추세 아님)'
    else:
        result['signal'] = '특별한 돌파 신호 없음'

    result['angle'] = angle

    return result

def keltner_analysis4(keltner_data, period=14):
    """
    과매수/과매도 상태 분석 및 반전 가능성 평가
    """
    if len(keltner_data) < period:
        return {"error": "데이터가 충분하지 않습니다."}

    angle = calculate_channel_angle(keltner_data, period)
    current_data = keltner_data.iloc[-1]
    current_close = current_data['close']
    upper_band = current_data['Upper_Band']
    lower_band = current_data['Lower_Band']

    result = {}

    if current_close > upper_band:
        if angle <= 5:
            result['signal'] = '반전 가능성 높음 (가격이 Upper Band 위, 채널 횡보)'
        elif angle < -5:
            result['signal'] = '반전 가능성 매우 높음 (가격이 Upper Band 위, 채널 하락 중)'
        else:
            result['signal'] = '상승 모멘텀 지속 가능 (가격이 Upper Band 위, 채널 상승 중)'
    elif current_close < lower_band:
        if angle >= -5:
            result['signal'] = '반등 가능성 높음 (가격이 Lower Band 아래, 채널 횡보)'
        elif angle > 5:
            result['signal'] = '반등 가능성 매우 높음 (가격이 Lower Band 아래, 채널 상승 중)'
        else:
            result['signal'] = '하락 모멘텀 지속 가능 (가격이 Lower Band 아래, 채널 하락 중)'
    else:
        result['signal'] = '과매수/과매도 상태 아님'

    result['angle'] = angle

    return result