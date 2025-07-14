from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from .models import *
from .serializers import *
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from collections import defaultdict

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
    
class BookingListCreate(generics.ListCreateAPIView):
    queryset = BookingInfo.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['booking_date']
    def get_serializer_class(self):
        if self.request.method == "GET":

            return BookingListSerializer
        return BookingSerializer



class BookingRetrieveUpdateDestroy(generics.RetrieveUpdateDestroyAPIView):
    queryset = BookingInfo.objects.all()
    serializer_class = BookingSerializer
    lookup_field = "pk"
    
    


## -------------------------------------------------------------------------- ##
    
class BookingAvailabilityView(generics.ListAPIView):
    def list(self, request, *args, **kwargs):
        # Get court and validate date
        court = get_object_or_404(CourtInfo, id=self.kwargs['court_id'])
        filter_start_date = request.query_params.get('start_date', str('2025-07-01'))
        filter_end_date = request.query_params.get('end_date', str('2025-07-31'))
        
        # Get all bookings for date
        bookings = BookingInfo.objects.filter(
            court=court,
            booking_date__gte = filter_start_date,
            booking_date__lte = filter_end_date
        )
        
        # Convert bookings to decimal time slots
        booked_slots = [
            (float(b.start_time_decimal), float(b.end_time_decimal))
            for b in bookings
        ]
        
        # Calculate free slots
        time_manager = TimeManage(
            opening=float(court.start_hour),
            closing=float(court.end_hour),
            interval=1)
        free_slots = time_manager.find_free_slots(booked_slots)
        uniform_slots = time_manager.uniform_free_slots()
        
        # Format response
        
        return Response({
            "court": court.court_name,
            "date_range_start":filter_start_date,
            "date_range_end":filter_end_date,
            "booked_slots":booked_slots,
            "free_slots": uniform_slots,
        })


class BookingAvailabilityIntervalView (APIView):
    def get(self, request, *args, **kwargs):
        # Get query parameters
        # court_id = request.query_params.get('court_id')
        start_date_str = request.query_params.get('start_date')
        end_date_str = request.query_params.get('end_date')

        # Validate required parameters
        # if not court_id or not start_date_str or not end_date_str:
        if not start_date_str or not end_date_str:
            return Response(
                {"error": "court_id, start_date, and end_date are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        bookings = BookingInfo.objects.filter(
                    booking_date__gte = start_date_str,
                    booking_date__lte = end_date_str
                    ).annotate(previous_end_time = Window(expression = Lag('end_time_decimal', default=None), partition_by=[F('court_id'), F('day_of_week')] \
                                                        ,order_by=F('start_time_decimal').asc())) \
                    
        bookings_within = bookings.annotate(start_time_free = F('previous_end_time'), end_time_free = F('start_time_decimal'))\
                                    .values('court_id', 'day_of_week', 'start_time_free', 'end_time_free')\
                                    .filter(start_time_free__isnull = False, start_time_free__lt = F('end_time_free'))

        bookings_min = bookings.values('court_id', 'day_of_week').annotate(start_time_free=F('court__start_hour'), end_time_free = Min('start_time_decimal'))
        bookings_max = bookings.values('court_id', 'day_of_week').annotate(start_time_free = Max('end_time_decimal'), end_time_free=F('court__end_hour'))
        combined_free_calendar = bookings_min.union(bookings_within, bookings_max, all=True).order_by('court_id', 'day_of_week', 'start_time_free') \

        grouped_data = defaultdict(list)
        for element in combined_free_calendar:
            key = (element['court_id'], element['day_of_week'])
            start_time = float(element['start_time_free'])
            end_time = float(element['end_time_free'])
            time_blocks = calculate_block_new(start_time, end_time)
            grouped_data[key].extend(time_blocks)  # Merge blocks for same key

        # Convert to final output format
        data = [
            {
                'court_id': court_id,
                'day_of_week': day_of_week,
                'free_time_block': time_blocks,
            }
            for (court_id, day_of_week), time_blocks in grouped_data.items()
        ]

        serializer = FreeTimeSlotSerializer(data, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    
    