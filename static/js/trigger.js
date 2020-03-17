
function trigger() {
    $("#btnTrigger").on('click', function () {
        $.ajax({
            method: "post",
            url: url_trigger,  // url_trigger var defined in trigger.html
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
            }
        });
    });
}

$(document).ready(function () {
    $("#titleHeader h3").text("Trigger")
    trigger()
});