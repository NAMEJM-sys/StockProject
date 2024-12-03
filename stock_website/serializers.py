from rest_framework import serializers, viewsets
from application.models import StockData


class StockDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockData
        fields = '__all__'


class StockDataViewSet(viewsets.ModelViewSet):
    queryset = StockData.objects.all()
    serializer_class = StockDataSerializer