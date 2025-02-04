
import pandas_ta as ta
import pandas as pd
import numpy as np
from datetime import datetime

def get_ema(df):
    df['EMA_10'] = ta.ema(df['close'], length=10)
    df['EMA_20'] = ta.ema(df['close'], length=20)
    df['EMA_30'] = ta.ema(df['close'], length=30)
    df['EMA_50'] = ta.ema(df['close'], length=50)
    df['EMA_100'] = ta.ema(df['close'], length=100)
    df['EMA_200'] = ta.ema(df['close'], length=200)

    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df

def get_sma(df):
    df['SMA_10'] = ta.sma(df['close'], length=10)
    df['SMA_20'] = ta.sma(df['close'], length=20)
    df['SMA_30'] = ta.sma(df['close'], length=30)
    df['SMA_50'] = ta.sma(df['close'], length=50)
    df['SMA_100'] = ta.sma(df['close'], length=100)
    df['SMA_200'] = ta.sma(df['close'], length=200)

    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df

def calculate_momentum(df, period=10):
    """
    모멘텀 인디케이터를 계산하는 함수
    :param data: pandas DataFrame (종가 'close' 열이 필요함)
    :param period: 모멘텀 기간 (기본값 10)
    :return: 모멘텀 인디케이터가 추가된 DataFrame
    """
    # MOM 계산: 현재 종가 - N일 전 종가

    df['MOM'] = df['close'] - df['close'].shift(period)

    min_mom = df['MOM'].min()
    max_mom = df['MOM'].max()

    conditions = [
        (df['MOM'] >= max_mom * 0.8),  # 가장 강한 매수 신호 (상위 20%)
        (df['MOM'] >= max_mom * 0.4),  # 강한 매수 신호 (상위 40%)
        (df['MOM'] > 0),  # 보통 (양수이지만 크지 않은 경우)
        (df['MOM'] <= 0) & (df['MOM'] > min_mom * 0.4),  # 보통 (음수이지만 크지 않은 경우)
        (df['MOM'] <= min_mom * 0.4),  # 강한 매도 신호
        (df['MOM'] <= min_mom * 0.8)  # 가장 강한 매도 신호
    ]

    scores = [1, 3, 5, 5, 7, 9]

    df['MOM_Score'] = np.select(conditions, scores, default=5)

    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df

def calculate_stochastic_k(df, period_k=14, period_d=3, smooth_k=3):
    """
    스토캐스틱 %K 및 %D를 계산하고 점수화하는 함수
    :param df: pandas DataFrame (종가 'close', 고가 'high', 저가 'low' 열이 필요함)
    :param period_k: %K 기간 (기본값 14)
    :param period_d: %D 기간 (기본값 3)
    :param smooth_k: %K의 평활화 기간 (기본값 3)
    :return: 스토캐스틱 %K, %D 및 점수를 포함한 DataFrame
    """

    df = df.copy()

    # 스토캐스틱 %K 계산
    stochastic = ta.stoch(df['high'], df['low'], df['close'], k=period_k, d=period_d, smooth_k=smooth_k)

    # 스토캐스틱 %D 계산 (%K의 3일 이동평균)
    df['perK'] = stochastic['STOCHk_14_3_3']  # %K 값
    df['perD'] = stochastic['STOCHd_14_3_3']  # %D 값

    # %K 값을 바탕으로 점수 부여
    def score_from_stochastic_k(value):
        if value <= 20:
            return 1  # 강한 매수
        elif 20 < value <= 40:
            return 2  # 매수
        elif 40 < value <= 60:
            return 5  # 보통
        elif 60 < value <= 80:
            return 7  # 매도
        else:
            return 9  # 강한 매도

    # 각 %K 값에 대해 점수 부여
    df['score'] = df['perK'].apply(score_from_stochastic_k)

    # NaN 값 처리
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df

def calculate_rsi_with_fibonacci(df, period=14):
    df = df.copy()
    df['RSI'] = ta.rsi(df['close'], length=period)

    lookback_period = period * 2
    df['RSI_Max'] = df['RSI'].rolling(window=lookback_period).max()
    df['RSI_Min'] = df['RSI'].rolling(window=lookback_period).min()

    def calculate_fibonacci_levels(max_val, min_val):
        diff = max_val - min_val
        return pd.Series({
            'Fib_0': max_val,
            'Fib_23.6': max_val - diff * 0.236,
            'Fib_38.2': max_val - diff * 0.382,
            'Fib_50': max_val - diff * 0.5,
            'Fib_61.8': max_val - diff * 0.618,
            'Fib_78.6': max_val - diff * 0.786,
            'Fib_100': min_val
        })

    fib_levels = df.apply(lambda row: calculate_fibonacci_levels(row['RSI_Max'], row['RSI_Min']), axis=1)
    df = pd.concat([df, fib_levels], axis=1)
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df

def calculate_rsi(df, period=14, signal_period=9):
    """
    개선된 RSI (Relative Strength Index) 계산 함수

    :param df: DataFrame with columns ['date', 'close']
    :param period: 기간 (기본값: 14)
    :return: 계산된 컬럼들이 추가된 DataFrame
    """
    df = df.copy()

    # 1. RSI 계산
    df['RSI'] = ta.rsi(df['close'], length=period)

    # 2-1. RSI의 Signal Line
    df['RSI_Signal_Line'] = df['RSI'].rolling(window=signal_period).mean();
    
    # 2-2. RSI의 변화량 계산
    df['RSI_Change'] = df['RSI'].diff()

    # 3. 지수 이동 표준편차를 사용하여 RSI 변동성 계산
    def ema_std(series, span):
        mean = series.ewm(span=span, adjust=False).mean()
        variance = ((series - mean) ** 2).ewm(span=span, adjust=False).mean()
        return np.sqrt(variance)

    df['RSI_Volatility'] = ema_std(df['RSI_Change'], span=period)

    # 4. Z-스코어 계산을 통한 이상치 탐지
    df['RSI_Mean'] = df['RSI'].rolling(window=period).mean()
    df['RSI_Std'] = df['RSI'].rolling(window=period).std()
    df['RSI_Z_Score'] = (df['RSI'] - df['RSI_Mean']) / df['RSI_Std']

    # 5. RSI 이동 평균 교차 분석
    df['RSI_Short_MA'] = df['RSI'].rolling(window=period//2).mean()
    df['RSI_Long_MA'] = df['RSI'].rolling(window=period).mean()
    df['RSI_MA_Crossover'] = np.where(df['RSI_Short_MA'] > df['RSI_Long_MA'], 1, -1)

    # 6. 변동성 클러스터링
    df['Volatility_Mean'] = df['RSI_Volatility'].rolling(window=period).mean()
    df['High_Volatility'] = df['RSI_Volatility'] > df['Volatility_Mean']

    # 7. 피보나치 레벨 추가
    df = calculate_rsi_with_fibonacci(df, period)

    # NaN 값 처리
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df

def calculate_multi_timeframe_macd(df, settings_list):
    """
    다중 기간 MACD 계산 함수

    :param df: DataFrame with columns ['date', 'close']
    :param settings_list: MACD 설정의 리스트, 각 설정은 (short_window, long_window, signal_period)의 튜플
    :return: 각 설정에 대한 MACD가 추가된 DataFrame
    """
    df = df.copy()
    for idx, (short_window, long_window, signal_period) in enumerate(settings_list):
        macd_label = f'MACD_{short_window}_{long_window}_{signal_period}'
        signal_label = f'Signal_{short_window}_{long_window}_{signal_period}'
        histogram_label = f'Histogram_{short_window}_{long_window}_{signal_period}'

        ema_short = df['close'].ewm(span=short_window, adjust=False).mean()
        ema_long = df['close'].ewm(span=long_window, adjust=False).mean()
        macd_line = ema_short - ema_long
        signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
        histogram = macd_line - signal_line

        df[macd_label] = macd_line
        df[signal_label] = signal_line
        df[histogram_label] = histogram

    # NaN 값 처리
    df.fillna(0, inplace=True)

    return df

def calculate_macd(df, short_window=12, long_window=26, signal_period=9):
    """
    MACD (Moving Average Convergence Divergence) 계산 함수

    :param df: DataFrame with columns ['date', 'close']
    :param short_window: MACD의 단기 EMA 기간 (기본값: 12)
    :param long_window: MACD의 장기 EMA 기간 (기본값: 26)
    :param signal_period: Signal Line의 기간 (기본값: 9)
    :return: MACD 및 관련 지표가 추가된 DataFrame
    """
    df = df.copy()

    # 1. 단기 및 장기 EMA 계산
    df['EMA_short'] = df['close'].ewm(span=short_window, adjust=False).mean()
    df['EMA_long'] = df['close'].ewm(span=long_window, adjust=False).mean()

    # 2. MACD Line 계산
    df['MACD_Line'] = df['EMA_short'] - df['EMA_long']

    # 3. Signal Line 계산
    df['Signal_Line'] = df['MACD_Line'].ewm(span=signal_period, adjust=False).mean()

    # 4. Histogram 계산
    df['Histogram'] = df['MACD_Line'] - df['Signal_Line']

    # 5. MACD의 변화량 계산
    df['MACD_Change'] = df['MACD_Line'].diff()

    # 6. MACD 절대값
    df['MACD_Abs_Change'] = df['MACD_Change'].abs()

    # 7. Histogram의 변화량 계산
    df['Histogram_Change'] = df['Histogram'].diff()


    # NaN 값 처리
    df.fillna(0, inplace=True)

    return df

def adx_calculation(df, length=14, lensig=14, scalar=100, mamode="rma", drift=1, offset=0):
    """ADX 및 DMI 계산"""

    # True Range (ATR) 계산
    df['TR'] = df[['high', 'low', 'close']].max(axis=1) - df[['high', 'low', 'close']].min(axis=1)
    atr_ = df['TR'].rolling(window=length).mean()

    up = df['high'] - df['high'].shift(drift)
    dn = df['low'].shift(drift) - df['low']

    pos = np.where((up > dn) & (up > 0), up, 0.0)
    neg = np.where((dn > up) & (dn > 0), dn, 0.0)

    dmp = 100 * (pd.Series(pos).ewm(alpha=1/length).mean() / atr_)
    dmn = 100 * (pd.Series(neg).ewm(alpha=1/length).mean() / atr_)

    dx = (np.abs(dmp - dmn) / (dmp + dmn)) * 100
    adx = dx.ewm(alpha=1/lensig).mean()

    # 결과 DataFrame 생성
    data = {
        'date': df['date'],
        'DI14Plus': dmp,
        'DI14Minus': dmn,
        'ADX': adx
    }
    result_df = pd.DataFrame(data)

    # NaN 값 처리
    result_df.replace([np.inf, -np.inf], np.nan, inplace=True)
    result_df.fillna(0, inplace=True)

    # ADX의 방향성 계산
    result_df['ADX_Trend'] = result_df['ADX'] - result_df['ADX'].shift(1)
    result_df['ADX_Direction'] = result_df['ADX_Trend'].apply(lambda x: '상승' if x > 0 else '하락' if x < 0 else '변화 없음')

    # DI+와 DI-의 교차 여부 계산
    result_df['DIP_Cross'] = np.where(
        (result_df['DI14Plus'] > result_df['DI14Minus']) & (result_df['DI14Plus'].shift(1) <= result_df['DI14Minus'].shift(1)),
        'DI+ 상향 돌파',
        np.where(
            (result_df['DI14Plus'] < result_df['DI14Minus']) & (result_df['DI14Plus'].shift(1) >= result_df['DI14Minus'].shift(1)),
            'DI+ 하향 돌파',
            '변화 없음'
        )
    )

    # NaN 값 처리
    result_df.replace([np.inf, -np.inf], np.nan, inplace=True)
    result_df.dropna(inplace=True)

    return result_df

def calculate_parabolicSAR(df, af_start=0.02, af_increment=0.02, af_max=0.2):
    """
    Parabolic SAR 계산 함수
    """
    # 날짜를 기준으로 데이터 정렬 (오름차순)
    df = df.sort_values(by='date').reset_index(drop=True)

    high = df['high']
    low = df['low']
    close = df['close']

    af = af_start  # 가속 계수 (Acceleration Factor)
    trend_up = True  # 기본적으로 상승 추세로 시작
    ep = high[0]  # 초기값은 고가를 Extreme Point로 설정
    sar = low[0]  # 초기 SAR 값은 저가로 설정
    sar_values = [sar]  # SAR 값을 저장할 리스트, 첫 번째 값으로 초기화
    af_values = [af]  # AF 값을 저장할 리스트

    for i in range(1, len(df)):
        prev_sar = sar  # 이전 SAR 값을 저장
        if trend_up:
            sar = prev_sar + af * (ep - prev_sar)
            # 현재 SAR이 이전 두 개의 저점보다 낮아야 함
            sar = min(sar, low[i - 1], low[i - 2] if i >= 2 else low[i - 1])
            if low[i] < sar:  # 추세 전환 감지
                trend_up = False
                sar = ep
                ep = low[i]
                af = af_start  # 가속 계수 초기화
            else:
                if high[i] > ep:  # 새로운 고점이 발생하면 EP 갱신
                    ep = high[i]
                    af = min(af + af_increment, af_max)  # 가속 계수 증가
        else:
            sar = prev_sar + af * (ep - prev_sar)
            # 현재 SAR이 이전 두 개의 고점보다 높아야 함
            sar = max(sar, high[i - 1], high[i - 2] if i >= 2 else high[i - 1])
            if high[i] > sar:  # 추세 전환 감지
                trend_up = True
                sar = ep
                ep = high[i]
                af = af_start  # 가속 계수 초기화
            else:
                if low[i] < ep:  # 새로운 저점이 발생하면 EP 갱신
                    ep = low[i]
                    af = min(af + af_increment, af_max)  # 가속 계수 증가

        sar_values.append(sar)  # 계산된 SAR 값을 저장
        af_values.append(af)  # 계산된 AF 값을 저장

    df['Parabolic_SAR'] = sar_values  # 계산된 SAR 값을 DataFrame에 추가
    df['AF'] = af_values  # 계산된 AF 값을 DataFrame에 추가
    df.replace({np.nan: None}, inplace=True)

    return df

def calculate_mfi_with_fibonacci(df, period=20):
    """
    MFI 지표에 피보나치 되돌림을 적용한 계산 함수

    :param df: DataFrame with columns ['date', 'high', 'low', 'close', 'volume']
    :param period: 기간 (기본값: 14)
    :return: 계산된 컬럼들이 추가된 DataFrame
    """
    df = df.copy()

    # 1. MFI 계산
    df['MFI'] = ta.mfi(df['high'], df['low'], df['close'], df['volume'], length=period)

    # 2. 최근 고점과 저점 식별 (MFI 기준)
    lookback_period = period * 2
    df['MFI_Max'] = df['MFI'].rolling(window=lookback_period).max()
    df['MFI_Min'] = df['MFI'].rolling(window=lookback_period).min()

    # 3. 피보나치 되돌림 레벨 계산
    def calculate_fibonacci_levels(max_val, min_val):
        diff = max_val - min_val
        level_0 = max_val
        level_236 = max_val - diff * 0.236
        level_382 = max_val - diff * 0.382
        level_50 = max_val - diff * 0.5
        level_618 = max_val - diff * 0.618
        level_786 = max_val - diff * 0.786
        level_100 = min_val
        return pd.Series({
            'Fib_0': level_0,
            'Fib_23.6': level_236,
            'Fib_38.2': level_382,
            'Fib_50': level_50,
            'Fib_61.8': level_618,
            'Fib_78.6': level_786,
            'Fib_100': level_100
        })

    fib_levels = df.apply(lambda row: calculate_fibonacci_levels(row['MFI_Max'], row['MFI_Min']), axis=1)
    df = pd.concat([df, fib_levels], axis=1)

    # NaN 값 처리
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df

def calculate_mfi(df, period=14):
    """
    개선된 MFI (Money Flow Index) 계산 함수

    :param df: DataFrame with columns ['date', 'high', 'low', 'close', 'volume']
    :param period: 기간 (기본값: 14)
    :return: 계산된 컬럼들이 추가된 DataFrame
    """
    df = df.copy()

    # 1. MFI 계산
    df['MFI'] = ta.mfi(df['high'], df['low'], df['close'], df['volume'], length=period)

    # 2. MFI의 변화량 계산
    df['MFI_Change'] = df['MFI'].diff()

    # 3. 지수 이동 표준편차를 사용하여 MFI 변동성 계산
    def ema_std(series, span):
        mean = series.ewm(span=span, adjust=False).mean()
        variance = ((series - mean) ** 2).ewm(span=span, adjust=False).mean()
        return np.sqrt(variance)

    df['MFI_Volatility'] = ema_std(df['MFI_Change'], span=period)

    # 4. Z-스코어 계산을 통한 이상치 탐지
    df['MFI_Mean'] = df['MFI'].rolling(window=period).mean()
    df['MFI_Std'] = df['MFI'].rolling(window=period).std()
    df['MFI_Z_Score'] = (df['MFI'] - df['MFI_Mean']) / df['MFI_Std']

    # 5. MFI 이동 평균 교차 분석
    df['MFI_Short_MA'] = df['MFI'].rolling(window=period//2).mean()
    df['MFI_Long_MA'] = df['MFI'].rolling(window=period).mean()
    df['MFI_MA_Crossover'] = np.where(df['MFI_Short_MA'] > df['MFI_Long_MA'], 1, -1)

    # 6. 변동성 클러스터링
    df['Volatility_Mean'] = df['MFI_Volatility'].rolling(window=period).mean()
    df['High_Volatility'] = df['MFI_Volatility'] > df['Volatility_Mean']

    # 7. 파보나치 계산 추가
    df = calculate_mfi_with_fibonacci(df, period)

    # NaN 값 처리
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    # DataFrame 반환
    return df

def calculate_keltner_channel(df, period=20, multiplier=2):
    """
    Keltner Channel 계산기
    :param df: DataFrame with columns ['date', 'high', 'low', 'close']
    :param period: 이동평균을 계산할 기간 (기본값: 20)
    :param multiplier: ATR에 곱할 계수 (기본값: 2)
    :return: DataFrame with Keltner Channel 추가
    """
    # 1. 이동평균 계산 (EMA)
    df['Middle_Line'] = df['close'].ewm(span=period, adjust=False).mean()

    # 2. True Range(TR) 계산
    df['H-L'] = df['high'] - df['low']
    df['H-C'] = abs(df['high'] - df['close'].shift(1))
    df['L-C'] = abs(df['low'] - df['close'].shift(1))
    df['TR'] = df[['H-L', 'H-C', 'L-C']].max(axis=1)

    # 3. ATR (Average True Range) 계산
    df['ATR'] = df['TR'].ewm(span=period, adjust=False).mean().mean()

    # 4. Keltner Channel의 Upper Band 및 Lower Band 계산
    df['Upper_Band'] = df['Middle_Line'] + (df['ATR'] * multiplier)
    df['Lower_Band'] = df['Middle_Line'] - (df['ATR'] * multiplier)

    # NaN 값 제거 또는 대체
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    # 필요 없는 컬럼 제거
    df.drop(columns=['H-L', 'H-C', 'L-C', 'TR'], inplace=True)

    return df

def calculate_cci_with_fibonacci(df, period=14):
    """
    CCI 지표에 피보나치 되돌림을 적용한 계산 함수

    :param df: DataFrame with columns ['date', 'high', 'low', 'close']
    :param period: 기간 (기본값: 14)
    :return: 계산된 컬럼들이 추가된 DataFrame
    """
    df = df.copy()

    # 1. CCI 계산
    df['CCI'] = ta.cci(df['high'], df['low'], df['close'], length=period)

    # 2. 최근 고점과 저점 식별 (CCI 기준)
    lookback_period = period * 2
    df['CCI_Max'] = df['CCI'].rolling(window=lookback_period).max()
    df['CCI_Min'] = df['CCI'].rolling(window=lookback_period).min()

    # 3. 피보나치 되돌림 레벨 계산
    def calculate_fibonacci_levels(max_val, min_val):
        diff = max_val - min_val
        level_0 = max_val
        level_236 = max_val - diff * 0.236
        level_382 = max_val - diff * 0.382
        level_50 = max_val - diff * 0.5
        level_618 = max_val - diff * 0.618
        level_786 = max_val - diff * 0.786
        level_100 = min_val
        return pd.Series({
            'Fib_0': level_0,
            'Fib_23.6': level_236,
            'Fib_38.2': level_382,
            'Fib_50': level_50,
            'Fib_61.8': level_618,
            'Fib_78.6': level_786,
            'Fib_100': level_100
        })

    fib_levels = df.apply(lambda row: calculate_fibonacci_levels(row['CCI_Max'], row['CCI_Min']), axis=1)
    df = pd.concat([df, fib_levels], axis=1)

    # NaN 값 처리
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df

def calculate_cci(df, period=20):
    """
    개선된 CCI (Commodity Channel Index) 계산 함수

    :param df: DataFrame with columns ['date', 'high', 'low', 'close']
    :param period: 기간 (기본값: 14)
    :return: 계산된 컬럼들이 추가된 DataFrame
    """
    df = df.copy()

    # 1. CCI 계산
    df['CCI'] = ta.cci(df['high'], df['low'], df['close'], length=period)

    # 2. CCI의 변화량 계산
    df['CCI_Change'] = df['CCI'].diff()

    # 3. 지수 이동 표준편차를 사용하여 CCI 변동성 계산
    def ema_std(series, span):
        mean = series.ewm(span=span, adjust=False).mean()
        variance = ((series - mean) ** 2).ewm(span=span, adjust=False).mean()
        return np.sqrt(variance)

    df['CCI_Volatility'] = ema_std(df['CCI_Change'], span=period)

    # 4. Z-스코어 계산을 통한 이상치 탐지
    df['CCI_Mean'] = df['CCI'].rolling(window=period).mean()
    df['CCI_Std'] = df['CCI'].rolling(window=period).std()
    df['CCI_Z_Score'] = (df['CCI'] - df['CCI_Mean']) / df['CCI_Std']

    # 5. CCI 이동 평균 교차 분석
    df['CCI_Short_MA'] = df['CCI'].rolling(window=period//2).mean()
    df['CCI_Long_MA'] = df['CCI'].rolling(window=period).mean()
    df['CCI_MA_Crossover'] = np.where(df['CCI_Short_MA'] > df['CCI_Long_MA'], 1, -1)

    # 6. 변동성 클러스터링
    df['Volatility_Mean'] = df['CCI_Volatility'].rolling(window=period).mean()
    df['High_Volatility'] = df['CCI_Volatility'] > df['Volatility_Mean']

    # 7. 파보나치 레벨 추가
    df = calculate_cci_with_fibonacci(df, period)

    # NaN 값 처리
    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df

def calculate_ichimoku(df):
    """
    Ichimoku Cloud 계산기

    :param df: DataFrame with columns ['date', 'high', 'low', 'close']
    :return: DataFrame with Ichimoku Cloud 추가 (Tenkan-sen, Kijun-sen, Senkou Span A, Senkou Span B, Chikou Span)
    """

    # 1. 전환선 (Tenkan-sen) 계산: 9일간의 고점과 저점의 평균
    df['Tenkan_sen'] = (df['high'].rolling(window=9).max() + df['low'].rolling(window=9).min()) / 2

    # 2. 기준선 (Kijun-sen) 계산: 26일간의 고점과 저점의 평균
    df['Kijun_sen'] = (df['high'].rolling(window=26).max() + df['low'].rolling(window=26).min()) / 2

    # 3. 선행스팬 1 (Senkou Span A) 계산: 전환선과 기준선의 평균을 26일 앞에 표시
    df['Senkou_Span_A'] = ((df['Tenkan_sen'] + df['Kijun_sen']) / 2).shift(26)

    # 4. 선행스팬 2 (Senkou Span B) 계산: 52일간의 고점과 저점의 평균을 26일 앞에 표시
    df['Senkou_Span_B'] = ((df['high'].rolling(window=52).max() + df['low'].rolling(window=52).min()) / 2).shift(26)

    # 5. 후행스팬 (Chikou Span) 계산: 종가를 26일 뒤로 표시
    df['Chikou_Span'] = df['close'].shift(-26)

    # 6. 이치모쿠 클라우드(Ichimoku Cloud) 계산:
    df['Cloud_Colour'] = np.where(df['Senkou_Span_A']> df['Senkou_Span_B'], 'Bullish', 'Bearish')

    df.replace({np.nan: None}, inplace=True)

    # 필요한 컬럼만 반환
    return df

#=========================================================
# Realtime Calculation
#==========================================================

def calculation_realtime_rsi(df, realtime, period=14):
    real_time_data = pd.DataFrame([realtime])
    df = pd.concat([real_time_data, df], ignore_index=True)

    df['RSI'] = ta.rsi(df['close'], length=period)

    df.replace([np.inf, -np.inf], np.nan, inplace=True)
    df.dropna(inplace=True)

    return df
