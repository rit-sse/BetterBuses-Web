$.getJSON("schedule.json", function (data) {
    console.log(data);
    Routes = data;
    console.log(stops());
    console.log(routes());

})
    .fail(function () {
        console.log("An error has occured in loading schedule.json.");
    });
