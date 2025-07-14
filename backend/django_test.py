import os
import django
import math
from datetime import datetime
from django.db import connection
from django.db.models import F, Window, Case, When, Value, FloatField, Min, Max
from django.db.models.functions import Lag, Lead

# 1. Set the correct settings module path
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'cfghome.settings')

# 2. Setup Django
django.setup()


from polls.models import BookingInfo


def calculate_block(start_time, end_time):
    interval=1
    start_block = math.floor(start_time / interval) * interval

    block_list = []
    idx = 0
    while start_block < end_time:
        start_temp = max(start_time, start_block)
        end_block = start_block + interval
        
        
        end_temp = min(end_block, end_time)

        block_list.append((start_temp, end_temp))
        start_block = end_temp
        idx+=1
        
    return block_list



# raw_data = BookingInfo.objects.values('booking_date', 'start_time_decimal', 'end_time_decimal').distinct().order_by('booking_date', 'start_time_decimal')

court = 1
filter_start_date = '2025-07-01'
filter_end_date = '2025-07-31'

bookings = BookingInfo.objects.filter(
            court=court,
            booking_date__gte = filter_start_date,
            booking_date__lte = filter_end_date
            ).annotate(previous_end_time = Window(expression = Lag('end_time_decimal', default=None), partition_by=[F('court_id'), F('day_of_week')] \
                                                  ,order_by=F('start_time_decimal').asc())) \
            
bookings_within = bookings.annotate(start_time_free = F('previous_end_time'), end_time_free = F('start_time_decimal'))\
                            .values('court_id', 'day_of_week', 'start_time_free', 'end_time_free')\
                            .filter(start_time_free__isnull = False, start_time_free__lt = F('end_time_free'))

bookings_min = bookings.values('court_id', 'day_of_week').annotate(start_time_free=F('court__start_hour'), end_time_free = Min('start_time_decimal'))
bookings_max = bookings.values('court_id', 'day_of_week').annotate(start_time_free = Max('end_time_decimal'), end_time_free=F('court__end_hour'))
combined_free_calendar = bookings_min.union(bookings_within, bookings_max, all=True).order_by('court_id', 'day_of_week', 'start_time_free') \



data = []
for element in combined_free_calendar:
    start_time = float(element['start_time_free'])
    end_time = float(element['end_time_free'])
    list_block = calculate_block(start_time = start_time, end_time = end_time)
    data_frag = {'court_id':element['court_id'], 'day_of_week':element['day_of_week'], 'free_time_block':list_block}
    data.append(data_frag)
    
print(data)
    
    
    
    
    
    
    
    
    
    