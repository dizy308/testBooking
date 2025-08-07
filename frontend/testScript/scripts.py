from datetime import date, datetime
import numpy as np

start_date_str = '2025-08-01'
start_date = datetime.strptime(start_date_str,"%Y-%m-%d").date()
end_date_str = '2025-08-05'
end_date = datetime.strptime(end_date_str,"%Y-%m-%d").date()


def get_days_of_week_between(start_date, end_date):
    list_weekdays = []
    days = np.arange(np.datetime64(start_date), np.datetime64(end_date) + 1).astype('datetime64[D]')
    weekdays = (days.astype('datetime64[D]').view('int64') - 4) % 7
    for value in weekdays:
        list_weekdays.append(f'T{value+2}')
        
    return sorted(list_weekdays)

result_ = get_days_of_week_between(start_date, end_date)
print(result_)