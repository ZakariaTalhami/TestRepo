//  build/trigger/
function trigger() {
    $("#btnTrigger").on('click', function () {
        $.ajax({
            method: "post",
            url: '/build/trigger/',
            data : $('#formTrigger').serialize(),
            beforeSend: function (xhr) {
                $("#btnTrigger").prop("disabled", true)
                xhr.setRequestHeader("X-CSRFToken", "{{ csrf_token }}");
            },
            complete: function (jqXHR, textStatus) {
                $("#btnTrigger").prop("disabled", false)
            },
            error: function () {
                $("#msgBlock").show("fast").delay(4000).hide("slow")
            },
            success: function (data) {
                $("#formTrigger input").val("")
                console.log("succc")
            }
        });
    });
}

$(document).ready(function () {
    trigger()
});