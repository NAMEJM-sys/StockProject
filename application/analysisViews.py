from django.http import JsonResponse
from .models import StockData
from .templates.analysis.analysisADX import *
from .templates.analysis.analysisRSI import *
from .templates.analysis.analysisMFI import *
from .templates.analysis.analysisCCI import *
from .templates.analysis.analysisMACD import *
from .templates.analysis.analysisSAR import *
from .templates.analysis.analysisKeltner import *
from .templates.analysis.analysisIchmoku import *
from .utils import *
import pandas as pd

def analyze_rsi(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_rsi = calculate_rsi(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating RSI: {str(e)}"}, status=500)

    requested_analysis = request.GET.get('analysis', '1,2,3,4,5')
    analysis_list = requested_analysis.split(',')

    combined_result = {}

    if '1' in analysis_list:
        combined_result['rsi_analysis1'] = rsi_analysis1(df_with_rsi)
    if '2' in analysis_list:
        combined_result['rsi_analysis2'] = rsi_analysis2(stock_data, df_with_rsi)
    if '3' in analysis_list:
        combined_result['rsi_analysis3'] = rsi_analysis3(df_with_rsi)
    if '4' in analysis_list:
        combined_result['rsi_analysis4'] = rsi_analysis4(df_with_rsi)
    if '5' in analysis_list:
        combined_result['rsi_analysis5'] = rsi_analysis5(df_with_rsi)

    return JsonResponse(combined_result, safe=False)


def analyze_mfi(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close', 'volume')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_mfi = calculate_mfi(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating MFI: {str(e)}"}, status=500)

    requested_analysis = request.GET.get('analysis', '1,2,3,4')
    analysis_list = requested_analysis.split(',')

    combined_result = {}

    if '1' in analysis_list:
        combined_result['mfi_analysis1'] = mfi_analysis1(df_with_mfi)
    if '2' in analysis_list:
        combined_result['mfi_analysis2'] = mfi_analysis2(stock_data, df_with_mfi)
    if '3' in analysis_list:
        combined_result['mfi_analysis3'] = mfi_analysis3(df_with_mfi)
    if '4' in analysis_list:
        combined_result['mfi_analysis4'] = mfi_analysis4(df_with_mfi)
    return JsonResponse(combined_result, safe=False)


def analyze_cci(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_cci = calculate_cci(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating CCI: {str(e)}"}, status=500)

    requested_analysis = request.GET.get('analysis', '1,2,3,4')
    analysis_list = requested_analysis.split(',')

    combined_result = {}

    if '1' in analysis_list:
        combined_result['cci_analysis1'] = cci_analysis1(df_with_cci)
    if '2' in analysis_list:
        combined_result['cci_analysis2'] = cci_analysis2(stock_data, df_with_cci)
    if '3' in analysis_list:
        combined_result['cci_analysis3'] = cci_analysis3(df_with_cci)
    if '4' in analysis_list:
        combined_result['cci_analysis4'] = cci_analysis4(df_with_cci)
    return JsonResponse(combined_result, safe=False)


def analyze_macd(request, stock_code):
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
        return JsonResponse({"error": f"Error calculating CCI: {str(e)}"}, status=500)

    requested_analysis = request.GET.get('analysis', '1,2,3,4')
    analysis_list = requested_analysis.split(',')

    combined_result = {}

    if '1' in analysis_list:
        combined_result['macd_analysis1'] = macd_analysis1(df_with_macd, stock_data)
    if '2' in analysis_list:
        combined_result['macd_analysis2'] = macd_analysis2(df_with_macd, stock_data)
    if '3' in analysis_list:
        combined_result['macd_analysis3'] = macd_analysis3(df_with_macd)
    if '4' in analysis_list:
        combined_result['macd_analysis4'] = macd_analysis4(df_macd_multi)
    if '5' in analysis_list:
        combined_result['macd_analysis5'] = macd_analysis5(df_with_macd)

    return JsonResponse(combined_result, safe=False)


def analyze_adx(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_adx = adx_calculation(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating ADX: {str(e)}"}, status=500)

    requested_analysis = request.GET.get('analysis', '1,2,3,4')
    analysis_list = requested_analysis.split(',')

    combined_result = {}

    if '1' in analysis_list:
        combined_result['adx_analysis1'] = adx_analysis1(df_with_adx)
    if '2' in analysis_list:
        combined_result['adx_analysis2'] = adx_analysis2(df_with_adx)
    if '3' in analysis_list:
        combined_result['adx_analysis3'] = adx_analysis3(df_with_adx)
    if '4' in analysis_list:
        combined_result['adx_analysis4'] = adx_analysis4(df_with_adx)

    return JsonResponse(combined_result, safe=False)


def analyze_sar(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_sar = calculate_parabolicSAR(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating ADX: {str(e)}"}, status=500)

    requested_analysis = request.GET.get('analysis', '1,2,3,4')
    analysis_list = requested_analysis.split(',')

    combined_result = {}

    if '1' in analysis_list:
        combined_result['sar_analysis1'] = sar_analysis1(df_with_sar)
    if '2' in analysis_list:
        combined_result['sar_analysis2'] = sar_analysis2(df_with_sar)
    if '3' in analysis_list:
        combined_result['sar_analysis3'] = sar_analysis3(df_with_sar)
    if '4' in analysis_list:
        combined_result['sar_analysis4'] = sar_analysis4(df_with_sar)

    return JsonResponse(combined_result, safe=False)


def analyze_keltner(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_keltner = calculate_keltner_channel(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating ADX: {str(e)}"}, status=500)

    requested_analysis = request.GET.get('analysis', '1,2,3,4')
    analysis_list = requested_analysis.split(',')

    combined_result = {}

    if '1' in analysis_list:
        combined_result['keltner_analysis1'] = keltner_analysis1(df_with_keltner)
    if '2' in analysis_list:
        combined_result['keltner_analysis2'] = keltner_analysis2(df_with_keltner)
    if '3' in analysis_list:
        combined_result['keltner_analysis3'] = keltner_analysis3(df_with_keltner)
    if '4' in analysis_list:
        combined_result['keltner_analysis4'] = keltner_analysis4(df_with_keltner)

    return JsonResponse(combined_result, safe=False)


def analyze_ichimoku(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        ichimoku_data = calculate_ichimoku(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating Ichimoku Cloud: {str(e)}"}, status=500)

    requested_analysis = request.GET.get('analysis', '1,2,3,4')
    analysis_list = requested_analysis.split(',')

    combined_result = {}

    if '1' in analysis_list:
        combined_result['ichimoku_analysis1'] = ichimoku_analysis1(ichimoku_data)
    if '2' in analysis_list:
        combined_result['ichimoku_analysis2'] = ichimoku_analysis2(ichimoku_data)
    if '3' in analysis_list:
        combined_result['ichimoku_analysis3'] = ichimoku_analysis3(ichimoku_data)
    if '4' in analysis_list:
        combined_result['ichimoku_analysis4'] = ichimoku_analysis4(ichimoku_data)

    return JsonResponse(combined_result, safe=False)


def calculate_multi_timeframe_macd(df, settings_list):
    """
    다중 기간 MACD 계산 함수
    :param df: DataFrame with columns ['date', 'close']
    :param settings_list: 각 MACD 설정의 리스트 (ex: [(12, 26, 9), (50, 100, 9)])
    :return: 다중 기간 MACD 및 Signal 값이 포함된 DataFrame
    """
    df = df.copy()

    for short_window, long_window, signal_period in settings_list:
        # 단기 및 장기 EMA 계산
        macd_label = f'MACD_{short_window}_{long_window}_{signal_period}'
        signal_label = f'Signal_{short_window}_{long_window}_{signal_period}'
        histogram_label = f'Histogram_{short_window}_{long_window}_{signal_period}'

        # MACD 계산
        df[f'EMA_short_{short_window}'] = df['close'].ewm(span=short_window, adjust=False).mean()
        df[f'EMA_long_{long_window}'] = df['close'].ewm(span=long_window, adjust=False).mean()

        df[macd_label] = df[f'EMA_short_{short_window}'] - df[f'EMA_long_{long_window}']
        df[signal_label] = df[macd_label].ewm(span=signal_period, adjust=False).mean()
        df[histogram_label] = df[macd_label] - df[signal_label]

    return df
