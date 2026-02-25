// CultureInfo-like invariant formats (Luxon tokens).
// Chosen to be culture-agnostic and sortable: yyyy-MM-dd with 24h variants.
const invariantCulture = {
    dateTime: {
        formats: {
            dateTime: "yyyy-MM-dd hh:mm:ss.SSS a",
            dateTime24: "yyyy-MM-dd HH:mm:ss.SSS",
            dateTimeShort: "yyyy-M-d h:mm:ss a",
            dateTime24Short: "yyyy-M-d H:mm:ss",

            dateTimeHM: "yyyy-MM-dd hh:mm a",
            dateTimeH24M: "yyyy-MM-dd HH:mm",
            dateTimeHMShort: "yyyy-M-d h:mm a",
            dateTimeH24MShort: "yyyy-M-d H:mm",

            date: "yyyy-MM-dd",
            dateShort: "yyyy-M-d",

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

export default invariantCulture;
