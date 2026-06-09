from django.urls import path

from apps.payments import views

urlpatterns = [
    path("capture/", views.RazorpayCaptureView.as_view(), name="razorpay-capture"),
    path("webhook/razorpay/", views.razorpay_webhook, name="razorpay-webhook"),
]
