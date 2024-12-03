# Generated by Django 4.2.15 on 2024-10-11 05:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('application', '0004_rename_stock_stocklist'),
    ]

    operations = [
        migrations.CreateModel(
            name='FinancialStatement',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('net_income', models.BigIntegerField(blank=True, null=True)),
                ('operating_income', models.BigIntegerField(blank=True, null=True)),
                ('revenue', models.BigIntegerField(blank=True, null=True)),
                ('cost_of_goods_sold', models.BigIntegerField(blank=True, null=True)),
                ('total_equity', models.BigIntegerField(blank=True, null=True)),
                ('total_assets', models.BigIntegerField(blank=True, null=True)),
                ('current_assets', models.BigIntegerField(blank=True, null=True)),
                ('current_liabilities', models.BigIntegerField(blank=True, null=True)),
                ('cash_and_cash_equivalents', models.BigIntegerField(blank=True, null=True)),
                ('accounts_receivable', models.BigIntegerField(blank=True, null=True)),
                ('total_liabilities', models.BigIntegerField(blank=True, null=True)),
                ('inventory', models.BigIntegerField(blank=True, null=True)),
                ('interest_expense', models.BigIntegerField(blank=True, null=True)),
                ('average_inventory', models.BigIntegerField(blank=True, null=True)),
                ('fiscal_year', models.CharField(max_length=10)),
                ('stock_times', models.BigIntegerField(blank=True, default=0, null=True)),
            ],
        ),
    ]
