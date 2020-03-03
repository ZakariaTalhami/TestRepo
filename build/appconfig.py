from appconf import AppConf


class Config(AppConf):
    jobs = {
        'run_test': {
            'url': 'http://35.157.133.88:8080/job/mock/job/run_tests/api/json?tree=builds[actions[*],*,subBuilds[url]]',
            'username': 'rand',
            'password': 'rand'
        }
    }
