beforeEach(function () {
    this.addMatchers({});
});

Schedule.data = $.parseJSON($.ajax({
    url: "spec/mocks/mock.json",
    async: false
}).responseText);
