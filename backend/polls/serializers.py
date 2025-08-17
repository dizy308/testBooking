from rest_framework import serializers
from .models import Question, BookingInfo, CourtInfo
from django.db import transaction
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

class CourtSerializer(serializers.ModelSerializer):
    class Meta:
        model = CourtInfo
        fields = [f.name for f in model._meta.fields] 

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingInfo
        fields = [f.name for f in model._meta.fields]
    
    def validate(self, data):
        instance = self.instance
        start_decimal = data['start_time'].hour + data['start_time'].minute / 60
        end_decimal = data['end_time'].hour + data['end_time'].minute / 60

        conflict_query = BookingInfo.objects.filter(
            court=data['court'],
            booking_date=data['booking_date'],
            start_time_decimal__lt=end_decimal,
            end_time_decimal__gt=start_decimal
        )
        if instance is not None:
            conflict_query = conflict_query.exclude(pk=instance.pk)

        conflict_exists = conflict_query.exists()

        if conflict_exists:
            raise serializers.ValidationError(
                f"Conflict: Court {data['court']} is already booked on that time"
            )
        return data

class BookingListSerializer(serializers.ModelSerializer):
    class Meta:
        model = BookingInfo
        fields = [f.name for f in model._meta.fields]       

class FreeTimeSlotSerializer(serializers.Serializer):
    court_id = serializers.IntegerField()
    booked_slot = serializers.ListField()
    free_slot = serializers.ListField()
    
class FreeTimeSlotIntervalSerializer(serializers.Serializer):
    court_id = serializers.IntegerField()
    day_of_week = serializers.CharField()
    booked_slots = serializers.ListField()
    # merged_slots = serializers.ListField()
    free_slots = serializers.ListField()


class SingleBookingSerializer(serializers.Serializer):
    booking_start_date = serializers.DateField()
    booking_end_date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    dow = serializers.CharField()
    court = serializers.IntegerField()

    def validate(self, data):
        if data['booking_start_date'] > data['booking_end_date']:
            raise serializers.ValidationError("End date must be after start date")
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError("End time must be after start time")
        return data

class BulkBookingSerializer(serializers.Serializer):
    def to_internal_value(self, data):
        print(data)
        serializer = SingleBookingSerializer(data=data['bookings'], many=True)
        serializer.is_valid(raise_exception=True)
        return {'bookings': serializer.validated_data}

    def create(self, validated_data):
        bookings_data = validated_data['bookings']  # Extract the list from the dict
        created_bookings = []
        conflict_dates = []
        
        with transaction.atomic():
            for booking in bookings_data:
                current_date = booking['booking_start_date']
                end_date = booking['booking_end_date']
                
                while current_date <= end_date:
                    if f'T{current_date.weekday() + 2}' == booking['dow']:
                        start_decimal = (booking['start_time'].hour + 
                                       booking['start_time'].minute/60)
                        end_decimal = (booking['end_time'].hour + 
                                      booking['end_time'].minute/60)
                        
                        if not BookingInfo.objects.filter(
                            court=booking['court'],
                            booking_date=current_date,
                            start_time_decimal__lt=end_decimal,
                            end_time_decimal__gt=start_decimal).exists():
                            
                            created_bookings.append(BookingInfo.objects.create(
                                court_id=booking['court'],
                                booking_date=current_date,
                                start_time=booking['start_time'],
                                end_time=booking['end_time'],
                                customer_num='LỊCH THÁNG',
                                start_time_decimal=start_decimal,
                                end_time_decimal=end_decimal
                            ))
                        else:
                            conflict_dates.append(current_date.strftime('%Y-%m-%d'))
                    
                    current_date += timedelta(days=1)
        
        if conflict_dates:
            raise serializers.ValidationError({
                'detail': 'Partial conflicts',
                'created': len(created_bookings),
                'conflicts': conflict_dates
            })
            
        return {'created_bookings': created_bookings}