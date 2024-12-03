import threading
import subprocess
from application.kiwoom_realtime_app import KiwoomRealtimeApp
import sys

def start_redis_service():
    # Redis 서버가 실행 중인지 확인
    try:
        status = subprocess.run(['sc', 'query', 'redis-server'], capture_output=True, text=True)
        if "RUNNING" in status.stdout:
            print("Redis 서버가 이미 실행 중입니다.")
        else:
            # Redis 서버가 실행 중이 아니면 시작
            subprocess.run(['sc', 'start', 'redis-server'], check=True)
            print("Redis 서버가 시작되었습니다.")
    except subprocess.CalledProcessError as e:
        print(f"Redis 서버 시작 중 오류 발생: {e}")

def run_django_server():
    # Django 서버를 백그라운드에서 실행
    return subprocess.Popen(['python', 'manage.py', 'runserver', '127.0.0.1:8000'])

def handle_user_input():
    while True:
        user_input = input("종료하려면 'exit' 또는 'quit'을 입력하세요: ").strip().lower()
        if user_input in ['exit', 'quit']:
            print("프로그램을 종료합니다...")
            return  # 입력 대기 종료

if __name__ == "__main__":
    # Redis 서버를 먼저 시작
    start_redis_service()

    # Django 서버를 백그라운드 스레드에서 실행
    django_process = run_django_server()

    # Kiwoom API는 메인 스레드에서 실행
    try:
        kiwoom_app = KiwoomRealtimeApp()  # Kiwoom API 실행
        kiwoom_thread = threading.Thread(target=kiwoom_app.app.exec_)  # Kiwoom API를 백그라운드 스레드에서 실행
        kiwoom_thread.start()

        # 사용자 입력을 기다리면서 종료 신호를 받기
        handle_user_input()

        # Django 서버 중지
        django_process.terminate()  # Django 서버 종료
        print("Django 서버 종료 중...")

        # Kiwoom API 종료
        kiwoom_app.app.quit()  # Kiwoom API 종료
        kiwoom_thread.join()
        print("Kiwoom API 종료 중...")

    except Exception as e:
        print(f"Kiwoom API 실행 중 오류 발생: {e}")

    # 종료 시 Redis 서비스 중지
    try:
        subprocess.run(['sc', 'stop', 'redis-server'], check=True)
        print("Redis 서버 종료 중...")
    except subprocess.CalledProcessError as e:
        print(f"Redis 서버 종료 중 오류 발생: {e}")

    print("프로그램이 종료되었습니다.")