import datetime
from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone



class Question(models.Model):
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField("date published", auto_now_add=True)
    start_date_play = models.DateField()
    end_date_play = models.DateField()
    def __str__(self):
        return self.question_text
    
    def was_published_recently(self):
        return self.pub_date >= timezone.now() - datetime.timedelta(days=1)



class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)
    
    
## ------------------------------------------------------------------------- ##
    
    
class CourtInfo(models.Model):
    court_name = models.CharField(max_length=100)
    start_hour = models.DecimalField(max_digits=5, decimal_places = 2)
    end_hour = models.DecimalField(max_digits=5, decimal_places = 2)
    
    def clean(self):
        if self.start_hour >= self.end_hour:
            raise ValidationError(
                'End hour must be greater than Opening Hour'
            )
    
    def save(self, *args, **kwargs):
        self.full_clean()  
        super().save(*args, **kwargs)
        
    def __str__(self):
        return self.court_name
    

class BookingInfo(models.Model):
    court = models.ForeignKey(
        CourtInfo, 
        on_delete=models.CASCADE,  
        related_name='bookings')
    
    customer_num = models.CharField(max_length=100)
    booking_date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    
    start_time_decimal = models.DecimalField(max_digits=4, decimal_places=2, editable=False)
    end_time_decimal = models.DecimalField(max_digits=4, decimal_places=2, editable=False)
    day_of_week = models.CharField(max_length=10, editable=False)
    
    # def __str__(self):
    #     return f"Booking for {self.court.court_name} on {self.booking_date}"
    
    def save(self, *args, **kwargs):
        # Auto-calculate decimal times on save
        self.start_time_decimal = self.time_to_decimal(self.start_time)
        self.end_time_decimal = self.time_to_decimal(self.end_time)
        self.day_of_week = self.date_to_weekday(self.booking_date)
        super().save(*args, **kwargs)
    
    def time_to_decimal(self, time_obj):
        return float(time_obj.hour) + float(time_obj.minute) / 60.0
    
    
    def date_to_weekday(self, time_obj):
        return f"T{time_obj.isoweekday() + 1}"