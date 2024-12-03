import numpy as np

def cci_analysis1(cci_data, period=14):
    lastIndex = len(cci_data) -1
    if lastIndex < period:
        return {'message': '데이터가 충분하지 않습니다.', 'score': None}

    current_cci = cci_data.iloc[lastIndex]['CCI']

    cciTrendData = cci_data['CCI'].iloc[lastIndex - period + 1 : lastIndex + 1].values
    cciChange = cciTrendData[-1] - cciTrendData[0]
    cciTrendDirection = '상승' if cciChange > 0 else '하락'

    priceTrend = cci_data['close'].iloc[lastIndex - period + 1: lastIndex + 1].values
    priceChange = priceTrend[-1] - priceTrend[0]
    priceTrendDirection = '상승' if priceChange > 0 else '하락'

    currentCCI_MACrossover = cci_data.iloc[lastIndex].get('CCI_MA_Crossover')

    current_cci = float(current_cci)
    currentCCI_MACrossover = int(currentCCI_MACrossover) if currentCCI_MACrossover is not None else None

    if current_cci > 80:
        cciState = '과매수 상태'
    elif current_cci < 20:
        cciState = '과매도 상태'
    else:
        cciState = '중립 상태'

    return {
        'current_cci': current_cci,
        'cciState': cciState,
        'priceTrendDirection': priceTrendDirection,
        'cciTrendDirection': cciTrendDirection,
        'currentCCI_MACrossover': currentCCI_MACrossover,
    }

def cci_analysis2(stock_data, cci_data, swingRange=2):
    if len(stock_data) < swingRange * 2 or len(cci_data) < swingRange * 2:
        return {'message': '데이터가 충분하지 않습니다.'}

    stock_data_list = list(stock_data.values('date', 'close'))

    priceLows = find_swing_lows(stock_data_list, swingRange, 'close')
    priceHighs = find_swing_highs(stock_data_list, swingRange, 'close')

    cci_data_list = cci_data.to_dict('records')
    cciLows = find_swing_lows(cci_data_list, swingRange, 'CCI')
    cciHighs = find_swing_highs(cci_data_list, swingRange, 'CCI')

    analysis_data = {
        'priceLows': priceLows,
        'priceHighs': priceHighs,
        'cciLows': cciLows,
        'cciHighs': cciHighs,
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

def cci_analysis3(cci_data, period=14):
    lastIndex = len(cci_data) - 1
    if lastIndex < period:
        return {'analysisResult': '데이터가 충분하지 않습니다.'}

    current_cci = cci_data.iloc[lastIndex]

    current_volatility = current_cci['CCI_Volatility']
    if np.isnan(current_volatility):
        return {'analysisResult': 'CCI 변동성 데이터를 불러오는 데 문제가 발생했습니다.'}

    volatility_values = cci_data['CCI_Volatility'].tail(period)
    avg_volatility = volatility_values.mean()

    is_high_volatility = bool(current_volatility > avg_volatility)

    current_z_score = current_cci['CCI_Z_Score']
    if np.isnan(current_z_score):
        return {'analysisResult': 'CCI Z-스코어 데이터를 불러오는 데 문제가 발생했습니다.'}

    return {
        'avg_volatility': avg_volatility,
        'current_volatility': current_volatility,
        'is_high_volatility': is_high_volatility,
        'current_z_score': current_z_score
    }

def cci_analysis4(cci_data):
    """
    RSI 피보나치 되돌림 분석 함수 (데이터 값만 반환)
    :param cci_data: RSI 값이 포함된 DataFrame
    :return: 가장 가까운 피보나치 레벨과 그에 따른 분석 결과를 포함한 딕셔너리
    """
    if cci_data.empty:
        return {'message': '데이터가 충분하지 않습니다.'}

    last_row = cci_data.iloc[-1]  # 마지막 행의 데이터를 사용
    current_cci = last_row['CCI']

    # 피보나치 레벨 정의
    fib_levels = [
        {'level': 'Fib_23.6', 'value': last_row['Fib_23.6'], 'description': '약한 반등 가능성'},
        {'level': 'Fib_38.2', 'value': last_row['Fib_38.2'], 'description': '조정이 일어날 수 있는 중요한 지점'},
        {'level': 'Fib_50', 'value': last_row['Fib_50'], 'description': '강력한 지지 또는 저항이 될 수 있음'},
        {'level': 'Fib_61.8', 'value': last_row['Fib_61.8'], 'description': '주요 반전 지점으로 인식됨'},
        {'level': 'Fib_78.6', 'value': last_row['Fib_78.6'], 'description': '심한 조정이 끝나고 반전이 일어날 가능성이 큼'}
    ]

    # 현재 RSI 값과 각 피보나치 레벨의 차이 계산
    closest_fib = min(fib_levels, key=lambda x: abs(current_cci - x['value']))

    # 결과를 데이터로 반환
    result = {
        "current_cci": current_cci,
        "closest_fib_level": closest_fib['level'],
        "closest_fib_value": closest_fib['value'],
        "closest_fib_description": closest_fib['description']
    }

    if current_cci < fib_levels[0]['value']:
        result['message'] = 'MFI가 피보나치 23.6% 아래로 떨어졌습니다. 이는 약세 신호일 수 있습니다.'
    elif current_cci > fib_levels[-1]['value']:
        result['message'] = 'MFI가 피보나치 78.6% 이상입니다. 이는 강력한 반전이 일어날 가능성을 시사합니다.'
    else:
        result['message'] = 'MFI가 피보나치 레벨에 근접해 있습니다.'

    return result