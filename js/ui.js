$.getJSON("schedule.json", function (data) {
    console.log(data);
    Routes.data = data;

    $.each(Routes.stops(), function (index, stop) {
        $("#source-picker").append("<option>" + stop + "</option>");
        $("#destination-picker").append("<option>" + stop + "</option>");
    });
})
    .fail(function () {
        console.log("An error has occured in loading schedule.json.");
    });
