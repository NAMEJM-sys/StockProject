import numpy as np

def mfi_analysis1(mfi_data, period=14):
    lastIndex = len(mfi_data) -1
    if lastIndex < period:
        return {'message': '데이터가 충분하지 않습니다.', 'score': None}

    current_mfi = mfi_data.iloc[lastIndex]['MFI']

    mfiTrendData = mfi_data['MFI'].iloc[lastIndex - period + 1:lastIndex + 1].values
    totalChange = mfiTrendData[-1] - mfiTrendData[0]
    mfiTrendDirection = '상승' if totalChange > 0 else '하락'

    priceTrend = mfi_data['close'].iloc[lastIndex -period+ 1 : lastIndex + 1].values
    priceChange = priceTrend[-1] - priceTrend[0]
    priceTrendDirection = '상승' if priceChange > 0 else '하락'

    currentMFI_MACrossover = mfi_data.iloc[lastIndex].get('MFI_MA_Crossover')

    current_mfi = float(current_mfi)
    currentMFI_MACrossover = int(currentMFI_MACrossover) if currentMFI_MACrossover is not None else None

    if current_mfi > 80:
        mfiState = '과매수 상태'
    elif current_mfi < 20:
        mfiState = '과매도 상태'
    else:
        mfiState = '중립 상태'

    return {
        'current_mfi': current_mfi,
        'mfiState': mfiState,
        'priceTrendDirection': priceTrendDirection,
        'mfiTrendDirection': mfiTrendDirection,
        'currentRSI_MACrossover': currentMFI_MACrossover,
    }

def mfi_analysis2(stock_data, mfi_data, swingRange=2):
    if len(stock_data) < swingRange * 2 or len(mfi_data) < swingRange * 2:
        return {'message': '데이터가 충분하지 않습니다.'}

    stock_data_list = list(stock_data.values('date', 'close'))

    priceLows = find_swing_lows(stock_data_list, swingRange, 'close')
    priceHighs = find_swing_highs(stock_data_list, swingRange, 'close')

    mfi_data_list = mfi_data.to_dict('records')
    mfiLows = find_swing_lows(mfi_data_list, swingRange, 'MFI')
    mfiHighs = find_swing_highs(mfi_data_list, swingRange, 'MFI')

    analysis_data = {
        'priceLows': priceLows,
        'priceHighs': priceHighs,
        'mfiLows': mfiLows,
        'mfiHighs': mfiHighs,
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

def mfi_analysis3(mfi_data, period=14):
    lastIndex = len(mfi_data) - 1
    if lastIndex < period:
        return {'analysisResult': '데이터가 충분하지 않습니다.'}

    current_mfi = mfi_data.iloc[lastIndex]

    current_volatility = current_mfi['MFI_Volatility']
    if np.isnan(current_volatility):
        return {'analysisResult': 'RSI 변동성 데이터를 불러오는 데 문제가 발생했습니다.'}

    volatility_values = mfi_data['MFI_Volatility'].tail(period)
    avg_volatility = volatility_values.mean()

    is_high_volatility = bool(current_volatility > avg_volatility)

    current_z_score = current_mfi['MFI_Z_Score']
    if np.isnan(current_z_score):
        return {'analysisResult': 'RSI Z-스코어 데이터를 불러오는 데 문제가 발생했습니다.'}

    return {
        'avg_volatility': avg_volatility,
        'current_volatility': current_volatility,
        'is_high_volatility': is_high_volatility,
        'current_z_score': current_z_score
    }

def mfi_analysis4(mfi_data):
    """
    RSI 피보나치 되돌림 분석 함수 (데이터 값만 반환)
    :param mfi_data: RSI 값이 포함된 DataFrame
    :return: 가장 가까운 피보나치 레벨과 그에 따른 분석 결과를 포함한 딕셔너리
    """
    if mfi_data.empty:
        return {'message': '데이터가 충분하지 않습니다.'}

    last_row = mfi_data.iloc[-1]  # 마지막 행의 데이터를 사용
    current_mfi = last_row['MFI']

    # 피보나치 레벨 정의
    fib_levels = [
        {'level': 'Fib_23.6', 'value': last_row['Fib_23.6'], 'description': '약한 반등 가능성'},
        {'level': 'Fib_38.2', 'value': last_row['Fib_38.2'], 'description': '조정이 일어날 수 있는 중요한 지점'},
        {'level': 'Fib_50', 'value': last_row['Fib_50'], 'description': '강력한 지지 또는 저항이 될 수 있음'},
        {'level': 'Fib_61.8', 'value': last_row['Fib_61.8'], 'description': '주요 반전 지점으로 인식됨'},
        {'level': 'Fib_78.6', 'value': last_row['Fib_78.6'], 'description': '심한 조정이 끝나고 반전이 일어날 가능성이 큼'}
    ]

    # 현재 RSI 값과 각 피보나치 레벨의 차이 계산
    closest_fib = min(fib_levels, key=lambda x: abs(current_mfi - x['value']))

    # 결과를 데이터로 반환
    result = {
        "current_mfi": current_mfi,
        "closest_fib_level": closest_fib['level'],
        "closest_fib_value": closest_fib['value'],
        "closest_fib_description": closest_fib['description']
    }

    # 추가로 RSI가 피보나치 23.6% 아래나 78.6% 위일 때의 메시지
    if current_mfi < fib_levels[0]['value']:
        result['message'] = 'MFI가 피보나치 23.6% 아래로 떨어졌습니다. 이는 약세 신호일 수 있습니다.'
    elif current_mfi > fib_levels[-1]['value']:
        result['message'] = 'MFI가 피보나치 78.6% 이상입니다. 이는 강력한 반전이 일어날 가능성을 시사합니다.'
    else:
        result['message'] = 'MFI가 피보나치 레벨에 근접해 있습니다.'

    return result



