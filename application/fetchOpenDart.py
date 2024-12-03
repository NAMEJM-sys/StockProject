import requests
import zipfile
import io
import sys
import xml.etree.ElementTree as ET
import django
import os

# Django settings 환경 설정 (해당 프로젝트의 경로로 설정)
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "stock_website.settings")  # your_project는 Django 프로젝트 이름
django.setup()

from application.models import CorpCode  # CorpCode 모델 import

api_key = '114e272ba88850a6774c8450d500e9b8cd0a12e3'

def fetch_corp_code():

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

        # stock_code가 있는 데이터만 추출하여 리스트로 저장
        corp_list = []
        for corp in root.findall('./list'):
            corp_code = corp.find('corp_code').text
            corp_name = corp.find('corp_name').text
            stock_code = corp.find('stock_code').text

            # stock_code가 비어있지 않은 경우에만 리스트에 추가
            if stock_code.strip():  # 공백 제거 후 비어있지 않은 경우만 처리
                corp_list.append({
                    'corp_code': corp_code,
                    'corp_name': corp_name,
                    'stock_code': stock_code
                })

        # stock_code를 기준으로 문자열 오름차순 정렬
        corp_list.sort(key=lambda x: x['stock_code'])

        # 정렬된 데이터를 DB에 저장
        for corp in corp_list:
            CorpCode.objects.update_or_create(
                corp_code=corp['corp_code'],
                defaults={'corp_name': corp['corp_name'], 'stock_code': corp['stock_code']}
            )
            print(f"Saved: {corp['corp_name']} - {corp['stock_code']}")

    except requests.exceptions.HTTPError as errh:
        print(f"HTTP Error: {errh}")
    except requests.exceptions.ConnectionError as errc:
        print(f"Error Connecting: {errc}")
    except requests.exceptions.Timeout as errt:
        print(f"Timeout Error: {errt}")
    except requests.exceptions.RequestException as err:
        print(f"Something went wrong: {err}")
    except zipfile.BadZipFile as e:
        print(f"Bad Zip File: {e}")
    except ET.ParseError as e:
        print(f"XML Parse Error: {e}")

if __name__ == "__main__":
    fetch_corp_code()