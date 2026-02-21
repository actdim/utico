// rename culture to locale?

/*
TODO:
Sorting and String Comparison
String sorting and comparison are language-specific. Even within languages based on the Latin script, there are different composition and sorting rules. Thus do not rely on code points to do proper sorting and string comparison.

Calendar Differences
The Gregorian calendar is used in most English speaking countries, but world-ready products should also take into consideration other calendaring systems in use worldwide.

Date Formatting
Date formatting is not constant through out the world. Although each date basically displays the day, month, and year, their presentation order and separators vary greatly. In fact, there may be many differences between regions within the same country.

Time Formatting
Like date and calendar formats, time formats are not constant throughout the world.

Currency Formatting
Currency formatting needs to take into consideration the currency symbol and symbol placement, and the number formatting display.

Number Formatting
The number formatting deals with the character used as the decimal and thousands separators.

Address Formatting
Various countries/regions have different address formats.

Telephone Number Formatting
Like addresses, the format for telephone numbers around the world varies significantly. The input fields and the routines that process information dealing with telephone numbers should be able to handle the variety of formats.

Paper Size
It's important to set the paper size correctly if your application supports the print function.

Units of Measurement
Throughout the world things are measured using different units and scales. The most popular one used is the metric system (meters, liters, grams, etc). Where as the US still uses the imperial system (feet, inches, pounds, etc).
*/

// CultureInfo — all format strings use Luxon tokens
// Key differences from Moment: YYYY->yyyy, DD->dd, D->d, A->a
const enUsCulture = {
    dateTime: {
        formats: {
            // The leading zero is more commonly used with the 24-hour notation
            // especially in computer applications because it can help to maintain column alignment in tables and correct sorting order

            // a = AM/PM (Luxon), yyyy = 4-digit year, dd = 2-digit day
            dateTime: "MM/dd/yyyy hh:mm:ss.SSS a",
            dateTime24: "MM/dd/yyyy HH:mm:ss.SSS",
            dateTimeShort: "M/d/yyyy h:mm:ss a",
            dateTime24Short: "M/d/yyyy HH:mm:ss",

            dataTimeHM: "MM/dd/yyyy hh:mm a",
            dataTimeH24M: "MM/dd/yyyy HH:mm",
            dataTimeHMShort: "MM/dd/yyyy h:mm a",
            dataTimeH24MShort: "MM/dd/yyyy H:mm",

            date: "MM/dd/yyyy",
            dateShort: "M/d/yyyy",

            // timeHMSS
            time: "hh:mm:ss.SSS a",
            // timeH24MSS
            time24: "HH:mm:ss.SSS",
            // timeHMSSShort
            timeShort: "h:mm:ss.SSS a",
            // timeH24MSSShort
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

export default enUsCulture;
