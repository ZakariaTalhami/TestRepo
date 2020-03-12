from django.shortcuts import render
from rest_framework import generics
from .serializers import BuildSerializer
from .models import Build
from .appconfig import Config
from datetime import date
from django.db.models import Max
from django.views import View
from django.http import HttpResponse, HttpResponseForbidden
from rest_framework.pagination import PageNumberPagination
import requests

"""
read data from jenkinz and store in db  ...............................................................
"""


def run_test_job_build(url):
    req = requests.get(url, auth=(Config.jenkins_user['username'], Config.jenkins_user['password']))
    if req.status_code == 200:
        return req.json()
    return None


def analyze_action(actions, build_obj):
    count = 0
    for node in actions:
        if not node:
            continue
        if node['_class'] == 'hudson.model.ParametersAction' or node['_class'] == 'com.tikal.jenkins.plugins.multijob.MultiJobParametersAction':
            build_obj.param = {x['name']: x['value'] for x in node.get('parameters')}
            count += 1
        elif node['_class'] == 'hudson.triggers.TimerTrigger$TimerTriggerCause' or node['_class'] == 'hudson.model.Cause$UpstreamCause':
            build_obj.cause = node.get('shortDescription')
            count += 1
        if count == 2:
            break


def read_build(b):
    build = Build()
    analyze_action(b.get('actions'), build)
    build.num = b.get('id')
    build.description = b.get('description')
    build.duration = b.get('duration')
    build.result = b.get('result') == 'SUCCESS'
    build.url = b.get('url')
    build.date = date.fromtimestamp(b.get('timestamp') / 1000)
    build.save()

    if b.get('subBuilds'):
        for sub in b.get('subBuilds'):
            data = run_test_job_build(Config.jenkins_base_url + sub['url'] + '/api/json')
            if data:
                sub_build = read_build(data)
                sub_build.is_sub = True
                sub_build.save()
                build.sub_builds.add(sub_build)
        build.save()
    return build


def save_builds():
    data = run_test_job_build(Config.jobs['run_test']['url'])
    if not data:
        return
    max = Build.objects.filter(is_sub__exact=False).aggregate(Max('num'))['num__max']
    max = max if max else 0
    for b in data['builds']:
        if int(b['id']) > max:
            read_build(b)


"""
 ...............................................................
"""


class BuildsListPagination(PageNumberPagination):
    page_size = 4


class BuildsListAPIView(generics.ListAPIView):
    serializer_class = BuildSerializer
    pagination_class = BuildsListPagination

    def get_queryset(self):
        save_builds()
        return Build.objects.filter(is_sub__exact=False)


class Dashboard(View):
    @staticmethod
    def get(request):
        return render(request, "dashboard.html", {})


class Trigger(View):
    @staticmethod
    def get(request):
        return render(request, 'dashboard.html', {})

    @staticmethod
    def post(request):
        url = Config.jobs['run_test']['trigger']['url']. \
            format(min=request.POST['min'], max=request.POST['max'], threshold=request.POST['th'])
        req = requests.post(url, auth=(Config.jenkins_user['username'], Config.jenkins_user['token']))
        if req.status_code == 201:
            return HttpResponse(status=201)
        return HttpResponseForbidden()

