// request data -builds-
function getBuilds(url = url_builds) {
    $.ajax({
        method: "get",
        url: url,
        beforeSend: function (xhr) {
            $("table tfoot button").addClass("disabled")
            $("table tbody tr:not(#tableLoader)").remove()
            $("#tableLoader").show("fast")
        },
        complete: function (jqXHR, textStatus) {
            $("table tfoot button").removeClass("disabled")
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
    addPagination(data)

    if (data.results) {
        for (var build of data.results) {
            appendRow(build)
        }
    }
}

function getPageBtn(classes, text, url = '') {
    btn = $('<button data-url=""></button>').text(text)
    btn.addClass("ui button icon item " + classes)
    btn.attr('data-url', url)
    return btn
}

function addPagination(data) {
    $('table tfoot button:not(#btnNext):not(#btnPrev)').remove()
    let btnNext = $("#btnNext");
    if (data.next) {
        $(btnNext).attr("data-url", data.next).removeClass("disabled")
    } else {
        $(btnNext).attr("data-url", '').addClass("disabled")
    }

    if (data.previous) {
        $("#btnPrev").attr("data-url", data.previous).removeClass("disabled")
    } else {
        $("#btnPrev").attr("data-url", '').addClass("disabled")
    }


    let totalPage = Math.ceil(parseInt(data.count) / 4);
    let i = 1;
    for (; i < 4 && i < totalPage; i++) {
        btn = NaN
        if (i == currentPage) {
            btn = getPageBtn('disabled', i)
        } else {
            btn = getPageBtn('disabled', i, url_builds + "?page=" + i)
        }
        $(btnNext).before(btn)
    }

    if (i  == currentPage) {
        btn = getPageBtn('disabled', currentPage)
        $(btnNext).before(btn)
    } else if(i < currentPage && currentPage != totalPage){
        btnNon = getPageBtn('disabled', '...')
        $(btnNext).before(btnNon)
        btn = getPageBtn('disabled', currentPage)
        $(btnNext).before(btn)
    }

    if (i < totalPage) {
        btnNon = getPageBtn('disabled', '...')
        $(btnNext).before(btnNon)
        btn = getPageBtn('', totalPage, url_builds + "?page=" + totalPage)
        $(btnNext).before(btn)
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
    tr.append(getTd().append($("<a>").attr("href", build.url).attr("target", "_blank").text("#" + build.num)))
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
    $('table tfoot').on('click', 'button', function () {
        currentPage = parseInt($(this).attr('data-url').split("?page=")[1])
        getBuilds($(this).attr('data-url'))
    })
}

/* .................   Highchart    .......................   */

function creatChart(data) {
    var xCatagory = [];

    for (var node of data) {
        if (!node.y) {
            node.y = 0
        } else {
            node.y = parseFloat(node.y * 100)
        }

        // add succss results
        node.success = node.success ? 1 : 0

        // add fail results
        node.fail = node.count - node.success

        // add date to catagory
        xCatagory.push(node.name);
    }

    Highcharts.chart('container', {
            chart: {
                type: 'column'
            },
            title: {
                text: 'Run-test job success rate for last 7 days'
            },
            subtitle: {},
            accessibility: {
                announceNewData: {
                    enabled: true
                }
            },
            xAxis: {
                type: 'last 7 days',
                categories: xCatagory
            },
            yAxis: {
                title: {
                    text: 'Total percent'
                },
                max: 100.0

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
                pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:.2f}%</b><br/>' +
                    '<span style="color:{point.color}">success</span>: {point.success}<br/>' +
                    '<span style="color:{point.color}">failure</span>: {point.fail}<br/>'
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
            url: url_rate, // url_rate defined in dashboard.html
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
    $("#titleHeader h3").text("Dashboard")
    currentPage = 1;
    getBuilds()
    paginationOnClick()
    buildHighchart()
});
