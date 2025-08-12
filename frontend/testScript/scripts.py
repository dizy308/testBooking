from datetime import date, datetime, timedelta
import numpy as np

start_date_str = '2025-08-01'
start_date = datetime.strptime(start_date_str,"%Y-%m-%d").date()
end_date_str = '2025-08-31'
end_date = datetime.strptime(end_date_str,"%Y-%m-%d").date()


##------------------------------------------------------------------##

def generate_list_dates(start_date, end_date, selected_dow):
    current_date = start_date
    list_days = []
    while current_date <= end_date:
        current_dow = f'T{current_date.weekday() + 2}'
        if current_dow == selected_dow:
            list_days.append(current_date.strftime('%Y-%m-%d'))
            
        current_date = current_date + timedelta(days = 1)
    
    return list_days
    
result_ = generate_list_dates(start_date, end_date, 'T6')
print(result_)


    