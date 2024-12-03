from rest_framework import serializers
from django.contrib.auth.models import User
from .models import StockData, StockList

class StockDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockData
        fields = '__all__'

class StockListSerializer(serializers.ModelSerializer):
    class Meta:
        model = StockList
        fields = '__all__'

class UserDataSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)  # 비밀번호는 write-only로 설정

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user
