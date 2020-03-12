from django.db import models
from django_mysql.models import JSONField


class Build(models.Model):
    num = models.IntegerField()
    date = models.DateField()
    description = models.TextField(null=True)
    cause = models.CharField(max_length=255)
    result = models.BooleanField(default=False)
    duration = models.IntegerField()
    param = JSONField()
    url = models.URLField(max_length=300)
    sub_builds = models.ManyToManyField('Build')
    is_sub = models.BooleanField(default=False)

