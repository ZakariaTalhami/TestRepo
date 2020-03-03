from django.shortcuts import render
from rest_framework import generics
from .serializers import BuildSerializer
from .models import Build
from .appconfig import Config
from datetime import date
from django.db.models import Max
from django.db import connection
from rest_framework.pagination import PageNumberPagination
import requests


"""
read data from jenkinz and store in db  ...............................................................
"""


def run_test_job_build(url):
    req = requests.get(url, auth=(Config.jobs['run_test']['username'], Config.jobs['run_test']['password']))
    if req.status_code == 200:
        return req.json()
    return None


def param_to_json(params):
    str = "{"
    for i, param in params:
        str += "\'" + param.get('name') + "\':\'" + param.get('value') + "\'"
        if i != len(params):
            str += ", "
    return str + "}"


def analyze_action(actions, build_obj):
    count = 0
    for node in actions:
        if node.get('_class') == 'hudson.model.StringParameterValue':
            build_obj.param = param_to_json(node.get('parameters'))
            count += 1
        elif node.get('_class') == 'hudson.triggers.TimerTrigger$TimerTriggerCause':
            build_obj.cause = node.get('shortDescription')
            count += 1
        if count == 2:
            break


def read_build(b):
    build = Build()
    build.num = b.get('id')
    analyze_action(b.get('actions'), build)
    build.description = b.get('description')
    build.duration = b.get('duration')
    build.result = b.get('result') == 'SUCCESS'
    build.url = b.get('url')
    build.date = date.fromtimestamp(b.get('timestamp') / 1000)
    build.save()

    if b.get('subBuilds'):
        for sub in b.get('subBuilds'):
            data = run_test_job_build('http://35.157.133.88:8080/' + sub['url'] + '/api/json')
            sub_build = read_build(data)
            sub_build.is_sub = True
            build.sub_builds.add(sub_build)
        build.save()

    return build


def save(request):
    data = run_test_job_build(Config.jobs['run_test']['url'])
    max = Build.objects.aggregate(Max('num'))['num__max']
    max = max if max else 0
    id_inserted = ""
    if data:
        for b in data['builds']:
            if int(b['id']) > max:
                id_inserted += b['id'] + " "
                read_build(b)
    return render(request, "dashbord.html", {'s': "Success, inserted id : " + id_inserted + " ,and max is " + str(max)})


"""
 ...............................................................
"""


class BuildsListPagination(PageNumberPagination):
    page_size = 4


class BuildsListAPIView(generics.ListAPIView):
    serializer_class = BuildSerializer
    queryset = Build.objects.filter(is_sub__exact=False)
    pagination_class = BuildsListPagination


print(connection.queries)