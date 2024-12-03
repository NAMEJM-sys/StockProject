import pandas as pd


def macd_analysis1(df_macd, stock_data, period=14):
    """
    MACD 분석을 위한 계산. 교차점(Crossover), 히스토그램 추세, 가격 추세 등을 포함한 결과를 반환.

    """
    # MACD 데이터 추출

    df_price = pd.DataFrame(list(stock_data.values('date', 'close')))

    macd_line = df_macd['MACD_Line']
    signal_line = df_macd['Signal_Line']
    histogram = df_macd['Histogram']
    lastIndex = len(df_macd) - 1


    # MACD 교차 분석
    cross_up = False
    cross_down = False

    if macd_line[lastIndex - 1] < signal_line[lastIndex - 1] and macd_line[lastIndex] > signal_line[lastIndex]:
        cross_up = True  # 골든 크로스
    elif macd_line[lastIndex - 1] > signal_line[lastIndex - 1] and macd_line[lastIndex] < signal_line[lastIndex]:
        cross_down = True  # 데드 크로스

    # 히스토그램 추세 분석 (최근 3일)
    hist_trend = histogram.tail(3)

    if len(hist_trend) >= 3:
        is_hist_increasing = bool(hist_trend.iloc[2] > hist_trend.iloc[1] > hist_trend.iloc[0])
        is_hist_decreasing = bool(hist_trend.iloc[2] < hist_trend.iloc[1] < hist_trend.iloc[0])
    else:
        # 데이터가 충분하지 않은 경우 기본값 설정
        is_hist_increasing = False
        is_hist_decreasing = False

    # 이동 평균선 계산 (50일, 200일)
    ma50 = df_price['close'].rolling(window=50).mean().iloc[-1]
    ma200 = df_price['close'].rolling(window=200).mean().iloc[-1]
    price_trend = '상승' if ma50 > ma200 else '하락'

    # 결과 반환
    result = {
        'macd': macd_line.iloc[-1],
        'signal': signal_line.iloc[-1],
        'histogram': histogram.iloc[-1],
        'cross_up': bool(cross_up),
        'cross_down': bool(cross_down),
        'is_hist_increasing': bool(is_hist_increasing),
        'is_hist_decreasing': bool(is_hist_decreasing),
        'price_trend': price_trend
    }
    return result

def macd_analysis2(df_macd, stock_data):
    window_size = 3

    # 가격과 MACD 데이터 프레임 설정
    df_stock = pd.DataFrame(list(stock_data.values('date', 'close')))
    macd_line = df_macd['MACD_Line']

    # 스윙 포인트 감지 함수
    def find_swing_points(data, key, window_size):
        swings = []
        for i in range(window_size, len(data) - window_size):
            is_swing_high = all(data[key].iloc[i] > data[key].iloc[i - j] and data[key].iloc[i] > data[key].iloc[i + j] for j in range(1, window_size + 1))
            is_swing_low = all(data[key].iloc[i] < data[key].iloc[i - j] and data[key].iloc[i] < data[key].iloc[i + j] for j in range(1, window_size + 1))
            if is_swing_high:
                swings.append({'type': 'high', 'value': float(data[key].iloc[i]), 'index': i, 'date': str(data['date'].iloc[i])})
            elif is_swing_low:
                swings.append({'type': 'low', 'value': float(data[key].iloc[i]), 'index': i, 'date': str(data['date'].iloc[i])})
        return swings

    # 가격 스윙 포인트와 MACD 스윙 포인트 감지
    price_swings = find_swing_points(df_stock, 'close', window_size)
    macd_swings = find_swing_points(df_macd, 'MACD_Line', window_size)

    bullish_divergence = False
    bearish_divergence = False

    # 상승 다이버전스 감지
    price_lows = [p for p in price_swings if p['type'] == 'low']
    macd_lows = [m for m in macd_swings if m['type'] == 'low']
    if len(price_lows) >= 2 and len(macd_lows) >= 2:
        latest_price_low = price_lows[-1]
        prev_price_low = price_lows[-2]
        latest_macd_low = next((m for m in macd_lows if m['index'] == latest_price_low['index']), None)
        prev_macd_low = next((m for m in macd_lows if m['index'] == prev_price_low['index']), None)
        if latest_macd_low and prev_macd_low and latest_price_low['value'] < prev_price_low['value'] and latest_macd_low['value'] > prev_macd_low['value']:
            bullish_divergence = True

    # 하락 다이버전스 감지
    price_highs = [p for p in price_swings if p['type'] == 'high']
    macd_highs = [m for m in macd_swings if m['type'] == 'high']
    if len(price_highs) >= 2 and len(macd_highs) >= 2:
        latest_price_high = price_highs[-1]
        prev_price_high = price_highs[-2]
        latest_macd_high = next((m for m in macd_highs if m['index'] == latest_price_high['index']), None)
        prev_macd_high = next((m for m in macd_highs if m['index'] == prev_price_high['index']), None)
        if latest_macd_high and prev_macd_high and latest_price_high['value'] > prev_price_high['value'] and latest_macd_high['value'] < prev_macd_high['value']:
            bearish_divergence = True

    # 결과 반환 (데이터 타입 변환 포함)
    result = {
        'bullish_divergence': bool(bullish_divergence),
        'bearish_divergence': bool(bearish_divergence)
    }

    return result


def macd_analysis3(df_macd):
    """
    MACD 히스토그램을 기반으로 단기 모멘텀 분석을 수행하는 함수.
    계산된 값만을 반환.
    """

    # MACD 히스토그램 데이터 추출
    histogram = df_macd['Histogram']
    lastIndex = len(df_macd) - 1

    # 데이터가 충분하지 않을 경우
    if lastIndex < 5:
        return {'error': '데이터가 충분하지 않습니다.'}

    # 현재 및 이전 히스토그램 값
    current_histogram = histogram.iloc[lastIndex]
    prev_histogram = histogram.iloc[lastIndex - 1]

    # 연속적인 증감 추세 분석
    increasing_count = 0
    decreasing_count = 0
    for i in range(lastIndex - 4, lastIndex):
        if histogram.iloc[i + 1] > histogram.iloc[i]:
            increasing_count += 1
        elif histogram.iloc[i + 1] < histogram.iloc[i]:
            decreasing_count += 1

    # 결과 반환 (계산된 값만 반환)
    result = {
        'current_histogram': float(current_histogram),
        'prev_histogram': float(prev_histogram),
        'increasing_count': increasing_count,
        'decreasing_count': decreasing_count,
    }

    return result

def macd_analysis4(df):
    if df.empty or len(df) < 2:
        return {'error': 'Insufficient data'}

    # 최신 데이터 추출
    current_data = df.iloc[-1]

    # 필요한 MACD 값 추출
    result = {
        'short_macd': current_data['MACD_12_26_9'],
        'short_signal': current_data['Signal_12_26_9'],
        'long_macd': current_data['MACD_50_100_9'],
        'long_signal': current_data['Signal_50_100_9'],
    }
    return result

def macd_analysis5(df, period=5):
    if df.empty or len(df) < period + 1:
        return {'error': 'Insufficient data'}

    # 최근 데이터 추출
    recent_df = df.tail(period + 1).copy()

    # MACD 변화량 계산 (절대값)
    recent_df['MACD_Change'] = recent_df['MACD_Line'].diff().abs()

    macd_changes = recent_df['MACD_Change'].tolist()

    # 최근 평균 MACD 변화량 계산 (마지막 값을 제외하고 평균 계산)
    avg_macd_change = sum(macd_changes[1:-1]) / (period - 1)

    # 현재 MACD 변화량 (가장 최근 변화량)
    current_macd_change = macd_changes[-1]

    result = {
        'current_macd_change': current_macd_change,
        'avg_macd_change': avg_macd_change
    }

    return result