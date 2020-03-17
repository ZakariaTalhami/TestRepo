function toggleSideMenue() {
    if ($(window).width() < 768) {
        $(".sidebar").addClass("toggle")
    } else {
        $(".sidebar").removeClass("toggle")
    }
}

function btnToggleSideMenue() {
    $("#titleHeader #btnToggle").on('click', function () {
         $(".sidebar").toggleClass("toggle")
    })
}

$(window).on('resize', function () {
    toggleSideMenue()
});

$(document).ready(function () {
    toggleSideMenue()
    btnToggleSideMenue()
});