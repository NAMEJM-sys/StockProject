from django.db import models


class StockData(models.Model):
    date = models.DateField()
    stock_code = models.CharField(max_length=10)
    close = models.IntegerField()
    volume = models.IntegerField()
    high = models.IntegerField(default=0)
    low = models.IntegerField(default=0)
    open = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.stock_code} - {self.date}"


class StockList(models.Model):
    code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


class FinancialStatement(models.Model):
    # 기업 코드
    corp_code = models.CharField(max_length=20, null=True, unique=True)
    stock_code = models.CharField(max_length=10, null=True, unique=True)

    # 손익계산서
    net_income = models.CharField(max_length=30,null=True, blank=True)  # 당기순이익(손실)
    operating_income = models.CharField(max_length=30,null=True, blank=True)  # 영업이익
    revenue = models.CharField(max_length=30,null=True, blank=True)  # 영업수익
    cost_of_goods_sold = models.CharField(max_length=30,null=True, blank=True)  # 매출원가

    # 재무상태표
    total_equity = models.CharField(max_length=30,null=True, blank=True)  # 자본총계
    total_assets = models.CharField(max_length=30,null=True, blank=True)  # 자산총계
    current_assets = models.CharField(max_length=30,null=True, blank=True)  # 유동자산
    current_liabilities = models.CharField(max_length=30,null=True, blank=True)  # 유동부채
    cash_and_cash_equivalents = models.CharField(max_length=30,null=True, blank=True)  # 현금및현금성자산
    accounts_receivable = models.CharField(max_length=30,null=True, blank=True)  # 매출채권
    total_liabilities = models.CharField(max_length=30,null=True, blank=True)  # 총부채
    inventory = models.CharField(max_length=30,null=True, blank=True)  # 재고자산

    # 현금흐름표
    interest_expense = models.CharField(max_length=30,null=True, blank=True)  # 이자의 지급
    stock_times = models.CharField(max_length=30,null=True, blank=True) # 발행 주식 합계

    def __str__(self):
        return f"FinancialStatement for {self.fiscal_year}"


class CorpCode(models.Model):
    corp_code = models.CharField(max_length=20, unique=True)
    corp_name = models.CharField(max_length=255)
    stock_code = models.CharField(max_length=20, null=True, blank=True)

    def __str__(self):
        return self.corp_name