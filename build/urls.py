from django.urls import path
from . import views

app_name = 'build'
urlpatterns = [
    path('', views.BuildsListAPIView.as_view(), name='all')
]
