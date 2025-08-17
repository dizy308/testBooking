from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from .models import *
from .serializers import *
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from collections import defaultdict

from django.db import transaction
from django.db.models import F, Window, Case, When, Value, FloatField, Min, Max
from django.db.models.functions import Lag, Lead


class QuestionListCreate(generics.ListCreateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['question_text']
    
    
class QuestionRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    lookup_field = "pk"



class CourtCreateList(generics.ListCreateAPIView):
    queryset = CourtInfo.objects.all()
    serializer_class = CourtSerializer


class CourtRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = CourtInfo.objects.all()
    serializer_class = CourtSerializer
    lookup_field = "pk"
    


class BookingRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = BookingInfo.objects.all()
    serializer_class = BookingSerializer
    lookup_field = "pk"
    


class BookingListView(generics.ListAPIView):
    queryset = BookingInfo.objects.all()
    serializer_class = BookingListSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['booking_date']


class BookingCreateView(generics.CreateAPIView):
    queryset = BookingInfo.objects.all()
    serializer_class = BookingSerializer


## -------------------------------------------------------------------------- ##
    
class BookingAvailabilityView(APIView):
    def get(self, request, *args, **kwargs):
        # Get court and validate date
        input_date = request.query_params.get('date', str('2025-07-01'))
        courts = CourtInfo.objects.all()
        bookings = BookingInfo.objects.filter(booking_date = input_date).select_related('court')

        booked_slots = defaultdict(list) 
        booked_details = defaultdict(list)  

        for booking in bookings:
            time_interval = (float(booking.start_time_decimal), float(booking.end_time_decimal))
            booked_slots[booking.court_id].append(time_interval)
            
            booked_details[booking.court_id].append({
                    'booking_id': float(booking.id),
                    'start_time': float(booking.start_time_decimal),
                    'end_time': float(booking.end_time_decimal),
                    'customer_id': booking.customer_num
                })

        
        total_slots = []
        for court in courts:
            booked_list = booked_slots.get(court.id,[])
            start_time = float(court.start_hour)
            end_time = float(court.end_hour)
            free_slot = find_free_slots_new(start_time, end_time, booked_list)
            
            total_slots.append({
                "court_id": court.id,
                "booked_slot":booked_details[court.id],
                "free_slot": free_slot,
                })
        
        serializer = FreeTimeSlotSerializer(total_slots, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)



class BookingAvailabilityIntervalView(APIView):
    def get(self, request, *args, **kwargs):
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        if not start_date_str or not end_date_str:
            return Response(
                {"error": "start_date and end_date are required."},
                status=status.HTTP_400_BAD_REQUEST)
    
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
                
                for start_slot, end_slot in merged_slots:
                    for b in booked_details[(dow,court.id)]:
                        if max(b['start_time'], start_slot) <= min(end_slot, b['end_time']):
                            b['start_time_merged'] = start_slot
                            b['end_time_merged'] = end_slot

                
                total_slots.append({
                    "court_id": court.id,
                    "day_of_week": dow,
                    "booked_slots":booked_details[(dow,court.id)],
                    # "merged_slots":merged_slots,
                    "free_slots": free_slots,
                    })

        serializer = FreeTimeSlotIntervalSerializer(total_slots, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    
class BookingIntervalCreateView(generics.CreateAPIView):
    serializer_class = BulkBookingSerializer