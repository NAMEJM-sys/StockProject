import redis
import json
from django.http import JsonResponse

from .kiwoom_realtime_app import redis_home_realtime_by_volume
from .models import StockData

from .utils import *
import pandas as pd
from datetime import date

from .views import clean_numeric_value

def get_chart_RSI_data(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_rsi = calculate_rsi(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating RSI: {str(e)}"}, status=500)

    df_with_rsi['date'] = df_with_rsi['date'].astype(str)

    result = df_with_rsi[['date','RSI']].to_dict('records')
    return JsonResponse(result, safe=False)


def get_chart_MFI_data(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close', 'volume')))
    df['date'] = pd.to_datetime(df['date'])
    
    try:
        df_with_mfi = calculate_mfi(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating MFI: {str(e)}"}, status=500)

    df_with_mfi['date'] = df_with_mfi['date'].astype(str)

    result = df_with_mfi[['date','MFI']].to_dict('records')
    return JsonResponse(result, safe=False)


def get_chart_CCI_data(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_with_cci = calculate_cci(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating CCI: {str(e)}"}, status=500)

    df_with_cci['date'] = df_with_cci['date'].astype(str)

    result = df_with_cci[['date', 'CCI']].to_dict(orient='records')

    return JsonResponse(result, safe=False)


def get_chart_MACD_data(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        df_macd = calculate_macd(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating CCI: {str(e)}"}, status=500)

    df_macd['date'] = df_macd['date'].astype(str)

    result = df_macd[['date', 'MACD_Line', 'Signal_Line', 'Histogram']].to_dict(orient='records')

    return JsonResponse(result, safe=False)


#===================================================
# Real-Time Function
#===================================================

redis_home_realtime_by_volume_chart = redis.StrictRedis(host='127.0.0.1', port=6379, db=1)

def clean_numeric_value(value):
    """숫자 값을 처리하기 위한 간단한 함수 (예시)"""
    try:
        return float(value.replace(",", "").strip())
    except ValueError:
        return None

def get_chart_stock_data_for_code(request, stock_code):
    chart_data = StockData.objects.filter(stock_code=stock_code).values('date', 'close', 'high', 'low', 'open',
                                                                        'volume').order_by('date')
    return JsonResponse(list(chart_data), safe=False)




