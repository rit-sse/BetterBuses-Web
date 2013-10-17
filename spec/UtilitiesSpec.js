describe("Utilities", function() {
    it("has a list of days of the week", function () {
        expect(Utilities.days.length).toEqual(7);
    });

    it("generates a string of the current day of the week", function () {
        expect(Utilities.days).toContain(Utilities.dayString());
    });

    it("generates a formatted string of the current time", function () {
        expect(Utilities.timeString()).toMatch(/[0-9]?[0-9]:[0-9][0-9][AP]/);
    });

    it("generates a time value (number) for a time string", function () {
        expect(Utilities.timevalue("11:50A")).toEqual(1150);
        expect(Utilities.timevalue("11:50P")).toEqual(2350);
    });

    it("compares strings and numbers", function () {
        expect(Utilities.compare('a', 'b')).toEqual(-1);
        expect(Utilities.compare('b', 'a')).toEqual(1);
        expect(Utilities.compare('a', 'a')).toEqual(0);

        expect(Utilities.compare(0, 1)).toEqual(-1);
        expect(Utilities.compare(1, 0)).toEqual(1);
        expect(Utilities.compare(0, 0)).toEqual(0);

        expect(Utilities.compare(null, null)).toEqual(0);
        expect(Utilities.compare(undefined, undefined)).toEqual(0);
        expect(Utilities.compare([], [])).toEqual(0);
        expect(Utilities.compare({}, {})).toEqual(0);
    });

    it("returns true if an array contains a specific object", function () {
        expect(Utilities.contains([1, 2, 3, 4], 3)).toBeTruthy();
        expect(Utilities.contains(["can", "I ", "have", "a", "little", "more"], "less")).toBeFalsy();
        expect(Utilities.contains([], "All Together Now")).toBeFalsy();
    });

    it("gets the values in a JavaScript object", function () {
        var object = {"first": 1, "second": 2, "third": 3};

        expect(Utilities.values(object)).toEqual([1, 2, 3]);
        expect({}).toEqual([]);
    });
});
