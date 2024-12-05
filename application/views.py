import json
import traceback
import io
from urllib import request

import redis
import requests
import zipfile
from datetime import date
import xml.etree.ElementTree as ET
from django.db.models import Max
from django.views.decorators.csrf import csrf_exempt
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.http import JsonResponse
from .models import StockData, StockList
from django.contrib.auth.models import User
from .serializers import StockDataSerializer, UserDataSerializer, StockListSerializer
from django.contrib.auth import authenticate, login
from django.views.decorators.http import require_GET
from .utils import *
import pandas as pd


redis_home_realtime_by_volume = redis.StrictRedis(host='127.0.0.1', port=6379, db=1)
redis_post_home_realtime_by_volume = redis.StrictRedis(host='127.0.0.1', port=6379, db=2)
redis_post_code = redis.StrictRedis(host='127.0.0.1', port=6379, db=4)


#=========================================================================
#  GET-POST Function
#=========================================================================


@api_view(['GET'])
def get_stock_data(request):
    stock_data = StockData.objects.all()
    serializer = StockDataSerializer(stock_data, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_stock_list(request):
    stock_list = StockList.objects.all()
    serializer = StockListSerializer(stock_list, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def get_users_data(request):
    users = User.objects.all()
    serializer = UserDataSerializer(users, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def register_user(request):
    serializer = UserDataSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({'success': True, 'message': 'User registered successfully!'}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def user_login(request):
    try:
        # Django REST Framework가 JSON 파싱을 자동으로 처리
        username = request.data.get('username')
        password = request.data.get('password')

        # 사용자 인증 시도
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return Response({'success': True, 'message': 'Login successful'}, status=status.HTTP_200_OK)
        else:
            return Response({'success': False, 'message': 'Invalid username or password'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        # 서버 오류 로깅 및 디버깅용 메시지 추가
        print(f"Unexpected error: {e}")
        print(traceback.format_exc())
        return Response({'success': False, 'message': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@require_GET
def fetch_dart_data(request):
    api_key = '114e272ba88850a6774c8450d500e9b8cd0a12e3'  # OpenDart에서 발급받은 API 키
    url = 'https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json'
    params = {
        'crtfc_key': api_key,
        'corp_code': '00126937',
        'bsns_year': '2023',
        'reprt_code': '11011',
        'fs_div': 'OFS'
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # HTTP 에러가 발생하면 예외를 발생시킵니다.
        data = response.json()
        return JsonResponse(data)
    except requests.exceptions.HTTPError as errh:
        return JsonResponse({'error': f'HTTP Error: {errh}'}, status=500)
    except requests.exceptions.ConnectionError as errc:
        return JsonResponse({'error': f'Error Connecting: {errc}'}, status=500)
    except requests.exceptions.Timeout as errt:
        return JsonResponse({'error': f'Timeout Error: {errt}'}, status=500)
    except requests.exceptions.RequestException as err:
        return JsonResponse({'error': f'OOps: Something Else {err}'}, status=500)


@require_GET
def fetch_dart_data_stock_num(request):
    api_key = '114e272ba88850a6774c8450d500e9b8cd0a12e3'  # OpenDart에서 발급받은 API 키
    url = 'https://opendart.fss.or.kr/api/stockTotqySttus.json'
    params = {
        'crtfc_key': api_key,
        'corp_code': '00126380',
        'bsns_year': '2023',
        'reprt_code': '11011',
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # HTTP 에러가 발생하면 예외를 발생시킵니다.
        data = response.json()
        return JsonResponse(data)
    except requests.exceptions.HTTPError as errh:
        return JsonResponse({'error': f'HTTP Error: {errh}'}, status=500)
    except requests.exceptions.ConnectionError as errc:
        return JsonResponse({'error': f'Error Connecting: {errc}'}, status=500)
    except requests.exceptions.Timeout as errt:
        return JsonResponse({'error': f'Timeout Error: {errt}'}, status=500)
    except requests.exceptions.RequestException as err:
        return JsonResponse({'error': f'OOps: Something Else {err}'}, status=500)


@require_GET
def fetch_corpCode(request):
    api_key = '114e272ba88850a6774c8450d500e9b8cd0a12e3'  # OpenDart에서 발급받은 API 키
    url = 'https://opendart.fss.or.kr/api/corpCode.xml'
    params = {
        'crtfc_key': api_key,
    }

    try:
        # ZIP 파일 응답을 받아옵니다.
        response = requests.get(url, params=params)
        response.raise_for_status()  # HTTP 에러가 발생하면 예외를 발생시킵니다.

        # ZIP 파일을 메모리 상에서 처리합니다.
        zip_file = zipfile.ZipFile(io.BytesIO(response.content))

        # ZIP 파일 안에 있는 XML 파일을 엽니다.
        xml_filename = zip_file.namelist()[0]  # 첫 번째 파일을 읽습니다.
        with zip_file.open(xml_filename) as xml_file:
            # XML 데이터를 읽고 파싱합니다.
            tree = ET.parse(xml_file)
            root = tree.getroot()

        # XML 데이터를 원하는 방식으로 변환 (여기서는 간단히 corp_code와 corp_name을 추출 예시)
        corp_list = []
        for corp in root.findall('./list'):
            corp_code = corp.find('corp_code').text
            corp_name = corp.find('corp_name').text
            stock_code = corp.find('stock_code').text
            corp_list.append({'corp_code': corp_code, 'corp_name': corp_name, 'stock_code': stock_code})

        return JsonResponse({'data': corp_list})

    except requests.exceptions.HTTPError as errh:
        return JsonResponse({'error': f'HTTP Error: {errh}'}, status=500)
    except requests.exceptions.ConnectionError as errc:
        return JsonResponse({'error': f'Error Connecting: {errc}'}, status=500)
    except requests.exceptions.Timeout as errt:
        return JsonResponse({'error': f'Timeout Error: {errt}'}, status=500)
    except requests.exceptions.RequestException as err:
        return JsonResponse({'error': f'OOps: Something Else {err}'}, status=500)
    except zipfile.BadZipFile as e:
        return JsonResponse({'error': f'Bad Zip File: {e}'}, status=500)
    except ET.ParseError as e:
        return JsonResponse({'error': f'XML Parse Error: {e}'}, status=500)


# @require_GET
# def get_real_time_data(request):
#     """
#     Redis에서 실시간 데이터를 가져오는 API
#     """
#     stock_code = request.GET.get('stock_code', None)  # 특정 종목 코드가 전달되었는지 확인
#
#     if stock_code:
#         # 특정 종목에 대한 실시간 데이터를 가져옴
#         real_time_data = redis_client.get(stock_code)
#         if real_time_data:
#             return JsonResponse(eval(real_time_data), safe=False)
#         else:
#             return JsonResponse({'message': f'No real-time data available for {stock_code}'}, status=200)
#     else:
#         # Redis에 저장된 모든 실시간 데이터를 가져옴
#         real_time_keys = redis_client.keys()  # Redis에 저장된 모든 key (종목코드)
#         all_real_time_data = {}
#
#         for key in real_time_keys:
#             key_str = key.decode('utf-8')
#
#             # 특정 키 패턴 제외 (예: top_5_scores_cache와 같은 키는 제외)
#             if "top_5_scores_cache" in key_str:
#                 continue
#
#             real_time_data = redis_client.get(key)
#             if real_time_data:
#                 try:
#                     all_real_time_data[key_str] = eval(real_time_data)  # 문자열을 딕셔너리로 변환
#                 except ValueError:
#                     continue  # 잘못된 데이터는 무시
#
#         if not all_real_time_data:
#             return JsonResponse({'message': 'No real-time data available'}, status=200)
#
#         return JsonResponse(all_real_time_data, safe=False)


@api_view(['POST'])
def handle_post_request(request):
    try:
        stock_code = request.data.get('stockCode')# request.data로 JSON 데이터를 받아옴
        print(stock_code)

        if stock_code:
            redis_post_code.set(stock_code, str(stock_code))  # Redis에 stock_code 저장
            return Response({'message': 'Stock code received successfully', 'stock_code': stock_code}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'No stock code provided'}, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        return Response({'error': 'An unexpected error occurred'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


#=========================================================================
#  Caculator Function
#=========================================================================


def get_stock_stochastic_k(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    # 데이터가 없는 경우 404 에러 반환
    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    # 데이터프레임으로 변환
    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    # Stochastic %K 및 점수 계산
    df_with_k = calculate_stochastic_k(df)

    # JsonResponse로 반환 (DataFrame을 딕셔너리로 변환)
    result = df_with_k[['date', 'score', 'perK', 'perD']].to_dict(orient='records')

    return JsonResponse(result, safe=False)


def get_stock_momentum(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    df_with_M = calculate_momentum(df)

    df_with_MO_lastest = df_with_M.iloc[-1]

    result = df_with_MO_lastest[['date', 'MOM', 'MOM_Score', 'close']].to_dict()

    return JsonResponse(result, safe=False)


def get_stock_rsi(request, stock_code):
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

    result = df_with_rsi[['date', 'RSI', 'RSI_Volatility', 'RSI_Z_Score',
                          'RSI_MA_Crossover', 'High_Volatility', 'RSI_Change', 'RSI_Max',
                          'RSI_Min', 'Fib_0', 'Fib_23.6', 'Fib_38.2', 'Fib_50', 'Fib_61.8',
                          'Fib_78.6', 'Fib_100', 'close']].to_dict(orient='records')

    return JsonResponse(result, safe=False)


def get_stock_macd(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close')))
    df['date'] = pd.to_datetime(df['date'])

    try:
        # 기본 MACD 계산
        df_macd = calculate_macd(df)

        # 다중 기간 MACD 계산 (예: [(12,26,9), (50,100,9)])
        settings_list = [(12, 26, 9), (50, 100, 9)]
        df_macd_multi = calculate_multi_timeframe_macd(df_macd, settings_list)

    except Exception as e:
        return JsonResponse({"error": f"Error calculating MACD: {str(e)}"}, status=500)

    df_macd_multi['date'] = df_macd_multi['date'].astype(str)

    # 필요한 컬럼 선택
    result_columns = ['date', 'close', 'MACD_Line', 'Signal_Line', 'Histogram', 'MACD_Change', 'MACD_Abs_Change']

    # 다중 기간 MACD 컬럼 추가
    for (short_window, long_window, signal_period) in settings_list:
        macd_label = f'MACD_{short_window}_{long_window}_{signal_period}'
        signal_label = f'Signal_{short_window}_{long_window}_{signal_period}'
        histogram_label = f'Histogram_{short_window}_{long_window}_{signal_period}'
        result_columns.extend([macd_label, signal_label, histogram_label])

    result = df_macd_multi[result_columns].to_dict(orient='records')

    return JsonResponse(result, safe=False)


def get_stock_adx(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'close', 'high', 'low')))
    adx_df = adx_calculation(df)

    if adx_df is None:
        return JsonResponse({"error": "ADX calculation failed."}, status=500)

    result = adx_df.to_dict(orient='records')
    return JsonResponse(result, safe=False)


def get_stock_parabolicSAR(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))

    df_with_sar = calculate_parabolicSAR(df)

    result = df_with_sar[['date', 'Parabolic_SAR', 'high', 'low', 'close', 'AF']].to_dict(orient='records')

    return JsonResponse(result, safe=False)


def get_stock_mfi(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    # 필요한 필드만 선택하여 DataFrame 생성
    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close', 'volume')))

    # 날짜 필드 형식 변환
    df['date'] = pd.to_datetime(df['date'])

    try:
        # MFI 계산
        df_with_mfi = calculate_mfi(df)
    except Exception as e:
        return JsonResponse({"error": f"Error calculating MFI: {str(e)}"}, status=500)

    # 날짜를 문자열로 변환하여 JSON 직렬화 문제 해결
    df_with_mfi['date'] = df_with_mfi['date'].astype(str)

    # 결과로 반환할 컬럼 선택
    result = df_with_mfi[['date', 'MFI', 'MFI_Volatility', 'MFI_Z_Score',
                          'MFI_MA_Crossover', 'High_Volatility','MFI_Change',
                          'MFI_Max', 'MFI_Min', 'Fib_0', 'Fib_23.6', 'Fib_38.2',
                          'Fib_50', 'Fib_61.8', 'Fib_78.6', 'Fib_100', 'close', 'volume']].to_dict(orient='records')

    return JsonResponse(result, safe=False)


def get_stock_Keltner(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))

    df_with_keltner = calculate_keltner_channel(df)
    result = df_with_keltner[['date', 'close', 'Middle_Line', 'Upper_Band', 'Lower_Band']].to_dict(orient='records')

    return JsonResponse(result, safe=False)


def get_stock_cci(request, stock_code):
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

    result = df_with_cci[['date', 'CCI', 'CCI_Volatility', 'CCI_Z_Score',
                          'CCI_MA_Crossover', 'High_Volatility', 'CCI_Change',
                          'CCI_Max', 'CCI_Min', 'Fib_0', 'Fib_23.6', 'Fib_38.2',
                          'Fib_50', 'Fib_61.8', 'Fib_78.6', 'Fib_100','close']].to_dict(orient='records')

    return JsonResponse(result, safe=False)


def get_stock_ichimoku(request, stock_code):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return JsonResponse({"error": "No data found for this stock code."}, status=404)

    df = pd.DataFrame(list(stock_data.values('date', 'high', 'low', 'close')))

    df_with_ichimoku = calculate_ichimoku(df)
    result = df_with_ichimoku[['date', 'Cloud_Colour' ,'Tenkan_sen', 'Kijun_sen', 'Senkou_Span_A', 'Senkou_Span_B', 'Chikou_Span', 'close']].to_dict(orient='records')

    return JsonResponse(result, safe=False)


def get_latest_stock_data(request):
    latest_date = StockData.objects.aggregate(latest_date=Max('date'))['latest_date']
    latest_data = StockData.objects.filter(date=latest_date).values('stock_code', 'date', 'close', 'high', 'low', 'open', 'volume')
    response_data = list(latest_data)
    return JsonResponse(response_data, safe=False)


def get_stock_data_for_code(request, stock_code):
    chart_data = StockData.objects.filter(stock_code=stock_code).values('date', 'close', 'high', 'low', 'open', 'volume').order_by('date')
    return JsonResponse(list(chart_data), safe=False)


def clean_numeric_value(value):
    # 값에서 공백과 모든 기호(+,-)를 제거한 후 정수로 변환
    return int(value.replace(' ', '').replace('+', '').replace('-', ''))


#===================================================
# Real-Time Function
#===================================================


def post_stock_real_data_for_code(request, stock_code):
    today = date.today()

    chart_data = list(
        StockData.objects.filter(stock_code=stock_code)
        .exclude(date=today)  # 오늘 날짜 데이터를 제외
        .values('date', 'close', 'high', 'low', 'open', 'volume')
        .order_by('date')
    )

    real_time_data = redis_post_home_realtime_by_volume.get(stock_code)

    if real_time_data:
        real_time_data = json.loads(real_time_data.decode('utf-8'))

        real_time_entry = {
            'date': real_time_data.get('timestamp'),  # Redis 데이터에서 timestamp를 가져옴
            'close': clean_numeric_value(real_time_data.get('current_price')),
            'high': clean_numeric_value(real_time_data.get('high_price')),
            'low': clean_numeric_value(real_time_data.get('low_price')),
            'open': clean_numeric_value(real_time_data.get('open_price')),
            'volume': clean_numeric_value(real_time_data.get('volume'))
        }
        chart_data.append(real_time_entry)

    return JsonResponse(list(chart_data), safe=False)


def get_home_realtime_by_volume(request):
    real_time_keys = redis_post_home_realtime_by_volume.keys()
    all_real_time_data = {}

    for key in real_time_keys:
        key_str = key.decode('utf-8')

        try:
            real_time_data = json.loads(redis_post_home_realtime_by_volume.get(key_str).decode('utf-8'))
            all_real_time_data[key_str] = real_time_data
        except (UnicodeDecodeError, json.JSONDecodeError) as e:
            print(f"Error decoding key {key_str}: {e}")
            continue

    if not all_real_time_data:
        return JsonResponse({'message': 'No real-time data available'}, status=200)

    return JsonResponse(all_real_time_data, safe=False)


def post_home_realtime_by_volume(request):
    real_time_keys = redis_post_home_realtime_by_volume.keys()
    all_real_time_data = {}

    for key in real_time_keys:
        key_str = key.decode('utf-8')

        try:
            real_time_data = redis_post_home_realtime_by_volume.get(key)
            all_real_time_data[key_str] = json.loads(real_time_data.decode('utf-8'))  # JSON으로 파싱
        except UnicodeDecodeError as e:
            print(f"Decoding error for key {key_str}: {e}")
            continue
        except json.JSONDecodeError as e:
            print(f"JSON decoding error for key {key_str}: {e}")
            continue

    if not all_real_time_data:
        return JsonResponse({'message': 'No real-time data available'}, status=200)

    return JsonResponse(all_real_time_data, safe=False)


def matching_stock_code(request):
    request_stock_code = request.session.get('stock_code')
    print("request_stock_code = ",request_stock_code)

    if request_stock_code:
        stock_codes = redis_post_code.keys()
        print(stock_codes)

        for stock_code in stock_codes:
            code = stock_code.decode('utf-8')
            print(code)
            if code == request_stock_code:
                print(code)
                return code


def get_rsi_realtime_data(request):
    code = matching_stock_code(request)
    print(code)
    real_time_data = redis_post_home_realtime_by_volume.get(code)
    today = date.today()

    stock_data = list(
        StockData.object.filter(stock_code=code)
        .exclude(date=today)
        .values('date', 'close')
        .order_by('date')
    )

    if code == real_time_data:
        df = pd.DataFrame(list(stock_data.values('date', 'close')))

        real_time_data = json.loads(real_time_data.decode('utf-8'))
        real_time_data = {
            'date': real_time_data.get('timestamp'),
            'close': clean_numeric_value(real_time_data.get('current_price')),
        }

        try:
            rsi_data = calculation_realtime_rsi(df, real_time_data)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)

        result = rsi_data[['date', 'close']].to_dict(orient='records')
        return JsonResponse(result, safe=False)


#=====================================
# Page loading Methode
#=====================================

@csrf_exempt
def delete_home_stock_codes(request):
    if request.method == 'POST':
        try:
            stock_codes = json.loads(request.body).get('stock_codes')
            if stock_codes:
                print(f"Received stock_codes: {stock_codes}")

                    # Redis 1에서 삭제
                for stock_code in stock_codes:
                    redis_home_realtime_by_volume.delete(stock_code)
                    print(f"Deleted stock_code: {stock_code} and set flag to prevent regeneration.")

                    return JsonResponse({'message': 'Deleted successfully'}, status=200)
            else:
                print("No stock_codes found")
                return JsonResponse({'error': 'stock_codes missing'}, status=400)
        except Exception as e:
            print(f"Error: {str(e)}")
            return JsonResponse({'error': 'Invalid request'}, status=400)
    return JsonResponse({'error': 'Invalid method'}, status=400)

@csrf_exempt
def step1_home_useEffect(request):
    if request.method == 'POST':
        latest_date = StockData.objects.aggregate(latest_data=Max('date'))['latest_data']
        top_40_volume_code = (StockData.objects.filter(date=latest_date).order_by('-volume')[:40]
                              .values_list('stock_code', flat=True))
        print(top_40_volume_code)

        all_real_time_data = {}

        for code in top_40_volume_code:
            stock_data = json.dumps({
                "stock_code": code,
                "message": "No real-time data yet"
            })

            redis_home_realtime_by_volume.set(code, stock_data)  # JSON 형식으로 저장
            redis_home_realtime_by_volume.expire(code, 86400)

        return JsonResponse(all_real_time_data, safe=False)

@csrf_exempt
def step2_home_useEffect(request):
    if request.method == 'POST':
        real_time_keys = redis_post_home_realtime_by_volume.keys()
        all_real_time_data = {}

        for key in real_time_keys:
            key_str = key.decode('utf-8')
            try:
                real_time_data = json.loads(redis_post_home_realtime_by_volume.get(key_str).decode('utf-8'))
                all_real_time_data[key_str] = real_time_data
            except (UnicodeDecodeError, json.JSONDecodeError) as e:
                print(f"Error decoding key {key_str}: {e}")
                continue

        if not all_real_time_data:
            return JsonResponse({'message': 'No real-time data available'}, status=200)

        return JsonResponse(all_real_time_data, safe=False)
    else:
            return JsonResponse({'error': 'Invalid request method'}, status=405)