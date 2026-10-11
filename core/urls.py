from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("interest/", views.express_interest, name="express_interest"),
    path("interest/ajax/", views.express_interest_ajax, name="express_interest_ajax"),
    path("interest/success/", views.interest_success, name="interest_success"),
]