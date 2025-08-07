from rest_framework import serializers
from .models import Question, BookingInfo, CourtInfo
from .utils.time_manage import *

class QuestionSerializer(serializers.ModelSerializer):
    # actual_date = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = [f.name for f in model._meta.fields] 
                # + ['actual_date']

    def validate(self, data):
        startDate = data.get('start_date_play')
        endDate = data.get('end_date_play')
        
        
        if startDate > endDate:
            raise serializers.ValidationError({"errors": "End Date is less than Start Date!!!", "message":"invalid_date_range"})
        else:
            conflicting_bookings = Question.objects.filter(start_date_play__lte=endDate,end_date_play__gte=startDate)
            if self.instance:
                conflicting_bookings = conflicting_bookings.exclude(pk=self.instance.pk)
                
            if conflicting_bookings.exists():
                raise serializers.ValidationError({"errors": "This session is already booked", "message":"invalid_date_range"})
            
        return data


class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingInfo
        fields = [f.name for f in model._meta.fields] 


class BookingListSerializer(serializers.ModelSerializer):
    courtName = serializers.SerializerMethodField()
    class Meta:
        model = BookingInfo
        fields = ['id', 'booking_date','customer_num', 'start_time_decimal','end_time_decimal', 'courtName'] 
        
    def get_courtName(self, data):
        return 'court_' + str(data.court_id)




class CourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtInfo
        fields = [f.name for f in model._meta.fields] 
        
        

class FreeTimeSlotSerializer(serializers.Serializer):
    court_id = serializers.IntegerField()
    booked_slot = serializers.ListField()
    free_slot = serializers.ListField()
    
    
class FreeTimeSlotIntervalSerializer(serializers.Serializer):
    court_id = serializers.IntegerField()
    day_of_week = serializers.CharField()
    booked_slots = serializers.ListField()
    merged_slots = serializers.ListField()
    free_slots = serializers.ListField()


