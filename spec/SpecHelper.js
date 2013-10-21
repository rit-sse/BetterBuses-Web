beforeEach(function () {
    this.addMatchers({});
});

var data = $.parseJSON($.ajax({
    url: "spec/mocks/mock.json",
    async: false
}).responseText);

var schedule = new Schedule(data);
