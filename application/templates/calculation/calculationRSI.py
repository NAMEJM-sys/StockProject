import pandas as pd
import numpy as np

def rsi_calculation1(stock_data, rsi_data):
    """
    주어진 stock_data와 rsi_data를 사용하여 종합적인 RSI 분석을 수행하고 점수를 계산하는 함수.
    - RSI 상태에 따른 점수
    - 이동평균 교차 신호에 따른 점수
    - 가격 및 RSI 추세에 따른 점수
    """

    def get_rsi_state_score(current_rsi):
        """RSI 상태에 따른 점수 계산"""
        if current_rsi > 70:
            return 7  # 과매수 구간
        elif current_rsi < 30:
            return 3  # 과매도 구간
        else:
            return 5  # 중립 구간

    def get_ma_crossover_score(current_rsi_ma_crossover):
        """RSI 이동평균 교차 신호에 따른 점수 계산"""
        if current_rsi_ma_crossover == 1:
            return 3  # 골든 크로스 (긍정적)
        elif current_rsi_ma_crossover == -1:
            return 7  # 데드 크로스 (부정적)
        else:
            return 5  # 교차 신호 없음 (중립)

    def get_price_rsi_trend_score(price_trend_direction, rsi_trend_direction):
        """가격 및 RSI 추세에 따른 점수 계산"""
        if price_trend_direction == '상승' and rsi_trend_direction == '상승':
            return 3  # 상승 추세
        elif price_trend_direction == '하락' and rsi_trend_direction == '하락':
            return 7  # 하락 추세
        elif price_trend_direction == '상승' and rsi_trend_direction == '하락':
            return 6  # 가격 상승, RSI 하락 (약화 가능성)
        elif price_trend_direction == '하락' and rsi_trend_direction == '상승':
            return 4  # 가격 하락, RSI 상승 (반등 가능성)
        else:
            return 5  # 중립 상태

    def calculate_overall_score(current_rsi, current_rsi_ma_crossover, price_trend_direction, rsi_trend_direction):
        """각 요소에 대한 가중치를 적용한 종합 점수 계산"""
        rsi_state_score = get_rsi_state_score(current_rsi)
        ma_crossover_score = get_ma_crossover_score(current_rsi_ma_crossover)
        trend_score = get_price_rsi_trend_score(price_trend_direction, rsi_trend_direction)

        # 가중치 적용
        element_scores = [rsi_state_score, ma_crossover_score, trend_score]
        weights = [1, 2, 3]  # 각 요소의 중요도 가중치
        weighted_scores = [score * weight for score, weight in zip(element_scores, weights)]
        total_weight = sum(weights)
        overall_score = sum(weighted_scores) / total_weight

        return round(overall_score, 2)  # 소수점 2자리까지 표시

    # 최소 14일 이상의 데이터가 필요
    if len(rsi_data) < 14:
        return {"error": "데이터가 충분하지 않습니다."}

    stock_data_df = pd.DataFrame(list(stock_data.values('date', 'close')))

    # 최신 RSI 데이터
    last_rsi_entry = rsi_data.iloc[-1]
    current_rsi = last_rsi_entry['RSI']
    current_rsi_ma_crossover = last_rsi_entry.get('RSI_MA_Crossover', None)

    # 가격 및 RSI 추세 계산
    price_trend_direction = "상승" if stock_data_df.iloc[-1]['close'] > stock_data_df.iloc[-14]['close'] else "하락"
    rsi_trend_direction = "상승" if current_rsi > rsi_data.iloc[-14]['RSI'] else "하락"

    # 종합 점수 계산
    score = calculate_overall_score(current_rsi, current_rsi_ma_crossover, price_trend_direction,
                                            rsi_trend_direction)

    # 분석 결과 반환
    return {
        "current_rsi": round(current_rsi, 2),
        "score": score
    }

def rsi_calculation2(stock_data, rsi_data):
    """
    주가 및 RSI 데이터를 기반으로 다이버전스 분석을 수행하는 함수
    :param stock_data: 주가 데이터 (DataFrame)
    :param rsi_data: RSI 데이터 (DataFrame)
    :return: 분석 결과 (점수)
    """
    swing_range = 2  # Swing 범위 설정
    data_length = min(len(rsi_data), len(stock_data))

    # 데이터가 충분하지 않은 경우
    if data_length < swing_range * 2:
        return {'score': None, 'message': '데이터가 충분하지 않습니다.'}

    stock_data_list = list(stock_data.values('date', 'close'))

    # 가격 저점과 고점 찾기
    price_lows = find_swing_lows(stock_data_list, swing_range, 'close')
    price_highs = find_swing_highs(stock_data_list, swing_range, 'close')

    rsi_data_list = rsi_data.to_dict('records')  # DataFrame에서 records로 변환

    # RSI 저점과 고점 찾기
    rsi_lows = find_swing_lows(rsi_data_list, swing_range, 'RSI')
    rsi_highs = find_swing_highs(rsi_data_list, swing_range, 'RSI')

    divergence_type = None  # 다이버전스 유형 ('bullish', 'bearish', None)

    # 상승 다이버전스 감지 (Bullish Divergence)
    if len(price_lows) >= 2 and len(rsi_lows) >= 2:
        prev_price_low = price_lows[-2]
        recent_price_low = price_lows[-1]

        prev_rsi_low = next((rsi for rsi in rsi_lows if rsi['date'] == prev_price_low['date']), None)
        recent_rsi_low = next((rsi for rsi in rsi_lows if rsi['date'] == recent_price_low['date']), None)

        if prev_rsi_low and recent_rsi_low:
            if recent_price_low['value'] < prev_price_low['value'] and recent_rsi_low['value'] > prev_rsi_low['value']:
                divergence_type = 'bullish'

    # 하락 다이버전스 감지 (Bearish Divergence)
    if len(price_highs) >= 2 and len(rsi_highs) >= 2:
        prev_price_high = price_highs[-2]
        recent_price_high = price_highs[-1]

        prev_rsi_high = next((rsi for rsi in rsi_highs if rsi['date'] == prev_price_high['date']), None)
        recent_rsi_high = next((rsi for rsi in rsi_highs if rsi['date'] == recent_price_high['date']), None)

        if prev_rsi_high and recent_rsi_high:
            if recent_price_high['value'] > prev_price_high['value'] and recent_rsi_high['value'] < prev_rsi_high['value']:
                divergence_type = 'bearish'

    # 다이버전스 유형에 따른 점수 부여
    score = 5  # 기본 점수 (중립)
    if divergence_type == 'bullish':
        score = 3  # 매수 신호
    elif divergence_type == 'bearish':
        score = 7  # 매도 신호

    return {'score': score, 'divergence_type': divergence_type}

def find_swing_lows(data, swingRange, valueKey):
    swingLows = []
    for i in range(swingRange, len(data) - swingRange):
        isSwingLow = True
        for j in range(1, swingRange + 1):
            if data[i - j][valueKey] <= data[i][valueKey] or data[i + j][valueKey] <= data[i][valueKey]:
                isSwingLow = False
                break
        if isSwingLow:
            swingLows.append({'value': data[i][valueKey], 'index': i, 'date': data[i]['date']})
    return swingLows

def find_swing_highs(data, swingRange, valueKey):
    swingHighs = []
    for i in range(swingRange, len(data) - swingRange):
        isSwingHigh = True
        for j in range(1, swingRange + 1):
            if data[i - j][valueKey] >= data[i][valueKey] or data[i + j][valueKey] >= data[i][valueKey]:
                isSwingHigh = False
                break
        if isSwingHigh:
            swingHighs.append({'value': data[i][valueKey], 'index': i, 'date': data[i]['date']})
    return swingHighs

def rsi_calculation3(df_with_rsi, period=14):
    """
    RSI 변동성 및 Z-스코어를 기반으로 점수를 계산하는 함수
    :param df_with_rsi: RSI 값과 관련된 변동성 및 Z-스코어가 포함된 DataFrame
    :param period: RSI 분석 기간 (기본값: 14일)
    :return: 계산된 점수와 분석 결과
    """

    lastIndex = len(df_with_rsi) - 1
    if lastIndex < period:
        return {'score': None, 'message': '데이터가 충분하지 않습니다.'}

    # 가장 최근의 데이터 추출
    current_data = df_with_rsi.iloc[lastIndex]

    # 현재 변동성 및 Z-스코어 값 가져오기
    current_volatility = current_data.get('RSI_Volatility', None)
    current_z_score = current_data.get('RSI_Z_Score', None)

    # 변동성이나 Z-스코어 값이 없는 경우
    if current_volatility is None or current_z_score is None:
        return {'score': None, 'message': '변동성 또는 Z-스코어 데이터를 불러오는 데 문제가 발생했습니다.'}

    # 기간 내 변동성 평균 계산
    volatility_values = df_with_rsi['RSI_Volatility'].iloc[lastIndex - period + 1 : lastIndex + 1]
    avg_volatility = np.mean(volatility_values)

    # 높은 변동성과 Z-스코어 여부 확인
    is_high_volatility = current_volatility > avg_volatility
    is_high_z_score = abs(current_z_score) > 2

    # 점수 계산
    score = 5  # 기본값
    if is_high_volatility and is_high_z_score:
        score = 8  # 매도 경계
    elif is_high_volatility and not is_high_z_score:
        score = 4  # 매수 경계
    elif not is_high_volatility and is_high_z_score:
        score = 6  # 주의
    else:
        score = 5  # 보통

    return {
        'score': score,
    }

def rsi_calculation4(df_with_rsi):
    """
    기간별 RSI 평균과 추세를 기반으로 점수를 계산하는 함수
    :param df_with_rsi: RSI 값이 포함된 DataFrame
    :return: 계산된 점수와 당일 RSI 값
    """
    def calculate_averages_and_trends(data, period):
        """
        주어진 기간 동안의 RSI 평균과 추세를 계산하는 함수
        :param data: RSI 데이터가 포함된 DataFrame
        :param period: 분석 기간 (7일, 14일, 30일 등)
        :return: 평균과 추세 값
        """
        if len(data) >= period:
            recent_data = data.tail(period)
            avg = recent_data['RSI'].mean()
            trend = recent_data['RSI'].iloc[-1] - recent_data['RSI'].iloc[0]
            return avg, trend
        return None, None

    periods = [7, 14, 30]
    calculated_score = 5  # 기본값: 보통
    current_rsi = df_with_rsi['RSI'].iloc[-1]  # 당일 RSI 값 (마지막 데이터)

    for period in periods:
        avg, trend = calculate_averages_and_trends(df_with_rsi, period)
        if avg is None or trend is None:
            continue

        if trend > 5 and avg > 50:
            if period == 7:
                calculated_score = 1  # 강력한 매수 신호
                break
            elif period == 14:
                calculated_score = 3  # 매수 신호
        elif trend < -5 and avg < 50:
            if period == 7:
                calculated_score = 10  # 강력한 매도 신호
                break
            elif period == 14:
                calculated_score = 7  # 매도 신호

    return {
        'score': calculated_score,
        'current_rsi': round(current_rsi, 2)  # 당일 RSI 값
    }

def rsi_calculation5(df_with_rsi):
    """
    RSI 피보나치 레벨에 따른 점수 계산 함수
    :param df_with_rsi: RSI 값이 포함된 DataFrame
    :return: 계산된 점수와 당일 RSI 값
    """
    if df_with_rsi.empty:
        return {'score': None, 'current_rsi': None}

    last_row = df_with_rsi.iloc[-1]  # 마지막 데이터 (당일 데이터)
    current_rsi = last_row['RSI']

    # 피보나치 레벨 값들
    fib_levels = {
        'Fib_23.6': last_row['Fib_23.6'],
        'Fib_38.2': last_row['Fib_38.2'],
        'Fib_50': last_row['Fib_50'],
        'Fib_61.8': last_row['Fib_61.8'],
        'Fib_78.6': last_row['Fib_78.6']
    }

    # 점수 부여 (기본값 5)
    calculated_score = 5

    if current_rsi >= fib_levels['Fib_61.8']:  # 61.8% 이상
        calculated_score = 3  # 매수 신호
    elif current_rsi <= fib_levels['Fib_38.2']:  # 38.2% 이하
        calculated_score = 7  # 매도 신호
    else:
        calculated_score = 5  # 보통 상태

    return {
        'score': calculated_score,
        'current_rsi': round(current_rsi, 2)  # 당일 RSI 값
    }

def rsi_calculation_all(stock_data, rsi_data):
    """
    모든 RSI 분석 함수들을 종합하여 점수와 당일 RSI 값을 반환하는 함수.
    - rsi_calculation1부터 rsi_calculation5까지 종합
    """

    # 각 계산 함수 실행 및 점수 합산
    result1 = rsi_calculation1(stock_data, rsi_data)
    result2 = rsi_calculation2(stock_data, rsi_data)
    result3 = rsi_calculation3(rsi_data)
    result4 = rsi_calculation4(rsi_data)
    result5 = rsi_calculation5(rsi_data)

    # 결과에서 점수 추출
    scores = [
        result1.get('score', 5),
        result2.get('score', 5),
        result3.get('score', 5),
        result4.get('score', 5),
        result5.get('score', 5),
    ]

    # 가중치 설정
    weights = [3, 2, 1, 2, 2]

    # 가중 평균 계산
    weighted_scores = [score * weight for score, weight in zip(scores, weights)]
    total_weight = sum(weights)
    average_score = sum(weighted_scores) / total_weight

    # 당일 RSI 값 (rsi_calculation1에서 반환된 값 사용)
    current_rsi = result1.get('current_rsi', None)

    # 추천 결과 계산 (average_score에 따른 결과)
    recommendation = calculate_recommendation(average_score)

    # 최종 결과 반환
    return {
        "name": "RSI(14)",
        "value": current_rsi,
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