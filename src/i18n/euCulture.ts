// Europe-style date/time formats (Luxon tokens).
// Uses day-first date order and 24-hour clock as the common default.
const euCulture = {
    dateTime: {
        formats: {
            dateTime: "dd/MM/yyyy hh:mm:ss.SSS a",
            dateTime24: "dd/MM/yyyy HH:mm:ss.SSS",
            dateTimeShort: "d/M/yyyy h:mm:ss a",
            dateTime24Short: "d/M/yyyy H:mm:ss",

            dateTimeHM: "dd/MM/yyyy hh:mm a",
            dateTimeH24M: "dd/MM/yyyy HH:mm",
            dateTimeHMShort: "d/M/yyyy h:mm a",
            dateTimeH24MShort: "d/M/yyyy H:mm",

            date: "dd/MM/yyyy",
            dateShort: "d/M/yyyy",

            time: "hh:mm:ss.SSS a",
            time24: "HH:mm:ss.SSS",
            timeShort: "h:mm:ss.SSS a",
            time24Short: "H:mm:ss.SSS",

            timeHM: "hh:mm a",
            timeH24M: "HH:mm",
            timeHMShort: "h:mm a",
            timeH24MShort: "H:mm",

            timeHMS: "hh:mm:ss a",
            timeH24MS: "HH:mm:ss",
            timeHMSShort: "h:mm:ss a",
            timeH24MSShort: "H:mm:ss"
        }
    }
};

export default euCulture;
