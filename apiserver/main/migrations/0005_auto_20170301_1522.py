# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-03-01 15:22
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0004_auto_20170301_0416'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='ready',
            field=models.BooleanField(default=False),
        ),
    ]
