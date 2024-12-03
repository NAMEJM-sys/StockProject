import requests
import sys
import django
import os

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "stock_website.settings")  # your_project는 Django 프로젝트 이름
django.setup()

from application.models import CorpCode
from application.models import FinancialStatement

API_KEY = '114e272ba88850a6774c8450d500e9b8cd0a12e3'

def fetch_total_financeStatement():
    """
    corp_code에 해당하는 데이터를 가져와 FinancialStatement DB에 저장하는 함수
    """
    # 모든 corp_code를 가져옴 (CorpCode 테이블에 저장된 기업들)
    corp_codes = CorpCode.objects.filter(stock_code__lte="304100", stock_code ="000070")

    # 각 corp_code에 대한 데이터를 가져와서 저장
    for corp in corp_codes:
        corp_code = corp.corp_code  # 각 기업의 corp_code
        stock_code = corp.stock_code

        # 1. select_stock_times로부터 profit_incnr 값 가져오기
        stock_times_data = select_stock_times(corp_code)
        stock_times = stock_times_data.get('istc_totqy')

        # 2. select_financeStatement로부터 재무 데이터를 가져오기
        finance_data = select_financeStatement(corp_code)

        # 3. FinancialStatement DB에 저장 (각 corp_code에 대한 재무 정보 저장)
        if finance_data.get('total_equity') is not None:
            # FinancialStatement DB에 저장 (각 corp_code에 대한 재무 정보 저장)
            FinancialStatement.objects.update_or_create(
                corp_code=corp_code,
                defaults={
                    'net_income': finance_data.get('net_income'),
                    'operating_income': finance_data.get('operating_income'),
                    'revenue': finance_data.get('revenue'),
                    'cost_of_goods_sold': finance_data.get('cost_of_goods_sold'),
                    'total_equity': finance_data.get('total_equity'),
                    'total_assets': finance_data.get('total_assets'),
                    'current_assets': finance_data.get('current_assets'),
                    'current_liabilities': finance_data.get('current_liabilities'),
                    'cash_and_cash_equivalents': finance_data.get('cash_and_cash_equivalents'),
                    'accounts_receivable': finance_data.get('accounts_receivable'),
                    'total_liabilities': finance_data.get('total_liabilities'),
                    'interest_expense': finance_data.get('interest_expense'),
                    'inventory': finance_data.get('inventory'),
                    'stock_times': stock_times,  # 추가: stock_times 데이터에서 가져온 값
                    'corp_code': corp_code,
                    'stock_code': stock_code,
                }
            )

        print(f"Financial statement for {corp_code} has been saved or updated.")

def select_stock_times(corp_code):
    """
    첫 번째 API 호출: corp_code에 해당하는 데이터를 반환
    """
    url = 'https://opendart.fss.or.kr/api/stockTotqySttus.json'
    params = {
        'crtfc_key': API_KEY,  # 전역 변수로 설정된 API 키 사용
        'corp_code': corp_code,  # 요청에서 전달된 corp_code 사용
        'bsns_year': '2023',
        'reprt_code': '11011',
    }

    response = requests.get(url, params=params)
    response.raise_for_status()
    data = response.json()

    if 'list' in data:
        for item in data['list']:
            print(f"Item: {item}")  # 각 항목 출력해보기

            # '합계'인 항목 확인
            if item['se'] == '합계':
                istc_totqy = item.get('istc_totqy', None)

                # 'profit_incnr' 값이 '-'인 경우 처리
                if istc_totqy and istc_totqy != '-':
                    return {'istc_totqy': istc_totqy}

    return {'error': 'No valid data found for 합계 or profit_incnr'}

def select_financeStatement(corp_code):
    """
    두 번째 API 호출: corp_code에 해당하는 재무 데이터를 반환
    """
    url = 'https://opendart.fss.or.kr/api/fnlttSinglAcntAll.json'
    params = {
        'crtfc_key': API_KEY,  # 전역 변수로 설정된 API 키 사용
        'corp_code': corp_code,  # 요청에서 전달된 corp_code 사용
        'bsns_year': '2023',
        'reprt_code': '11011',
        'fs_div': 'OFS',
    }

    try:
        response = requests.get(url, params=params)
        response.raise_for_status()  # HTTP 에러 발생 시 예외 발생
        data = response.json()

        if 'list' not in data or not data['list']:
            print(f"재무 데이터 없음: {corp_code}")
            return {}  # 빈 딕셔너리 반환

        # 필요한 값들을 저장할 변수를 미리 None으로 초기화
        net_income = operating_income = revenue = cost_of_goods_sold = None
        total_equity = total_assets = current_assets = current_liabilities = None
        cash_and_cash_equivalents = accounts_receivable = total_liabilities = interest_expense = inventory = None

        # 'list' 키가 있는지 확인 후 반복문 실행
        if 'list' in data:
            for item in data['list']:
                nm_value = item.get('account_nm')
                sj_value = item.get('sj_nm')
                if nm_value == "당기순이익(손실)" and sj_value == "포괄손익계산서":
                    net_income = item.get('thstrm_amount')
                elif nm_value == "영업이익" and sj_value == "손익계산서":
                    operating_income = item.get('thstrm_amount')
                elif nm_value == "영업수익" and sj_value == "손익계산서":
                    revenue = item.get('thstrm_amount')
                elif nm_value == "매출원가" and sj_value == "손익계산서":
                    cost_of_goods_sold = item.get('thstrm_amount')
                elif nm_value == "자본총계" and sj_value == "재무상태표":
                    total_equity = item.get('thstrm_amount')
                elif nm_value == "자산총계" and sj_value == "재무상태표":
                    total_assets = item.get('thstrm_amount')
                elif nm_value == "유동자산" and sj_value == "재무상태표" or nm_value == "현금및현금성자산" and sj_value == "재무상태표":
                    current_assets = item.get('thstrm_amount')
                elif nm_value == "유동부채" and sj_value == "재무상태표":
                    current_liabilities = item.get('thstrm_amount')
                elif nm_value == "현금및현금성자산" and sj_value == "재무상태표":
                    cash_and_cash_equivalents = item.get('thstrm_amount')
                elif (nm_value == "매출채권" and sj_value == "재무상태표") or (nm_value == "매출채권" and sj_value == "재무상태표"):
                    accounts_receivable = item.get('thstrm_amount')
                elif nm_value == "부채총계" and sj_value == "재무상태표":
                    total_liabilities = item.get('thstrm_amount')
                elif nm_value == "이자의 지급" and sj_value == "현금흐름표" or nm_value == "이자 지급액" and sj_value == "현금흐름표":
                    interest_expense = item.get('thstrm_amount')
                elif nm_value == "재고자산" and sj_value == "재무상태표":
                    inventory = item.get('thstrm_amount')  # 재고 자산

        # 추출된 값 반환
        return {
            'net_income': net_income,
            'operating_income': operating_income,
            'revenue': revenue,
            'cost_of_goods_sold': cost_of_goods_sold,
            'total_equity': total_equity,
            'total_assets': total_assets,
            'current_assets': current_assets,
            'current_liabilities': current_liabilities,
            'cash_and_cash_equivalents': cash_and_cash_equivalents,
            'accounts_receivable': accounts_receivable,
            'total_liabilities': total_liabilities,
            'interest_expense': interest_expense,
            'inventory': inventory
        }

    except requests.exceptions.HTTPError as errh:
        print(f"HTTP Error: {errh}")
    except requests.exceptions.ConnectionError as errc:
        print(f"Error Connecting: {errc}")
    except requests.exceptions.Timeout as errt:
        print(f"Timeout Error: {errt}")
    except requests.exceptions.RequestException as err:
        print(f"Something went wrong: {err}")


if __name__ == "__main__":
    fetch_total_financeStatement()