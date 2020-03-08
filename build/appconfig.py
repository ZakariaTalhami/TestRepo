from appconf import AppConf


class Config(AppConf):
    jenkins_base_url = 'http://35.157.133.88:8080/'
    jenkins_user = {
        'username': 'rand',
        'password': 'rand',
        'token':'1174256394114de64fb2b77f0639f87caa'
    }
    jobs = {
        'run_test': {
            'url': f'{jenkins_base_url}job/mock/job/run_tests/api/json?tree=builds[actions[*[*]],*,subBuilds[url]]',
            'trigger': {
                'url': f'{jenkins_base_url}job/mock/job/run_tests/buildWithParameters?token={jenkins_user["token"]}'
                       '&MIN_VALUE={min}&MAX_VALUE={max}&THRESHOLD={threshold}'
            }
        }
    }
