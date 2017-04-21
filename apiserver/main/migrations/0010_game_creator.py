# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-04-20 18:46
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0009_auto_20170420_1846'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='creator',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='created_game', to='main.Player'),
            preserve_default=False,
        ),
    ]