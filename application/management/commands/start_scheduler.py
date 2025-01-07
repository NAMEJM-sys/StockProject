# from django.core.management.base import BaseCommand
# from django.core.cache import caches
# from application.calculcationView import compute_top_20
# import schedule
# import time
#
# class Command(BaseCommand):
#     help = '캐시된 주식 점수 업데이트'
#
#     def handle(self, *args, **kwargs):
#         def cache_stock_scores():
#             print("Starting cache update for stock scores.")
#             data = compute_top_20()
#             recommendation_cache = caches['recommendation_cache']  # db=2 캐시 사용
#             recommendation_cache.set('top_5_scores_cache', data, timeout=86400)
#             print("Stock scores cached successfully.")
#
#         # 캐시 업데이트 즉시 실행
#         cache_stock_scores()
#
#         # 스케줄 설정
#         schedule.every().day.at("16:00").do(cache_stock_scores)
#
#         while True:
#             schedule.run_pending()
#             time.sleep(1)
