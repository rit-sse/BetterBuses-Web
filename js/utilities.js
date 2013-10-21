// Utility methods
var Utilities = {

    days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],

    dayString: function () {
        // Format: Sunday|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday
        var now = new Date();
        return Utilities.days[now.getDay()];
    },

    timeString: function () {
        // Format: [0-1]?[0-9]:[0-9][0-9][AP]?
        var now, hour, minute, ampm;
        now = new Date();
        hour = now.getHours();
        hour = hour % 11;
        hour = (hour === 0) ? 12 : hour;
        minute = now.getMinutes();
        if (minute < 10) {
            minute = "0" + minute;
        }
        ampm = hour < 12 ? "A" : "P";
        return hour + ":" + minute + ampm;
    },

    timevalue: function (t) {
        var tenHour = 0,
            oneHour = 0,
            tenMin = 0,
            oneMin = 0,
            rawTime;
        switch (t.length) {
        case 4:
            oneHour = parseInt(t[0], 10);
            tenMin = parseInt(t[2], 10);
            oneMin = parseInt(t[3], 10);
            break;
        case 5:
            if (t[4] === "P" || t[4] === "p" || t[4] === "A" || t[4] === "a") {
                oneHour = parseInt(t[0], 10);
                if (t[4] === "P" || t[4] === "p") {
                    oneHour += 12;
                }
                tenMin = parseInt(t[2], 10);
                oneMin = parseInt(t[3], 10);
            } else {
                tenHour = parseInt(t[0], 10);
                oneHour = parseInt(t[1], 10);
                if (tenHour === 1 && oneHour === 2) {
                    tenHour = 0;
                    oneHour = 0;
                }
                tenMin = parseInt(t[3], 10);
                oneMin = parseInt(t[4], 10);
            }
            break;
        case 6:
            tenHour = parseInt(t[0], 10);
            oneHour = parseInt(t[1], 10);
            if (t[5] === "P" || t[5] === "p") {
                if (!(tenHour === 1 && oneHour === 2)) {
                    oneHour += 12;
                }
            }
            tenMin = parseInt(t[3], 10);
            oneMin = parseInt(t[4], 10);
            break;
        }
        function postMidnightTimeValue(tVal) {
            var result = tVal,
                strVal = String(tVal);
            if (strVal.length === 3) {
                if (parseInt(strVal[0], 10) < 5) {
                    result = parseInt(strVal, 10) + 2400;
                }
            }
            return result;
        }
        rawTime = (tenHour * 1000) + (oneHour * 100) + (tenMin * 10) + oneMin;
        return postMidnightTimeValue(rawTime);
    },

    // Works just like the spaceship operator (<=>) in Ruby.
    compare: function (a, b) {
        if (typeof a === 'string') {
            return a.localeCompare(b);
        }

        var result;

        if (a < b) {
            result = -1;
        } else if (a > b) {
            result = 1;
        } else {
            result = 0;
        }

        return result;
    },

    contains: function (array, object) {
        return array.indexOf(object) !== -1;
    },

    values: function (object) {
        return Object.keys(object).map(function (key) {
            return object[key];
        });
    }

};
