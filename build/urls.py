from django.urls import path
from . import views

app_name = 'build'
urlpatterns = [
    path('', views.Dashboard.as_view(), name='base'),
    path('dashboard/', views.Dashboard.as_view(), name='dashboard'),
    path('builds/', views.BuildsListAPIView.as_view(), name='all'),
    path('rate/', views.buildsRate, name='rate'),
    path('trigger/', views.Trigger.as_view(), name='trigger')
]
