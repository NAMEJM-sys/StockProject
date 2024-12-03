import sys
import json
import redis
import threading
from datetime import datetime
from PyQt5.QAxContainer import QAxWidget
from PyQt5.QtWidgets import QApplication

real_time_data_storage = {}
redis_home_realtime_by_volume = redis.StrictRedis(host='127.0.0.1', port=6379, db=1)
redis_post_home_realtime_by_volume = redis.StrictRedis(host='127.0.0.1', port=6379, db=2)


class KiwoomRealtimeApp:
    def __init__(self):
        print("실행")
        self.app = QApplication(sys.argv)
        self.kiwoom = QAxWidget("KHOPENAPI.KHOpenAPICtrl.1")

        if not self.kiwoom:
            print("QAxWidget 초기화 실패")
            sys.exit()

        self.kiwoom.OnEventConnect.connect(self.on_login)
        self.kiwoom.OnReceiveRealData.connect(self.OnReceiveRealData)
        self.login()


    def login(self):
        try:
            self.kiwoom.dynamicCall("CommConnect()")
        except Exception as e:
            print(f"로그인 시도 중 예외 발생: {e}")
            sys.exit()

    def on_login(self, err_code):
        if err_code == 0:
            print("로그인 성공")
            self.register_real_time_data()
        else:
            print(f"로그인 실패, 에러 코드: {err_code}")
            sys.exit()

    def register_real_time_data(self):
        print("실시간 데이터 등록 중...")
        home_realtime_by_volume_code = redis_home_realtime_by_volume.keys()
        for stock_code in home_realtime_by_volume_code:
            stock_code_str = stock_code.decode('utf-8')  # 바이트 문자열을 일반 문자열로 변환
            self.set_real_time_reg(stock_code_str)

    def set_real_time_reg(self, stock_code):
        try:
            print(f"{stock_code} 구독 진행을 위한 API 요청 완료")
            self.kiwoom.dynamicCall("SetRealReg(QString, QString, QString, QString)", "0001", stock_code,
                                    "10;11;12;13;16;17;18", "1")
        except Exception as e:
            print(f"실시간 구독 등록 실패: {e}")

    def OnReceiveRealData(self, stock_code, real_type, real_data):
        print(f"{stock_code}코드의 실시간 구도 타입 {real_type} 진행")
        if real_type == "주식체결":

            current_price = str(self.kiwoom.dynamicCall("GetCommRealData(QString, int)", stock_code, 10))  # 현재가
            onday = str(self.kiwoom.dynamicCall("GetCommRealData(QString, int)", stock_code, 11))  # 전일대비
            ratio = str(self.kiwoom.dynamicCall("GetCommRealData(QString, int)", stock_code, 12))  # 등락율
            high_price = str(self.kiwoom.dynamicCall("GetCommRealData(QString, int)", stock_code, 17))  # 고가
            low_price = str(self.kiwoom.dynamicCall("GetCommRealData(QString, int)", stock_code, 18))  # 저가
            open_price = str(self.kiwoom.dynamicCall("GetCommRealData(QString, int)", stock_code, 16))  # 시가
            volume = str(self.kiwoom.dynamicCall("GetCommRealData(QString, int)", stock_code, 13))  # 거래량

            # 메모리 내 저장
            stock_data = {
                "current_price": current_price,
                "volume": volume,
                "onday": onday,
                "ratio": ratio,
                "high_price": high_price,
                "low_price": low_price,
                "open_price": open_price,
                "timestamp": datetime.now().strftime('%Y-%m-%d')
            }
            redis_post_home_realtime_by_volume.set(stock_code, json.dumps(stock_data))  # Redis에 저장
            redis_post_home_realtime_by_volume.expire(stock_code, 86400)  # 1일(24시간) 동안 데이터 유지