from django.urls import path

from . import views

urlpatterns = [
    # path("", views.QuestionListCreate.as_view(), name='list'),
    # path("<int:pk>/", views.QuestionRetrieveUpdateDestroy.as_view(), name='update'),
    
    path("court/", views.CourtCreateList.as_view(), name= "court-createlist"),
    path("court/update/<int:pk>", views.CourtRetrieveUpdateDestroy.as_view(), name= "court-update"),
    
    path("booking/", views.BookingListView.as_view(), name= "booking-list"),
    path("booking/intradaybooking", views.BookingCreateView.as_view(), name= "booking-intraday"),
    path("booking/freeslot", views.BookingAvailabilityView.as_view(), name= "booking-freeslot"),
    path("booking/freeslotinterval", views.BookingAvailabilityIntervalView.as_view(), name= "booking-freeslot-interval"),
    path("booking/intervalbooking", views.BookingIntervalCreateView.as_view(), name= "booking-interval"),
    
    
    path("booking/update/<int:pk>", views.BookingRetrieveUpdateDestroy.as_view(), name= "booking-update"),
]