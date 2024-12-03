from django.http import JsonResponse
from django.core.cache import caches
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

from .models import StockData, StockList
from .templates.calculation.calculationMFI import *
from .templates.calculation.calculationRSI import *
from .templates.calculation.calculationCCI import *
from .templates.calculation.calculationMACD import *
from .templates.calculation.calculationADX import *
from .templates.calculation.calculationSAR import *
from .templates.calculation.calculationKeltner import *
from .templates.calculation.calculationIchmoku import *
from .templates.calculation.calculationStochastic import *
from .templates.calculation.calculationEMA_10 import *
from .templates.calculation.calculationEMA_20 import *
from .templates.calculation.calculationEMA_30 import *
from .templates.calculation.calculationEMA_50 import *
from .templates.calculation.calculationEMA_100 import *
from .templates.calculation.calculationEMA_200 import *
from .templates.calculation.calculationSMA_10 import *
from .templates.calculation.calculationSMA_20 import *
from .templates.calculation.calculationSMA_30 import *
from .templates.calculation.calculationSMA_50 import *
from .templates.calculation.calculationSMA_100 import *
from .templates.calculation.calculationSMA_200 import *


from .utils import *
import pandas as pd

def calculation_total_oscillators(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close', 'high', 'low', 'open', 'volume')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_rsi = calculate_rsi(df)
        df_with_mfi = calculate_mfi(df)
        df_with_cci = calculate_cci(df)
        df_with_macd = calculate_macd(df)
        settings_list = [(12, 26, 9), (50, 100, 9)]
        df_macd_multi = calculate_multi_timeframe_macd(df_with_macd, settings_list)
        df_with_momentum = calculate_momentum(df)
        df_with_stochastic = calculate_stochastic_k(df)
        df_with_adx = adx_calculation(df)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


    final_adx = adx_calculation_all(df_with_adx)
    final_rsi = rsi_calculation_all(stock_data, df_with_rsi)
    final_mfi = mfi_calculation_all(stock_data, df_with_mfi)
    final_cci = cci_calculation_all(stock_data, df_with_cci)
    final_macd = macd_calculation_all(df_with_macd, df_macd_multi, df)
    final_stochastic = stochastic_total_calculation(stock_data, df_with_stochastic)

    adx_score = final_adx["damm"]
    rsi_score = final_rsi["damm"]
    mfi_score = final_mfi["damm"]
    cci_score = final_cci["damm"]
    macd_score = final_macd["damm"]
    stochastic_score = final_stochastic["damm"]

    df_with_MO_lastest = df_with_momentum.iloc[-1]
    momentum_score = df_with_MO_lastest["MOM_Score"]


    score = [
        adx_score, rsi_score, mfi_score, cci_score, macd_score, momentum_score, stochastic_score,
    ]

    weights = [3, 2.5, 2, 2, 3, 1.5, 2 ]

    weighted_scores = [score * weight for score, weight in zip(score, weights)]
    total_weight = sum(weights)
    average_score = sum(weighted_scores) / total_weight
    result = round(average_score, 2)

    return JsonResponse(result, safe=False, status=200)

def calculation_total_movingAverages(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close', 'high', 'low', 'open', 'volume')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_sar = calculate_parabolicSAR(df)
        df_with_keltner = calculate_keltner_channel(df)
        df_with_ichimoku =calculate_ichimoku(df)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    final_sar = sar_calculation_all(df_with_sar, stock_data)
    final_keltner = keltner_calculation_all(df_with_keltner)
    final_ichimoku = ichimoku_calculation_all(df_with_ichimoku)

    sar_score = final_sar["damm"]
    keltner_score = final_keltner["damm"]
    ichimoku_score = final_ichimoku["damm"]
    ema_sma_score = calculation_movingAverages(stock_code)


    score = [sar_score, keltner_score, ichimoku_score, ema_sma_score]

    weights = [2 ,3, 2, 7]

    weighted_scores = [score * weight for score, weight in zip(score, weights)]
    total_weight = sum(weights)
    average_score = sum(weighted_scores) / total_weight
    result = round(average_score, 2)

    return JsonResponse(result, safe=False, status=200)

def calculation_movingAverages(stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_ema10 = get_ema(df.copy())
        df_with_ema20 = get_ema(df.copy())
        df_with_ema30 = get_ema(df.copy())
        df_with_ema50 = get_ema(df.copy())
        df_with_ema100 = get_ema(df.copy())
        df_with_ema200 = get_ema(df.copy())
        df_with_sma10 = get_sma(df.copy())
        df_with_sma20 = get_sma(df.copy())
        df_with_sma30 = get_sma(df.copy())
        df_with_sma50 = get_sma(df.copy())
        df_with_sma100 = get_sma(df.copy())
        df_with_sma200 = get_sma(df.copy())

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

    final_ema10 = ema10_calculation_all(df, df_with_ema10)
    final_ema20 = ema20_calculation_all(df, df_with_ema20)
    final_ema30 = ema30_calculation_all(df, df_with_ema30)
    final_ema50 = ema50_calculation_all(df, df_with_ema50)
    final_ema100 = ema100_calculation_all(df, df_with_ema100)
    final_ema200 = ema200_calculation_all(df, df_with_ema200)
    final_sma10 = sma10_calculation_all(df, df_with_sma10)
    final_sma20 = sma20_calculation_all(df, df_with_sma20)
    final_sma30 = sma30_calculation_all(df, df_with_sma30)
    final_sma50 = sma50_calculation_all(df, df_with_sma50)
    final_sma100 = sma100_calculation_all(df, df_with_sma100)
    final_sma200 = sma200_calculation_all(df, df_with_sma200)

    ema10 = final_ema10["damm"]
    ema20 = final_ema20["damm"]
    ema30 = final_ema30["damm"]
    ema50 = final_ema50["damm"]
    ema100 = final_ema100["damm"]
    ema200 = final_ema200["damm"]
    sma10 = final_sma10["damm"]
    sma20 = final_sma20["damm"]
    sma30 = final_sma30["damm"]
    sma50 = final_sma50["damm"]
    sma100 = final_sma100["damm"]
    sma200 = final_sma200["damm"]

    score = [ema10, ema20, ema30, ema50, ema100, ema200,
             sma10, sma20, sma30, sma50, sma100, sma200]

    weights = [2, 2, 1, 1, 1, 1,
               1, 1, 1, 2, 2, 2]

    weighted_scores = [score * weight for score, weight in zip(score, weights)]
    total_weight = sum(weights)
    average_score = sum(weighted_scores) / total_weight
    result = round(average_score, 2)

    return result

def calculation_final_average(request, stock_code):
    # 첫 번째 함수의 결과 계산
    oscillators_result = calculation_total_oscillators(request, stock_code)
    moving_averages_result = calculation_total_movingAverages(request, stock_code)

    try:
        # 두 함수에서 반환된 값을 받아서 평균 계산
        oscillators_value = oscillators_result.content.decode('utf-8')
        moving_averages_value = moving_averages_result.content.decode('utf-8')

        # 값을 float으로 변환 후 평균 계산
        oscillators_score = float(oscillators_value)
        moving_averages_score = float(moving_averages_value)

        # 두 점수의 평균 계산
        average_score = (oscillators_score + moving_averages_score) / 2

        result = round(average_score, 2)

        return JsonResponse(result, safe=False, status=200)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

def calculation_rsi(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_rsi = calculate_rsi(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating RSI: {str(e)}"}, status=500)

    result = rsi_calculation_all(stock_data, df_with_rsi)

    return JsonResponse(result, safe=False)

def calculation_mfi(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close', 'volume')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_mfi = calculate_mfi(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating MFI: {str(e)}"}, status=500)

    result = mfi_calculation_all(stock_data, df_with_mfi)

    return JsonResponse(result, safe=False)

def calculation_cci(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))

    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_cci = calculate_cci(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating MFI: {str(e)}"}, status=500)

    result = cci_calculation_all(stock_data, df_with_cci)

    return JsonResponse(result, safe=False)

def calculation_macd(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_macd = calculate_macd(df)
        settings_list = [(12, 26, 9), (50, 100, 9)]
        df_macd_multi = calculate_multi_timeframe_macd(df_with_macd, settings_list)

    except Exception as e:
        return JsonResponse({"error": f"Error calculating MACD: {str(e)}"}, status=500)

    # 모든 MACD 계산 수행
    final_result = macd_calculation_all(df_with_macd, df_macd_multi, df)

    return JsonResponse(final_result)

def calculation_adx(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        # ADX 계산
        df_adx = adx_calculation(df)
    except Exception as e:
        return JsonResponse({"error": f"ADX 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    # 모든 ADX 계산 수행
    final_result = adx_calculation_all(df_adx)

    return JsonResponse(final_result)

def calculation_sar(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        # ADX 계산
        df_sar = calculate_parabolicSAR(df)
    except Exception as e:
        return JsonResponse({"error": f"ADX 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    # 모든 ADX 계산 수행
    final_result = sar_calculation_all(df_sar, stock_data)

    return JsonResponse(final_result)

def calculation_keltner(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        # ADX 계산
        df_keltner = calculate_keltner_channel(df)
    except Exception as e:
        return JsonResponse({"error": f"ADX 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    # 모든 ADX 계산 수행
    final_result = keltner_calculation_all(df_keltner)
    return JsonResponse(final_result)

def calculation_ichimoku(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        # ADX 계산
        df_ichimoku = calculate_ichimoku(df)
    except Exception as e:
        return JsonResponse({"error": f"ADX 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    # 모든 ADX 계산 수행
    final_result = ichimoku_calculation_all(df_ichimoku)

    return JsonResponse(final_result)

def calculation_stochastic(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        # ADX 계산
        df_with_stochastic = calculate_stochastic_k(df)
    except Exception as e:
        return JsonResponse({"error": f"ADX 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    # 모든 ADX 계산 수행
    final_result = stochastic_total_calculation(stock_data, df_with_stochastic)

    return JsonResponse(final_result)

def calculation_ema10(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_ema10 = get_ema(df)
    except Exception as e:
        return JsonResponse({"error": f"EMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = ema10_calculation_all(df, df_with_ema10)

    return JsonResponse(final_result)

def calculation_sma10(request,stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_sma10 = get_sma(df)
    except Exception as e:
        return JsonResponse({"error": f"SMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = sma10_calculation_all(df, df_with_sma10)

    return JsonResponse(final_result)

def calculation_ema20(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_ema20 = get_ema(df)
    except Exception as e:
        return JsonResponse({"error": f"EMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = ema20_calculation_all(df, df_with_ema20)

    return JsonResponse(final_result)

def calculation_sma20(request,stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_sma20 = get_sma(df)
    except Exception as e:
        return JsonResponse({"error": f"SMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = sma20_calculation_all(df, df_with_sma20)

    return JsonResponse(final_result)

def calculation_ema30(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_ema30 = get_ema(df)
    except Exception as e:
        return JsonResponse({"error": f"EMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = ema30_calculation_all(df, df_with_ema30)

    return JsonResponse(final_result)

def calculation_sma30(request,stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_sma30 = get_sma(df)
    except Exception as e:
        return JsonResponse({"error": f"SMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = sma30_calculation_all(df, df_with_sma30)

    return JsonResponse(final_result)

def calculation_ema50(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_ema50 = get_ema(df)
    except Exception as e:
        return JsonResponse({"error": f"EMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = ema50_calculation_all(df, df_with_ema50)

    return JsonResponse(final_result)

def calculation_sma50(request,stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_sma50 = get_sma(df)
    except Exception as e:
        return JsonResponse({"error": f"SMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = sma50_calculation_all(df, df_with_sma50)

    return JsonResponse(final_result)

def calculation_ema100(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_ema100 = get_ema(df)
    except Exception as e:
        return JsonResponse({"error": f"EMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = ema100_calculation_all(df, df_with_ema100)

    return JsonResponse(final_result)

def calculation_sma100(request,stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_sma100 = get_sma(df)
    except Exception as e:
        return JsonResponse({"error": f"SMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = sma100_calculation_all(df, df_with_sma100)

    return JsonResponse(final_result)

def calculation_ema200(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_ema200 = get_ema(df)
    except Exception as e:
        return JsonResponse({"error": f"EMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = ema200_calculation_all(df, df_with_ema200)

    return JsonResponse(final_result)

def calculation_sma200(request,stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "해당 주식 코드에 대한 데이터가 없습니다."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_sma200 = get_sma(df)
    except Exception as e:
        return JsonResponse({"error": f"SMA_10 계산 중 오류가 발생했습니다: {str(e)}"}, status=500)

    final_result = sma200_calculation_all(df, df_with_sma200)

    return JsonResponse(final_result)

def get_oscillators_score(stock_code):
    # 이 함수는 oscillators의 점수를 계산하고 숫자로 반환합니다.
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')
    if not stock_data.exists():
        return None  # 데이터가 없는 경우 None 반환

    df = pd.DataFrame(list(stock_data.values('date', 'close', 'high', 'low', 'open', 'volume')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_mfi = calculate_mfi(df)
        df_with_rsi = calculate_rsi(df)
        df_with_cci = calculate_cci(df)
        df_with_macd = calculate_macd(df)
        settings_list = [(12, 26, 9), (50, 100, 9)]
        df_macd_multi = calculate_multi_timeframe_macd(df_with_macd, settings_list)
        df_with_momentum = calculate_momentum(df)
        df_with_stochastic = calculate_stochastic_k(df)
        df_with_adx = adx_calculation(df)
    except Exception as e:
        return None  # 계산 중 오류 발생 시 None 반환

    final_adx = adx_calculation_all(df_with_adx)
    final_rsi = rsi_calculation_all(stock_data, df_with_rsi)
    final_mfi = mfi_calculation_all(stock_data, df_with_mfi)
    final_cci = cci_calculation_all(stock_data, df_with_cci)
    final_macd = macd_calculation_all(df_with_macd, df_macd_multi, df)
    final_stochastic = stochastic_total_calculation(stock_data, df_with_stochastic)

    adx_score = final_adx["damm"]
    rsi_score = final_rsi["damm"]
    mfi_score = final_mfi["damm"]
    cci_score = final_cci["damm"]
    macd_score = final_macd["damm"]
    stochastic_score = final_stochastic["damm"]

    df_with_MO_lastest = df_with_momentum.iloc[-1]
    momentum_score = df_with_MO_lastest["MOM_Score"]

    scores = [
        adx_score, rsi_score, mfi_score, cci_score, macd_score, momentum_score, stochastic_score,
    ]

    weights = [3, 2.5, 2, 2, 3, 1.5, 2 ]

    weighted_scores = [score * weight for score, weight in zip(scores, weights)]
    total_weight = sum(weights)
    average_score = sum(weighted_scores) / total_weight
    result = round(average_score, 2)

    return result

def get_moving_averages_score(stock_code):
    # 이 함수는 이동 평균의 점수를 계산하고 숫자로 반환합니다.
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return None

    df = pd.DataFrame(list(stock_data.values('date', 'close', 'high', 'low', 'open', 'volume')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_sar = calculate_parabolicSAR(df)
        df_with_keltner = calculate_keltner_channel(df)
        df_with_ichimoku = calculate_ichimoku(df)
    except Exception as e:
        return None

    final_sar = sar_calculation_all(df_with_sar, stock_data)
    final_keltner = keltner_calculation_all(df_with_keltner)
    final_ichimoku = ichimoku_calculation_all(df_with_ichimoku)
    ema_sma_score = calculation_movingAverages(stock_code)

    sar_score = final_sar["damm"]
    keltner_score = final_keltner["damm"]
    ichimoku_score = final_ichimoku["damm"]

    scores = [sar_score, keltner_score, ichimoku_score, ema_sma_score]
    weights = [2 ,3, 2, 7]

    weighted_scores = [score * weight for score, weight in zip(scores, weights)]
    total_weight = sum(weights)
    average_score = sum(weighted_scores) / total_weight
    result = round(average_score, 2)

    return result

def get_final_average_score(stock_code):
    try:
        # stock_code에 대한 처리 로직
        oscillators_score = get_oscillators_score(stock_code)
        moving_averages_score = get_moving_averages_score(stock_code)

        if oscillators_score is None or moving_averages_score is None:
            return None

        # 점수 계산 로직
        final_score = (oscillators_score + moving_averages_score) / 2
        return final_score

    except Exception as e:
        print(f"Error calculating score for stock_code {stock_code}: {e}")
        return None

# def calculate_stock_score(stock_code):
#     start = time.time()
#     final_score = get_final_average_score(stock_code)  # 각 주식 코드에 대한 최종 점수 계산
#     if final_score is None:
#         print(f"Processing stock_code: {stock_code}, score is None")
#     else:
#         print(f"Processing stock_code: {stock_code}, Time taken: {time.time() - start:.2f} seconds, final score: {final_score:.2f}")
#     return {'stock_code': stock_code, 'score': final_score}
#
# def compute_top_20():
#     # StockList에서 중복이 제거된 stock_code 가져오기
#     stock_codes = StockList.objects.values_list('code', flat=True)
#
#     # 해당 주식 코드에 해당하는 StockData 가져오기
#     stock_data = StockData.objects.filter(stock_code__in=stock_codes, volume__gte="10").values('stock_code', 'volume')
#     df = pd.DataFrame(list(stock_data))  # 데이터를 pandas DataFrame으로 변환
#
#     # 필터링: stock_code가 236350 이하이고 volume이 10 이상인 데이터만 필터링
#     filtered_df = df[df['stock_code'].astype(str) <= '236350']
#
#     stock_scores = []
#
#     # ThreadPoolExecutor를 사용해 병렬 처리
#     with ThreadPoolExecutor(max_workers=10) as executor:
#         futures = [executor.submit(calculate_stock_score, stock_code) for stock_code in filtered_df['stock_code'].unique()]
#
#         try:
#             for future in as_completed(futures):
#                 result = future.result()
#                 if result['score'] is not None:
#                     stock_scores.append(result)
#         except KeyboardInterrupt:
#             executor.shutdown(wait=False)
#             print("Execution stopped by user.")
#             return {'error': 'Execution stopped by user.'}
#
#     # 점수 기준으로 오름차순 정렬
#     sorted_stocks = sorted(stock_scores, key=lambda x: x['score'])
#
#     # 점수가 낮은 상위 10개 종목 선택
#     top_20 = sorted_stocks[:10]
#
#     stock_codes = [stock['stock_code'] for stock in top_20]
#     stock_info_dict = StockList.objects.in_bulk(stock_codes, field_name='code')
#
#     for stock in top_20:
#         stock_info = stock_info_dict.get(stock['stock_code'])
#         stock['stock_name'] = stock_info.name if stock_info else 'Unknown'
#
#     return top_20

# def top_5_scores(request):
#     recommendation_cache = caches['recommendation_cache']  # db=2 캐시 사용
#     cache_key = 'top_5_scores_cache'
#     cached_data = recommendation_cache.get(cache_key)
#
#     if cached_data:
#         print("Using cached data")
#         return JsonResponse(cached_data, safe=False)
#
#     top_20 = compute_top_20()
#     recommendation_cache.set(cache_key, top_20, timeout=600)
#     return JsonResponse(top_20, safe=False)



