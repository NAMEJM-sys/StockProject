# Generated by Django 4.2.15 on 2024-08-20 05:09

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('application', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='stockdata',
            name='stock_name',
        ),
    ]