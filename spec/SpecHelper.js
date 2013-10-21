beforeEach(function () {
    this.addMatchers({});
});

Routes.data = $.parseJSON($.ajax({
    url: "spec/mocks/mock.json",
    async: false
}).responseText);
