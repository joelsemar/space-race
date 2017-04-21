# -*- coding: utf-8 -*-
# Generated by Django 1.10 on 2017-04-20 18:46
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0008_auto_20170305_0221'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='player',
            name='creator',
        ),
        migrations.AlterField(
            model_name='game',
            name='end_time',
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
        migrations.AlterField(
            model_name='game',
            name='start_time',
            field=models.DateTimeField(blank=True, default=None, null=True),
        ),
    ]