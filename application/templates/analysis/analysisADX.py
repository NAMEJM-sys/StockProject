import numpy as np

def adx_analysis1(adx_data, period=14):

    def calculate_ema(values, period):
        k = 2 / (period+1)
        ema = values[0]
        for index in range(1, len(values)):
            curr = values[index]
            ema = curr * k + ema * (1 - k)
        return ema

    if adx_data.empty or len(adx_data) < period:
        return {"error": "데이터가 충분하지 않습니다."}

    recent_adx = adx_data['ADX'].tail(period).tolist()
    avg_adx = calculate_ema(recent_adx, period)

    result = {
        "avg_adx": avg_adx
    }
    return result


def adx_analysis2(df_adx, period=14):
    """
    DI+와 DI-의 교차 분석
    """
    def calculate_ema(values, period):
        k = 2 / (period + 1)
        ema = []

        for index, value in enumerate(values):
            if index == 0:
                ema.append(value)
            else:
                ema.append(value * k + ema[index - 1] * (1 - k))
        return ema

    if df_adx.empty or len(df_adx) < period + 1:
        return {"error": "데이터가 충분하지 않습니다."}

    di_plus_values = df_adx['DI14Plus']
    di_minus_values = df_adx['DI14Minus']

    di_plus_ema = calculate_ema(di_plus_values, period)
    di_minus_ema = calculate_ema(di_minus_values, period)

    current_di_plus_ema = di_plus_ema[-1]
    current_di_minus_ema = di_minus_ema[-1]
    prev_di_plus_ema = di_plus_ema[-2]
    prev_di_minus_ema = di_minus_ema[-2]

    cross = None
    if prev_di_plus_ema <= prev_di_minus_ema and current_di_plus_ema > current_di_minus_ema:
        cross = "bullish"
    elif prev_di_plus_ema >= prev_di_minus_ema and current_di_plus_ema < current_di_minus_ema:
        cross = "bearish"

    result = {
        "cross": cross
    }
    return result


def adx_analysis3(df_adx, period=14):
    """
    ADX의 방향성 분석
    """
    if df_adx.empty or len(df_adx) < period:
        return {"error": "데이터가 충분하지 않습니다."}

    adx_trend_values = df_adx['ADX_Trend'].tail(period)
    adx_slope = adx_trend_values.mean()

    result = {
        "adx_slope": adx_slope
    }
    return result


def adx_analysis4(df_adx, period=14):
    def calculate_ema(values, period):
        k = 2 / (period + 1)
        ema = []

        for index, value in enumerate(values):
            if index == 0:
                ema.append(value)
            else:
                ema.append(value * k + ema[index - 1] * (1 - k))
        return ema

    if df_adx.empty or len(df_adx) < period:
        return {"error": "데이터가 충분하지 않습니다."}

    adx_values = df_adx['ADX'].tail(period)
    di_plus_values = df_adx['DI14Plus'].tail(period)
    di_minus_values = df_adx['DI14Minus'].tail(period)

    adx_ema = calculate_ema(adx_values, period)[-1]
    di_plus_ema = calculate_ema(di_plus_values, period)[-1]
    di_minus_ema = calculate_ema(di_minus_values, period)[-1]

    indices = np.arange(period)
    adx_values_reset = adx_values.reset_index(drop=True)
    slope, intercept = np.polyfit(indices, adx_values_reset.values, 1)

    result = {
        "adx_ema": adx_ema,
        "di_plus_ema": di_plus_ema,
        "di_minus_ema": di_minus_ema,
        "adx_slope": slope,
    }
    return result



