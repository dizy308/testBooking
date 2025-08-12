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
from polls.utils.time_manage import find_free_slots_new, merge_intervals, get_days_of_week_between

# 1. Set the correct settings module path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cfghome.settings')

# 2. Setup Django
django.setup()
from polls.models import *



start_date_str = '2025-08-01'
end_date_str = '2025-08-01'



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


list_dow = get_days_of_week_between(start_date_str, end_date_str)
total_slots = []
for dow in list_dow:
    for court in courts:
        booked_list = booked_slots.get((dow,court.id),[])
        start_time = float(court.start_hour)
        end_time = float(court.end_hour)
        merged_slots = merge_intervals(booked_list)
        free_slots = find_free_slots_new(start_time, end_time, booked_list)
        
        current_bookings = booked_details[(dow, court.id)]
        for slot in merged_slots:
            start_slot = slot[0]
            end_slot = slot[1]
            for b in booked_details[(dow,court.id)]:
                if max(b['start_time'], start_slot) <= min(end_slot, b['end_time']):
                    b['merged_slots'] = (start_slot, end_slot)

        total_slots.append({
            "court_id": court.id,
            "day_of_week": dow,
            "booked_slots":booked_details[(dow,court.id)],
            "merged_slots":merged_slots,
            "free_slots": free_slots,
            })


for value in total_slots:
    print(value['booked_slots'])
