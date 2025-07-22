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

# 1. Set the correct settings module path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cfghome.settings')

# 2. Setup Django
django.setup()


from polls.models import *




start_date_str = '2025-07-01'
end_date_str = '2025-07-10'

courts = CourtInfo.objects.all()
bookings = BookingInfo.objects.filter(
            booking_date__gte = start_date_str,
            booking_date__lte = end_date_str
            ).select_related('court')\


list_dow = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8']

booked_slots = defaultdict(list) 
booked_details = defaultdict(list)  
for booking in bookings:
    time_interval = (float(booking.start_time_decimal), float(booking.end_time_decimal))
    booked_slots[(booking.day_of_week, booking.court_id)].append(time_interval)

# print(booked_slots)

### Check overlap first --> If overlapped ---> min/max, else append non-overlapped

def check_overlap(a,b):
    if a[0] < b[1] and a[1] > b[0]:
        return True
    return False

list_ = []
def find_max(accumulator, current_value):
    if check_overlap(accumulator, current_value):
        start_temp = min(accumulator[0], current_value[0])
        end_temp = max(accumulator[1], current_value[1])
        accumulator = (start_temp, end_temp)

    else:
        list_.append(accumulator)
        
    

    return accumulator
    

test_array = [(7,8), (7,9),(7,10),(7.5,12), (15,18)]


data = reduce(find_max, test_array)
print(data)

print(list_)




