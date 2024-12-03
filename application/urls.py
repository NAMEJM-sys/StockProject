from django.urls import path
from . import views  # 현재 디렉토리의 views 모듈 가져오기
from . import chartViews
from . import analysisViews
from . import calculcationView

urlpatterns = [
    path('stock_data/', views.get_stock_data, name='get_stock_data'),  # 주식 데이터 가져오기
    path('latest_stock_data/', views.get_latest_stock_data, name='get_latest_stock_data'),  # 주식 데이터 가져오기
    path('stock_rsi/<str:stock_code>/', views.get_stock_rsi, name='get_stock_rsi'),  # 여기에 추가
    path('stock_macd/<str:stock_code>/', views.get_stock_macd, name='get_stock_macd'),  # 여기에 추가
    path('stock_adx/<str:stock_code>/', views.get_stock_adx, name='get_stock_adx'),
    path('stock_mfi/<str:stock_code>/', views.get_stock_mfi, name='get_stock_mfi'),
    path('stock_parabolicSAR/<str:stock_code>/', views.get_stock_parabolicSAR, name='get_stock_parabolicSAR'),
    path('get_stock_Keltner/<str:stock_code>/', views.get_stock_Keltner, name='get_stock_Keltner'),
    path('get_stock_cci/<str:stock_code>/', views.get_stock_cci, name='get_stock_cci'),
    path('get_stock_ichimoku/<str:stock_code>/', views.get_stock_ichimoku, name='get_stock_ichimoku'),
    path('get_stock_stochastic_k/<str:stock_code>/', views.get_stock_stochastic_k, name ='get_stock_stochastic_k'),
    path('get_stock_momentum/<str:stock_code>/', views.get_stock_momentum, name='get_stock_momentum'),
    path('stock_data_for_code/<str:stock_code>/', views.get_stock_data_for_code, name='get_stock_data_for_code'),
    path('stock_list/', views.get_stock_list, name='get_stock_list'), # kospi 종목 목록
    path('users_data/', views.get_users_data, name='get_users_data'),  # 사용자 데이터 가져오기
    path('register/', views.register_user, name='register_user'),  # 사용자 등록
    path('login/', views.user_login, name='user_login'),  # 사용자 로그인
    path('handle_post_request/', views.handle_post_request, name='handle_post_request'),
    # path('top_5_scores/', calculcationView.top_5_scores, name='top_5_scores'),
    path('get_home_realtime_by_volume/', views.get_home_realtime_by_volume, name='get_home_realtime_by_volume'),
    path('post_home_realtime_by_volume/', views.post_home_realtime_by_volume, name='post_home_realtime_by_volume'),
    path('get_rsi_realtime_data/', views.get_rsi_realtime_data, name='get_rsi_realtime_data'),
    path('delete_home_stock_codes/', views.delete_home_stock_codes, name='delete_home_stock_codes'),
    path('step1_home_useEffect/', views.step1_home_useEffect, name='step1_home_useEffect'),
    path('step2_home_useEffect/', views.step2_home_useEffect, name='step2_home_useEffect'),

    path('get_chart_stock_data_for_code/<str:stock_code>/', chartViews.get_chart_stock_data_for_code, name='get_chart_stock_data_for_code'),
    path('post_stock_real_data_for_code/<str:stock_code>/', views.post_stock_real_data_for_code, name='post_stock_real_data_for_code'),
    path('get_chart_RSI_data/<str:stock_code>/', chartViews.get_chart_RSI_data, name='get_chart_RSI_data'),
    path('get_chart_MFI_data/<str:stock_code>/', chartViews.get_chart_MFI_data, name='get_chart_MFI_data'),
    path('get_chart_CCI_data/<str:stock_code>/', chartViews.get_chart_CCI_data, name='get_chart_CCI_data'),
    path('get_chart_MACD_data/<str:stock_code>/', chartViews.get_chart_MACD_data, name='get_chart_MACD_data'),


    path('analyze_rsi/<str:stock_code>/', analysisViews.analyze_rsi, name='analyze_rsi'),
    path('analyze_mfi/<str:stock_code>/', analysisViews.analyze_mfi, name='analyze_mfi'),
    path('analyze_cci/<str:stock_code>/', analysisViews.analyze_cci, name='analyze_cci'),
    path('analyze_macd/<str:stock_code>/', analysisViews.analyze_macd, name='analyze_macd'),
    path('analyze_adx/<str:stock_code>/', analysisViews.analyze_adx, name='analyze_adx'),
    path('analyze_sar/<str:stock_code>/', analysisViews.analyze_sar, name='analyze_sar'),
    path('analyze_keltner/<str:stock_code>/', analysisViews.analyze_keltner, name='analyze_keltner'),
    path('analyze_ichimoku/<str:stock_code>/', analysisViews.analyze_ichimoku, name='analyze_ichimoku'),


    path('calculation_rsi/<str:stock_code>/', calculcationView.calculation_rsi, name='calculation_rsi'),
    path('calculation_mfi/<str:stock_code>/', calculcationView.calculation_mfi, name='calculation_mfi'),
    path('calculation_cci/<str:stock_code>/', calculcationView.calculation_cci, name='calculation_cci'),
    path('calculation_macd/<str:stock_code>/', calculcationView.calculation_macd, name='calculation_macd'),
    path('calculation_adx/<str:stock_code>/', calculcationView.calculation_adx, name='calculation_adx'),
    path('calculation_sar/<str:stock_code>/', calculcationView.calculation_sar, name='calculation_sar'),
    path('calculation_keltner/<str:stock_code>/', calculcationView.calculation_keltner, name='calculation_keltner'),
    path('calculation_ichimoku/<str:stock_code>/', calculcationView.calculation_ichimoku, name='calculation_ichimoku'),
    path('calculation_stochastic/<str:stock_code>/', calculcationView.calculation_stochastic, name='calculation_stochastic'),
    path('calculation_total_movingAverages/<str:stock_code>/', calculcationView.calculation_total_movingAverages, name='calculation_total_movingAverages'),
    path('calculation_final_average/<str:stock_code>/', calculcationView.calculation_final_average, name='calculation_final_average'),
    path('calculation_total_oscillators/<str:stock_code>/', calculcationView.calculation_total_oscillators, name='calculation_total_oscillators'),


    path('calculation_ema10/<str:stock_code>/', calculcationView.calculation_ema10, name='calculation_ema10'),
    path('calculation_sma10/<str:stock_code>/', calculcationView.calculation_sma10, name='calculation_sma10'),
    path('calculation_ema20/<str:stock_code>/', calculcationView.calculation_ema20, name='calculation_ema20'),
    path('calculation_sma20/<str:stock_code>/', calculcationView.calculation_sma20, name='calculation_sma20'),
    path('calculation_ema30/<str:stock_code>/', calculcationView.calculation_ema30, name='calculation_ema30'),
    path('calculation_sma30/<str:stock_code>/', calculcationView.calculation_sma30, name='calculation_sma30'),
    path('calculation_ema50/<str:stock_code>/', calculcationView.calculation_ema50, name='calculation_ema50'),
    path('calculation_sma50/<str:stock_code>/', calculcationView.calculation_sma50, name='calculation_sma50'),
    path('calculation_ema100/<str:stock_code>/', calculcationView.calculation_ema100, name='calculation_ema100'),
    path('calculation_sma100/<str:stock_code>/', calculcationView.calculation_sma100, name='calculation_sma100'),
    path('calculation_ema200/<str:stock_code>/', calculcationView.calculation_ema200, name='calculation_ema200'),
    path('calculation_sma200/<str:stock_code>/', calculcationView.calculation_sma200, name='calculation_sma200'),

    path('dart-data/', views.fetch_dart_data, name='fetch_dart_data'),
    path('fetch_dart_data_stock_num/', views.fetch_dart_data_stock_num, name='fetch_dart_data_stock_num'),
    path('fetch_corpCode/', views.fetch_corpCode, name='fetch_corpCode'),

]