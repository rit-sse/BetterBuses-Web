$.getJSON("schedule.json", function (data) {
    console.log(data);
    Routes = data;
    console.log(Routes.stops());
    console.log(Routes.routes());

})
    .fail(function () {
        console.log("An error has occured in loading schedule.json.");
    });
