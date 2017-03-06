# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-03-05 02:21
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0007_auto_20170303_1710'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='density',
            field=models.PositiveIntegerField(default=5),
        ),
        migrations.AddField(
            model_name='game',
            name='num_bots',
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name='game',
            name='size',
            field=models.PositiveIntegerField(default=3500),
        ),
    ]
