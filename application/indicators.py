import pandas as pd
from application.models import StockData
from .utils import calculate_rsi, calculate_macd


def rsi_from_db(stock_code, period=14):
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return None

    df = pd.DataFrame(list(stock_data.values('date','close')))
    df = calculate_rsi(df, period=period)

    today_df = df.iloc[-1]

    print(df.head())

    return df, today_df


def find_local_extrema(series):
    local_min = (series.shift(1) > series) & (series.shift(-1) > series)
    local_max = (series.shift(1) < series) & (series.shift(-1) < series)
    return local_min, local_max


def detect_rsi_divergence(df):
    df = calculate_rsi(df)

    # Calculate local minima and maxima
    price_min, price_max = find_local_extrema(df['close'])
    rsi_min, rsi_max = find_local_extrema(df['RSI'])

    bullish_divergence = []
    bearish_divergence = []

    for i in range(1, len(df)):
        # 강세 다이버전스: 두 저점이 있어야 하며, 가격 저점은 낮아지지만 RSI 저점은 높아짐
        if price_min[i] and rsi_max[i]:  # 두 번째 저점 감지
            last_min = df.iloc[:i].loc[price_min[:i]].tail(1)
            last_rsi_min = df.iloc[:i].loc[rsi_max[:i]].tail(1)

            if len(last_min) > 0 and len(last_rsi_min) > 0:
                if df['close'][i] < last_min['close'].values[0] and df['RSI'][i] > last_rsi_min['RSI'].values[0]:
                    bullish_divergence.append(i)
                else:
                    bullish_divergence.append(None)
            else:
                bullish_divergence.append(None)
        else:
            bullish_divergence.append(None)

        # 약세 다이버전스: 두 고점이 있어야 하며, 가격 고점은 높아지지만 RSI 고점은 낮아짐
        if price_max[i] and rsi_min[i]:  # 두 번째 고점 감지
            last_max = df.iloc[:i].loc[price_max[:i]].tail(1)
            last_rsi_max = df.iloc[:i].loc[rsi_min[:i]].tail(1)

            if len(last_max) > 0 and len(last_rsi_max) > 0:
                if df['close'][i] > last_max['close'].values[0] and df['RSI'][i] < last_rsi_max['RSI'].values[0]:
                    bearish_divergence.append(i)
                else:
                    bearish_divergence.append(None)
            else:
                bearish_divergence.append(None)
        else:
            bearish_divergence.append(None)

    df['Bullish Divergence'] = pd.Series(bullish_divergence, index=df.index)
    df['Bearish Divergence'] = pd.Series(bearish_divergence, index=df.index)

    return df


def analyze_today_rsi_divergence(stock_code):
    df, today_df = rsi_from_db(stock_code)

    if today_df is None:
        return "No Data"

    # 'Bullish Divergence'와 'Bearish Divergence' 열이 존재하는지 확인
    if 'Bullish Divergence' not in today_df or 'Bearish Divergence' not in today_df:
        return "No Divergence"

    if today_df['Bullish Divergence']:
        return "Bullish Divergence"
    elif today_df['Bearish Divergence']:
        return "Bearish Divergence"
    else:
        return "No Divergence"


def analyze_today_rsi_neutral(df):
    # 현재 RSI 값
    current_rsi = df['RSI'].iloc[-1]

    # 중립선 50을 상향 돌파했는지 확인
    rsi_crossed_50_up = (df['RSI'].shift(1) < 50) & (df['RSI'] >= 50)

    # 중립선 50을 하향 돌파했는지 확인
    rsi_crossed_50_down = (df['RSI'].shift(1) > 50) & (df['RSI'] <= 50)

    return {
        "crossed_50_up": rsi_crossed_50_up.iloc[-1] if not rsi_crossed_50_up.empty else False,
        "crossed_50_down": rsi_crossed_50_down.iloc[-1] if not rsi_crossed_50_down.empty else False,
        "current_rsi": current_rsi
    }


def analyze_period_rsi(df, periods=[7, 14, 30]):
    period_averages = {}

    for period in periods:
        period_avg = df['RSI'].tail(period).mean()
        period_averages[f'{period}_day_avg'] = round(period_avg, 1)

    return period_averages


def generate_trade_signal(period_averages, period_trends):
    signal = "No significant trend"

    # 단기적 신호 (7일)
    if period_trends['7_day_trend'] > 5 and period_averages['7_day_avg'] > 50:
        signal = "Strong Buy Signal - RSI is rising rapidly in the short term."
    elif period_trends['7_day_trend'] < -5 and period_averages['7_day_avg'] < 50:
        signal = "Strong Sell Signal - RSI is falling rapidly in the short term."

    # 중기적 신호 (14일)
    elif period_trends['14_day_trend'] > 5 and period_averages['14_day_avg'] > 50:
        signal = "Buy Signal - RSI is consistently rising in the mid-term."
    elif period_trends['14_day_trend'] < -5 and period_averages['14_day_avg'] < 50:
        signal = "Sell Signal - RSI is consistently falling in the mid-term."

    # 장기적 신호 (30일)
    elif period_trends['30_day_trend'] > 5 and period_averages['30_day_avg'] > 50:
        signal = "Long-Term Buy Signal - RSI indicates a prolonged uptrend."
    elif period_trends['30_day_trend'] < -5 and period_averages['30_day_avg'] < 50:
        signal = "Long-Term Sell Signal - RSI indicates a prolonged downtrend."

    return signal


def calculate_rsi_score_advanced(all_rsi, period_averages, divergence_type, neutral_analysis, volatility):
    if all_rsi is None or all_rsi.empty:
        return 0

        # Step 1: 분석 항목별 점수 계산
    # 1. 기간별 RSI 평균 점수
    if period_averages['7_day_avg'] > period_averages['14_day_avg'] > period_averages['30_day_avg']:
        period_score = 10  # 상승 추세가 강함
    elif period_averages['30_day_avg'] > period_averages['14_day_avg'] > period_averages['7_day_avg']:
        period_score = 1  # 하락 추세가 강함
    else:
        period_score = 5  # 중립

    # 2. 다이버전스 점수
    if divergence_type == "Bullish Divergence":
        divergence_score = 8  # 강한 매수 신호
    elif divergence_type == "Bearish Divergence":
        divergence_score = 3  # 강한 매도 신호
    else:
        divergence_score = 5  # 중립

    # 3. 중립선 분석 점수
    if neutral_analysis['crossed_50_up']:
        neutral_score = 7  # 상승 추세 시작 가능성
    elif neutral_analysis['crossed_50_down']:
        neutral_score = 4  # 하락 추세 시작 가능성
    else:
        neutral_score = 5  # 중립

    # 4. 변동성 점수
    if volatility < 5:
        volatility_score = 6  # 낮은 변동성, 중립적 신호
    elif volatility >= 5 and volatility < 10:
        volatility_score = 4  # 변동성이 증가, 주의 필요
    else:
        volatility_score = 2  # 매우 높은 변동성, 높은 리스크

    # Step 2: 최종 점수 계산 (가중 평균)
    # 가중치를 각 분석 항목에 적용하여 최종 점수 계산
    final_score = round((period_score * 0.4) + (divergence_score * 0.3) + (neutral_score * 0.2) + (volatility_score * 0.1))

    return final_score


def macd_from_db(stock_code, fast=12, slow=26, signal=9):
    # DB에서 주식 데이터를 불러옴
    stock_data = StockData.objects.filter(stock_code=stock_code).order_by('date')

    if not stock_data.exists():
        return None

    df = pd.DataFrame(list(stock_data.values('date', 'close')))

    # MACD 계산
    try:
        df = calculate_macd(df, close_column='close', fast=fast, slow=slow, signal=signal)
    except ValueError as e:
        print(f"MACD 계산 오류: {e}")
        return None

    today_df = df.iloc[-1]
    print(df.head())
    print(df.tail())

    return df, today_df

