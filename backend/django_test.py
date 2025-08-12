import os
import django
import math
from datetime import datetime
from django.db import connection
from django.db.models import F, Window, Case, When, Value, FloatField, Min, Max
from django.db.models.functions import Lag, Lead
from polls.utils.time_manage import calculate_block_new

from collections import defaultdict
from functools import reduce
from polls.utils.time_manage import find_free_slots_new, merge_intervals

# 1. Set the correct settings module path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cfghome.settings')

# 2. Setup Django
django.setup()


from polls.models import *




start_date_str = '2025-07-01'
end_date_str = '2025-07-15'

courts = CourtInfo.objects.all()
bookings = BookingInfo.objects.filter(booking_date__gte = start_date_str,booking_date__lte = end_date_str).select_related('court')\

booked_slots = defaultdict(list) 
booked_details = defaultdict(list)  
for booking in bookings:
    time_interval = (float(booking.start_time_decimal), float(booking.end_time_decimal))
    booked_slots[(booking.day_of_week, booking.court_id)].append(time_interval)
    
    booked_details[(booking.day_of_week, booking.court_id)].append({
        'booking_id': float(booking.id),
        'play_date': booking.booking_date,
        'start_time': float(booking.start_time_decimal),
        'end_time': float(booking.end_time_decimal),
        'customer_id': booking.customer_num
    })



list_dow = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8']
total_slots = []
for dow in list_dow:
    for court in courts:
        booked_list = booked_slots.get((dow,court.id),[])
        start_time = float(court.start_hour)
        end_time = float(court.end_hour)
        merge_slots = merge_intervals(booked_list)
        free_slot = find_free_slots_new(start_time, end_time, booked_list)
        
        total_slots.append({
            "court_id": court.id,
            "dow": dow,
            "booked_slot":booked_details[(dow,court.id)],
            "free_slot": free_slot,
            })


