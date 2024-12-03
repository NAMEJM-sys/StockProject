
def ichimoku_analysis1(ichimoku_data):
    """
    전환선과 기준선의 교차 분석에 필요한 데이터 반환
    """
    if ichimoku_data.empty or len(ichimoku_data) < 2:
        return {"error": "데이터가 충분하지 않습니다."}

    last_index = ichimoku_data.index[-1]
    prev_index = ichimoku_data.index[-2]

    prev_tenkan = ichimoku_data.loc[prev_index, 'Tenkan_sen']
    prev_kijun = ichimoku_data.loc[prev_index, 'Kijun_sen']
    current_tenkan = ichimoku_data.loc[last_index, 'Tenkan_sen']
    current_kijun = ichimoku_data.loc[last_index, 'Kijun_sen']

    result = {
        "prev_tenkan": prev_tenkan,
        "prev_kijun": prev_kijun,
        "current_tenkan": current_tenkan,
        "current_kijun": current_kijun
    }

    return result

def ichimoku_analysis2(ichimoku_data):
    """
    가격과 구름대의 관계 분석에 필요한 데이터 반환
    """
    if ichimoku_data.empty or len(ichimoku_data) < 26:
        return {"error": "데이터가 충분하지 않습니다."}

    last_index = ichimoku_data.index[-1]

    current_close = int(ichimoku_data.loc[last_index, 'close'])
    senkou_a = float(ichimoku_data.loc[last_index, 'Senkou_Span_A'])
    senkou_b = float(ichimoku_data.loc[last_index, 'Senkou_Span_B'])
    prev_close = int(ichimoku_data.loc[ichimoku_data.index[-2], 'close'])

    result = {
        "current_close": current_close,
        "prev_close": prev_close,
        "senkou_a": float(senkou_a),
        "senkou_b": float(senkou_b)
    }

    return result

def ichimoku_analysis3(ichimoku_data):
    """
    후행스팬을 통한 추세 확인에 필요한 데이터 반환
    """
    if ichimoku_data.empty or len(ichimoku_data) < 26:
        return {"error": "데이터가 충분하지 않습니다."}

    last_index = ichimoku_data.index[-27]  # Chikou Span은 26일 뒤로 이동

    if last_index < 0:
        return {"error": "데이터가 충분하지 않습니다."}

    chikou_span = ichimoku_data.loc[last_index, 'Chikou_Span']
    current_close = int(ichimoku_data.loc[last_index, 'close'])

    result = {
        "chikou_span": chikou_span,
        "current_close": current_close
    }

    return result

def ichimoku_analysis4(ichimoku_data):
    """
    구름대의 두께와 색상 분석에 필요한 데이터 반환
    """
    if ichimoku_data.empty or len(ichimoku_data) < 52:
        return {"error": "데이터가 충분하지 않습니다."}

    last_index = ichimoku_data.index[-26]  # 구름대는 26일 앞에 표시됨

    senkou_a = float(ichimoku_data.loc[last_index, 'Senkou_Span_A'])
    senkou_b = float(ichimoku_data.loc[last_index, 'Senkou_Span_B'])
    cloud_colour = ichimoku_data.loc[last_index, 'Cloud_Colour']
    current_close = int(ichimoku_data.loc[last_index, 'close'])

    cloud_thickness = abs(senkou_a - senkou_b)

    result = {
        "senkou_a": senkou_a,
        "senkou_b": senkou_b,
        "cloud_colour": cloud_colour,
        "cloud_thickness": cloud_thickness,
        "current_close": current_close
    }

    return result