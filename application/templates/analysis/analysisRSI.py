import numpy as np


def rsi_analysis1(rsi_data, period=14):
    lastIndex = len(rsi_data) - 1
    if lastIndex < period:
        return {'message': '데이터가 충분하지 않습니다.', 'score': None}

    # 최신 RSI 값 및 이전 값
    currentRSI = rsi_data.iloc[lastIndex]['RSI']  # iloc을 사용해 데이터프레임에 접근
    prevRSI = rsi_data.iloc[lastIndex - 1]['RSI']

    # RSI 및 가격 추세 분석
    rsiTrendData = rsi_data['RSI'].iloc[lastIndex - period + 1:lastIndex + 1].values
    totalChange = rsiTrendData[-1] - rsiTrendData[0]
    rsiTrendDirection = '상승' if totalChange > 0 else '하락'

    priceTrend = rsi_data['close'].iloc[lastIndex - period + 1:lastIndex + 1].values
    priceChange = priceTrend[-1] - priceTrend[0]
    priceTrendDirection = '상승' if priceChange > 0 else '하락'

    currentRSI_MACrossover = rsi_data.iloc[lastIndex].get('RSI_MA_Crossover')

    currentRSI = float(currentRSI)
    currentRSI_MACrossover = int(currentRSI_MACrossover) if currentRSI_MACrossover is not None else None

    # RSI 과매수/과매도 상태 판단
    if currentRSI > 70:
        rsiState = '과매수 상태'
    elif currentRSI < 30:
        rsiState = '과매도 상태'
    else:
        rsiState = '중립 상태'

    # 필요한 데이터만 JSON으로 반환
    return {
        'currentRSI': currentRSI,
        'rsiState': rsiState,
        'priceTrendDirection': priceTrendDirection,
        'rsiTrendDirection': rsiTrendDirection,
        'currentRSI_MACrossover': currentRSI_MACrossover
    }

def rsi_analysis2(stock_data, rsi_data, swingRange=2):
    # 데이터가 충분하지 않을 경우
    if len(stock_data) < swingRange * 2 or len(rsi_data) < swingRange * 2:
        return {'message': '데이터가 충분하지 않습니다.'}

    # QuerySet을 list로 변환하여 처리
    stock_data_list = list(stock_data.values('date', 'close'))

    # 가격 저점, 고점 찾기
    priceLows = find_swing_lows(stock_data_list, swingRange, 'close')
    priceHighs = find_swing_highs(stock_data_list, swingRange, 'close')

    # RSI 저점, 고점 찾기 (DataFrame을 리스트로 변환하여 처리)
    rsi_data_list = rsi_data.to_dict('records')  # DataFrame에서 records로 변환
    rsiLows = find_swing_lows(rsi_data_list, swingRange, 'RSI')
    rsiHighs = find_swing_highs(rsi_data_list, swingRange, 'RSI')

    # 분석 데이터 생성
    analysis_data = {
        'priceLows': priceLows,
        'priceHighs': priceHighs,
        'rsiLows': rsiLows,
        'rsiHighs': rsiHighs
    }

    return analysis_data

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

def rsi_analysis3(rsi_data, period=14):
    lastIndex = len(rsi_data) - 1
    if lastIndex < period:
        return {'analysisResult': '데이터가 충분하지 않습니다.'}

    currentRSI = rsi_data.iloc[lastIndex]

    current_volatility = currentRSI['RSI_Volatility']
    if np.isnan(current_volatility):
        return {'analysisResult': 'RSI 변동성 데이터를 불러오는 데 문제가 발생했습니다.'}

    # 'RSI_Volatility' 컬럼에서 최근 period만큼의 값을 가져오기 위해 loc 사용
    volatility_values = rsi_data['RSI_Volatility'].tail(period)
    avg_volatility = volatility_values.mean()

    is_high_volatility = bool(current_volatility > avg_volatility)

    current_z_score = currentRSI['RSI_Z_Score']
    if np.isnan(current_z_score):
        return {'analysisResult': 'RSI Z-스코어 데이터를 불러오는 데 문제가 발생했습니다.'}

    return {
        'avg_volatility': avg_volatility,
        'current_volatility': current_volatility,
        'is_high_volatility': is_high_volatility,
        'current_z_score': current_z_score
    }

def rsi_analysis4(df_with_rsi):
    """
    기간별 RSI 평균과 추세를 계산하고 매수/매도 신호를 생성한 후 JSON으로 반환하는 함수
    :param df_with_rsi: RSI 값이 포함된 DataFrame
    :return: JSON 형태의 분석 결과
    """
    periods = [7, 14, 30]

    # 각 기간별 평균과 추세 계산
    averages = {f'{p}_day_avg': calculate_averages_and_trends(df_with_rsi, p)['avg'] for p in periods}
    trends = {f'{p}_day_trend': calculate_averages_and_trends(df_with_rsi, p)['trend'] for p in periods}

    for p in periods:
        avg_trend_data = calculate_averages_and_trends(df_with_rsi, p)
        averages[f'{p}_day_avg'] = avg_trend_data['avg']
        trends[f'{p}_day_trend'] = avg_trend_data['trend']

    # JSON 형태로 결과 생성
    result = {
        "7_day_avg": averages['7_day_avg'],
        "14_day_avg": averages['14_day_avg'],
        "30_day_avg": averages['30_day_avg'],
        "7_day_trend": trends['7_day_trend'],
        "14_day_trend": trends['14_day_trend'],
        "30_day_trend": trends['30_day_trend'],
    }

    return result

def calculate_averages_and_trends(df_with_rsi, period):

    if len(df_with_rsi) < period:
        return {'avg': 0, 'trend': 0}

    recent_data = df_with_rsi.tail(period)
    avg = recent_data['RSI'].mean()
    trend = recent_data['RSI'].iloc[-1] - recent_data['RSI'].iloc[0]

    return {'avg': avg, 'trend': trend}

def rsi_analysis5(df_with_rsi):
    """
    RSI 피보나치 되돌림 분석 함수 (데이터 값만 반환)
    :param df_with_rsi: RSI 값이 포함된 DataFrame
    :return: 가장 가까운 피보나치 레벨과 그에 따른 분석 결과를 포함한 딕셔너리
    """
    if df_with_rsi.empty:
        return {'message': '데이터가 충분하지 않습니다.'}

    last_row = df_with_rsi.iloc[-1]  # 마지막 행의 데이터를 사용
    current_rsi = last_row['RSI']

    # 피보나치 레벨 정의
    fib_levels = [
        {'level': 'Fib_23.6', 'value': last_row['Fib_23.6'], 'description': '약한 반등 가능성'},
        {'level': 'Fib_38.2', 'value': last_row['Fib_38.2'], 'description': '조정이 일어날 수 있는 중요한 지점'},
        {'level': 'Fib_50', 'value': last_row['Fib_50'], 'description': '강력한 지지 또는 저항이 될 수 있음'},
        {'level': 'Fib_61.8', 'value': last_row['Fib_61.8'], 'description': '주요 반전 지점으로 인식됨'},
        {'level': 'Fib_78.6', 'value': last_row['Fib_78.6'], 'description': '심한 조정이 끝나고 반전이 일어날 가능성이 큼'}
    ]

    # 현재 RSI 값과 각 피보나치 레벨의 차이 계산
    closest_fib = min(fib_levels, key=lambda x: abs(current_rsi - x['value']))

    # 결과를 데이터로 반환
    result = {
        "current_rsi": current_rsi,
        "closest_fib_level": closest_fib['level'],
        "closest_fib_value": closest_fib['value'],
        "closest_fib_description": closest_fib['description']
    }

    # 추가로 RSI가 피보나치 23.6% 아래나 78.6% 위일 때의 메시지
    if current_rsi < fib_levels[0]['value']:
        result['message'] = 'RSI가 피보나치 23.6% 아래로 떨어졌습니다. 이는 약세 신호일 수 있습니다.'
    elif current_rsi > fib_levels[-1]['value']:
        result['message'] = 'RSI가 피보나치 78.6% 이상입니다. 이는 강력한 반전이 일어날 가능성을 시사합니다.'
    else:
        result['message'] = 'RSI가 피보나치 레벨에 근접해 있습니다.'

    return result
