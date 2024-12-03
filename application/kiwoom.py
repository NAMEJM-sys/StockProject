import os
import sys
import time
from datetime import datetime

import django
import redis
from PyQt5.QAxContainer import *
from PyQt5.QtCore import QEventLoop, QTimer
from PyQt5.QtWidgets import QApplication

sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "stock_website.settings")
django.setup()

from application.models import StockData, StockList

redis_client_login = redis.StrictRedis(host='127.0.0.1', port=6379, db=3)

def save_stock_data(date, stock_code, close, high, low, open, volume):
    StockData.objects.update_or_create(
        date=date,
        stock_code=stock_code,
        defaults={
            'close': close,
            'high': high,
            'low': low,
            'open': open,
            'volume': volume,
        }
    )

def save_stock_list(stock_code, stock_name):
    StockList.objects.update_or_create(
        code=stock_code,
        defaults={
            'name': stock_name,
        }
    )

class KiwoomAPI:
    def __init__(self):
        self.kiwoom = QAxWidget("KHOPENAPI.KHOpenAPICtrl.1")
        self.kiwoom.OnEventConnect.connect(self._on_login)
        self.kiwoom.OnReceiveTrData.connect(self._on_receive_tr_data)

        self.login_event_loop = QEventLoop()
        self.data_event_loop = None
        self.data = []
        self.continue_data_request = False

    def login(self):
        is_connected = self.kiwoom.dynamicCall("GetConnectState()")  # 세션 상태 확인
        if is_connected == 1:
            print("이미 로그인된 세션을 사용합니다.")
        else:
            print("로그인 시도 중...")
            self.kiwoom.dynamicCall("CommConnect()")
            self.login_event_loop.exec_()

    def _on_login(self, err_code):
        if err_code == 0:
            print("로그인 성공")
        else:
            print("로그인 실패, 오류 코드:", err_code)
            sys.exit(1)
        self.login_event_loop.exit()

    def get_stock_data(self, stock_code, start_date=None, count=10):
        self.data_event_loop = QEventLoop()
        self.data = []
        self.continue_data_request = True
        self.stock_code = stock_code
        self.request_count = count
        self.requested_count = 0

        if start_date:
            self.kiwoom.dynamicCall("SetInputValue(QString, QString)", "기준일자", start_date)
        else:
            self.kiwoom.dynamicCall("SetInputValue(QString, QString)", "기준일자", "")

        self.kiwoom.dynamicCall("SetInputValue(QString, QString)", "종목코드", stock_code)
        self.kiwoom.dynamicCall("SetInputValue(QString, QString)", "수정주가구분", "1")
        self.kiwoom.dynamicCall("CommRqData(QString, QString, int, QString)", "opt10081_req", "opt10081", 0, "0101")

        self.data_event_loop.exec_()

    def _on_receive_tr_data(self, screen_no, rqname, trcode, recordname, prev_next, data_len, err_code, msg1, msg2):
        if rqname == "opt10081_req":
            try:
                rows = self.kiwoom.dynamicCall("GetRepeatCnt(QString, QString)", trcode, rqname)
                for i in range(rows):
                    date = self.kiwoom.dynamicCall("GetCommData(QString, QString, int, QString)", trcode, rqname, i, "일자").strip()
                    close = self.kiwoom.dynamicCall("GetCommData(QString, QString, int, QString)", trcode, rqname, i, "현재가").strip()
                    high = self.kiwoom.dynamicCall("GetCommData(QString, QString, int, QString)", trcode, rqname, i, "고가").strip()
                    low = self.kiwoom.dynamicCall("GetCommData(QString, QString, int, QString)", trcode, rqname, i, "저가").strip()
                    open = self.kiwoom.dynamicCall("GetCommData(QString, QString, int, QString)", trcode, rqname, i, "시가").strip()
                    volume = self.kiwoom.dynamicCall("GetCommData(QString, QString, int, QString)", trcode, rqname, i, "거래량").strip()

                    save_stock_data(
                        date=datetime.strptime(date, "%Y%m%d").strftime("%Y-%m-%d"),
                        stock_code=self.stock_code,
                        close=int(close.replace('+', '').replace('-', '')),
                        high=int(high.replace('+', '').replace('-', '')),
                        low=int(low.replace('+', '').replace('-', '')),
                        open=int(open.replace('+', '').replace('-', '')),
                        volume=int(volume)
                    )

                    self.data.append((date, self.stock_code, close, volume, high, low, open))
                    self.requested_count += 1

                    if self.requested_count >= self.request_count:
                        self.continue_data_request = False
                        break

                if prev_next == "2" and self.continue_data_request:
                    self.kiwoom.dynamicCall("CommRqData(QString, QString, int, QString)", "opt10081_req", "opt10081", 2, "0101")
                else:
                    self.data_event_loop.exit()
            except Exception as e:
                print(f"Error during data retrieval: {str(e)}")
                self.continue_data_request = False
                self.data_event_loop.exit()

        if not self.continue_data_request:
            for item in self.data:
                print(f"일자: {item[0]}, 종목코드: {item[1]}, 종가: {item[2]}, 고가: {item[4]}, 저가: {item[5]}, 시가: {item[6]}, 거래량: {item[3]}")
            self.data_event_loop.exit()

    def GetCodeListByMarket(self, market):
        codeList = self.kiwoom.dynamicCall("GetCodeListByMarket(QString)", market)
        return codeList

    def GetMasterCodeName(self, code):
        code_name = self.kiwoom.dynamicCall("GetMasterCodeName(QString)", code)
        return code_name

    def save_kospi_stocks_to_db(self):
        kospi_codes = self.GetCodeListByMarket('0').split(';')

        for code in kospi_codes:
            if code:
                stock_name = self.GetMasterCodeName(code)
                save_stock_list(stock_code=code, stock_name=stock_name)

        print("KOSPI 종목 리스트가 DB에 저장되었습니다.")

def fetch_data():
    kospi = kiwoom.GetCodeListByMarket('0').split(';')
    kospi = [code for code in kospi if code]

    print("Running KiwoomAPI to fetch stock data...")
    for batch_start in range(0, len(kospi), 10):
        batch_end = batch_start + 10
        batch_codes = kospi[batch_start:batch_end]

        for code in batch_codes:
            if code < '236350':
                kiwoom.get_stock_data(code, count=5)
                time.sleep(0.5)
        time.sleep(2.0)

    print("API 호출 완료. 1시간 뒤에 다시 실행합니다.")

if __name__ == "__main__":
    app = QApplication(sys.argv)

    kiwoom = KiwoomAPI()
    kiwoom.login()

    kiwoom.save_kospi_stocks_to_db()

    fetch_data()

    timer = QTimer()
    timer.timeout.connect(fetch_data)
    timer.start(3600 * 1000)  # 3600 seconds * 1000 milliseconds = 1 hour

    # Execute the application event loop
    sys.exit(app.exec_())