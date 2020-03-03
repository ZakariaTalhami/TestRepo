from django.db import models


class Build(models.Model):
    num = models.IntegerField()
    date = models.DateField()
    description = models.TextField(null=True)
    cause = models.CharField(max_length=255)
    result = models.BooleanField(default=False)
    duration = models.IntegerField()
    param = models.CharField(max_length=400)
    url = models.URLField(max_length=300)
    sub_builds = models.ManyToManyField('Build')
    is_sub = models.BooleanField(default=False)

