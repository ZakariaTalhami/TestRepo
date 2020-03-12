// request data -builds-
function getBuilds(url = "/build/builds/") {
    $.ajax({
        method: "get",
        url: url,
        beforeSend: function (xhr) {
            $("table tfoot button").prop("disabled", true)
            $("table tbody tr:not(#tableLoader)").remove()
            $("#tableLoader").show("fast")
        },
        complete: function (jqXHR, textStatus) {
            $("table tfoot button").prop("disabled", false)
            $("#tableLoader").hide("fast")
        },
        error: function () {
            $("#msgBlock").show("fast").delay(4000).hide("slow")
        },
        success: function (data) {
            displayBuilds(data);
        }
    });
}

function displayBuilds(data) {
    if (data.next) {
        $("table #btnNext").attr("data-url", data.next).prop("disabled", false)
    } else {
        $("table #btnNext").attr("data-url", '').prop("disabled", true)
    }

    if (data.previous) {
        $("table #btnPrev").attr("data-url", data.previous).prop("disabled", false)
    } else {
        $("table #btnPrev").prop("disabled", true).attr("data-url", '')
    }

    if (data.results) {
        for (var build of data.results) {
            appendRow(build)
        }
    }
}

function appendRow(build, sub = false) {

    function getTd(data) {
        td = $("<td></td>").text(data ? data : '');
        return td
    }

    var tr = $("<tr></tr>").addClass('center aligned')
    if (sub) {
        tr.addClass('sub')
    }
    tr.append(getTd().append($("<a>").attr("href", build.url).text("#" + build.num)))
    tr.append(getTd().append(build.result ? $('<i class="check icon ui green"></i>') : $('<i class="x icon ui red"></i>')))
    tr.append(getTd(build.date))
    tr.append(getTd(build.description))
    tr.append(getTd(build.param.MIN_VALUE ? build.param.MIN_VALUE + ' - ' + build.param.MAX_VALUE : ''))
    tr.append(getTd(build.param.THRESHOLD))
    tr.append(getTd(build.cause))
    tr.append(getTd(build.duration))

    $("table tbody").append(tr)

    for (var subBuild of build.sub_builds) {
        appendRow(subBuild, true)
    }
}


function paginationOnClick() {
    $('table #btnNext, table #btnPrev').on('click', function () {
        getBuilds($(this).attr('data-url'))
    })
}

/* .................   Highchart    .......................   */

function creatChart(data) {
    for (var node of data) {
        if (!node.y) {
            node.y = 0
        } else {
            node.y = parseFloat(node.y * 100 / 24)
        }
    }
    Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Run-test job success rate for last 7 days'
            },
            subtitle: {
                text: 'Click the columns to view sub-builds <a href="http://statcounter.com" target="_blank">statcounter.com</a>'
            },
            accessibility: {
                announceNewData: {
                    enabled: true
                }
            },
            xAxis: {
                type: 'last 7 days'
            },
            yAxis: {
                title: {
                    text: 'Total percent'
                }

            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    borderWidth: 0,
                    dataLabels: {
                        enabled: true,
                        format: '{point.y:.1f}%'
                    }
                }
            },

            tooltip: {
                headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b> of total<br/>'
            },

            series: [
                {
                    name: "Days",
                    colorByPoint: true,
                    data: data
                }
            ]
        }
    );
}

function buildHighchart() {

    $.ajax({
            method: "get",
            url: '/build/rate',
            beforeSend: function (xhr) {
                $("#chartLoader").show("fast")
            },
            complete: function (jqXHR, textStatus) {
                $("table tfoot button").prop("disabled", false)
                $("#chartLoader").hide("fast")
            },
            error: function () {
                $("highChart").append(
                    $('     <div id="msgBlock" class="ui negative message" style="display: none">\n' +
                        '            <div class="header">\n' +
                        '                We\'re sorry, something went wrong cant\'t show chart\n' +
                        '            </div>\n' +
                        '        </div>')
                )
            },
            success: function (data) {
                creatChart(data.rates)
            }
        }
    );
}

$(document).ready(function () {
    getBuilds()
    paginationOnClick()
    buildHighchart()
});
