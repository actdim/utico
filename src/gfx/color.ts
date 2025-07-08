// see also https://css-tricks.com/converting-color-spaces-in-javascript/

// getRandomColorChannelValue(Number)
function getRandomColorChannelNumber(brightness: number) {
    const r = 255 - brightness;
    return 0 | ((Math.random() * r) + brightness);
}

export function getRandomColorChannelString(brightness: number) {
    const n = getRandomColorChannelNumber(brightness);
    let result = n.toString(16);
    // result = ('00' + result).slice(- 2);
    if (result.length == 1) {
        result = '0' + result;
    }
    return result;
}

export function getRandom32BitColorNumber(alpha: number = null, brightness: number = null) {
    // return Math.floor(Math.random() * 0xFFFFFFFF);

    // typeof brightness !== "number"
    if (brightness == undefined) {
        brightness = Math.floor(Math.random() * 0xFF); // 255
    }
    const r = getRandomColorChannelNumber(brightness);
    const g = getRandomColorChannelNumber(brightness);
    const b = getRandomColorChannelNumber(brightness);
    // typeof alpha !== "number"
    const a = alpha == undefined ? getRandomColorChannelNumber(brightness) : alpha;
    return getColorNumberFromRgba(r, g, b, a);
}

// getRandom24bitColorNumber
export function getRandomColorNumber(brightness: number = null) {
    // return Math.floor(Math.random() * 0xFFFFFF);
    // typeof brightness !== "number"
    if (brightness == undefined) {
        brightness = Math.floor(Math.random() * 0xFF); // 255
    }
    const r = getRandomColorChannelNumber(brightness);
    const g = getRandomColorChannelNumber(brightness);
    const b = getRandomColorChannelNumber(brightness);
    return getColorNumberFromRgba(r, g, b);
}

function refineColorHexString(colorHexString: string) {
    colorHexString = colorHexString.trim().toUpperCase();
    let isNegative = false;

    if (colorHexString.startsWith("-")) {
        isNegative = true;
        colorHexString = colorHexString.slice(1).trimLeft();
    }

    if (colorHexString.startsWith("0X")) {
        colorHexString = colorHexString.slice(2);
    }

    if (colorHexString.startsWith("#")) {
        colorHexString = colorHexString.slice(1);
    }

    // colorHexString = "0x" + colorHexString;
    if (isNegative) {
        colorHexString = "-" + colorHexString;
    }

    return colorHexString;
}

// colorHexStringToNumber
export function getColorNumberFromHexString(colorHexString: string) {
    if (!colorHexString) {

        return 0;

    } else {
        // TODO: detect alpha channel
        // const { r, g, b, a } = getColorRgbaFromHexString(colorHexString)
        // return getColorNumberFromRgba(r, g, b, a);

        colorHexString = refineColorHexString(colorHexString);

        let result =
            // new Number(colorHexString).valueOf();
            // parseInt(colorHexString);
            parseInt(colorHexString, 16);

        // if (isNegative) {
        //     result = result >>> 0; // convert to unsigned int32
        // }

        return result;
    }
}

export function getColorRgbaFromHexString(colorHexString: string) {

    if (!colorHexString) {
        return {
            r: 0,
            g: 0,
            b: 0,
            a: 255
        };
    } else {

        const colorValue = getColorNumberFromHexString(colorHexString); // >>> 0
        if (colorValue > 0xFFFFFF) {
            return {
                r: colorValue >> 24 & 0xFF, // red
                // r: (colorValue & 0xFF000000) >> 24,
                g: colorValue >> 16 & 0xFF, // green
                // g: (colorValue & 0xFF0000) >> 16,
                b: colorValue >> 8 & 0xFF, // blue
                // b: (colorValue & 0xFF00) >> 8,
                a: colorValue & 0xFF // alpha
            };
        } else {
            return {
                r: colorValue >> 16 & 0xFF,
                // r: (colorValue & 0xFF0000) >> 16,
                g: colorValue >> 8 & 0xFF,
                // g: (colorValue & 0xFF00) >> 8,
                b: colorValue & 0xFF,
                // b: colorValue & 0xFF,
                a: 255
            };
        }

        // TODO: compare performance:
        // colorHexString = refineColorHexString(colorHexString);
        // // no alpha means opaque (non-transparent)
        // return {
        //     r: parseInt(colorHexString.slice(0, 2), 16), // "0x" + ...
        //     g: parseInt(colorHexString.slice(2, 4), 16),
        //     b: parseInt(colorHexString.slice(4, 6), 16),
        //     a: colorHexString.length > 6 ? parseInt(colorHexString.slice(6, 8), 16): 255
        // };

        // let hexString = input.replace('#', '');
        // if (hexString.length === 3) {
        //     hexString = `${hexString[0]}${hexString[0]}${hexString[1]}${hexString[1]}${hexString[2]}${hexString[2]}`;
        // }        
        // const r = parseInt(hexString.substring(0, 2), 16);
        // const g = parseInt(hexString.substring(2, 4), 16);
        // const b = parseInt(hexString.substring(4, 6), 16);
    }
}

// colorNumberToHexString
export function getColorHexStringFromNumber(color: number) {
    color = Math.floor(color);
    if (color == null || Number.isNaN(color)) {
        // color = 0;
        return "";
    }
    return "#" + ('000000' + color.toString(16)).slice(-6);
}

export function get32BitColorHexStringFromNumber(color: number) {
    color = Math.floor(color);
    return "#" + ('00000000' + color.toString(16)).slice(-8);
}

// colorRgbaToNumber/colorRgbaToInt(Number)
// { r: number, g: number, b: number, a?: number }
// use24BitDepthForOpaque
export function getColorNumberFromRgba(r: number, g: number, b: number, a: number = null, use24BitsForOpaque: boolean = true) {
    let result: number;
    // typeof a !== "number"
    if (a == undefined || (a === 255 && use24BitsForOpaque)) { // a === 255?
        // 24-bit color number
        result = (r << 16) + (g << 8) + b << 0; // '+' can be replaced with '^' or '|'        
    } else {
        // 32-bit color number
        result = (r << 24) + (g << 16) + (b << 8) + a;
    }
    return result >>> 0; // convert to unsigned int32
}

// colorRgbaToHexString
// { r: number, g: number, b: number, a?: number }
export function getColorHexStringFromRgba(r: number, g: number, b: number, a: number = null) {
    const value = getColorNumberFromRgba(r, g, b, a);
    return getColorHexStringFromNumber(value);
}

// getColorNumberFromControlEvent
export function getColorNumberFromEvent(e: Event) {
    const colorHexString = (e.target as HTMLInputElement)?.value;
    return getColorNumberFromHexString(colorHexString);
}

/*
function parse(orig: string) {
    if (!orig) {
        return {};
    }

    const result = orig.match(/(?:((hsl|rgb)a? *\(([\d.%]+(?:deg|g?rad|turn)?)[ ,]*([\d.%]+)[ ,]*([\d.%]+)[ ,/]*([\d.%]*)\))|(#((?:[\d\w]{3}){1,2})([\d\w]{1,2})?))/i);
    if (!result) {
        return { color: orig, opacity: 1.0 };
    } else if (result[7]) {
        let opacity = 1.0;
        if (result[9]) {
            opacity = parseInt(result[9].length == 1 ? `${result[9]}${result[9]}` : result[9], 16) * inv255;
        }
        return { color: `#${result[8]}`, opacity };
    } else if (result[0]) {
        return { color: `${result[2]}(${result[3]},${result[4]},${result[5]})`, opacity: (Number(result[6]) || 1.0) };
    }
}
*/