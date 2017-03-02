# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-03-02 20:06
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0005_auto_20170301_1522'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='expired',
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name='player',
            name='game',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to='main.Game'),
        ),
    ]
