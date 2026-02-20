// const currentLocale = new Intl.Locale(navigator.language);
// const currentCollator = Intl.Collator(navigator.language);
const defaulCollator = Intl.Collator();

const ciCompare = (() => {
    const collatorOptions: Intl.CollatorOptions = {
        sensitivity: "accent" // or "base"
    };
    ;
    // feature detection
    return 'A'.localeCompare('a', undefined, collatorOptions) ? (strA: string, strB: string, locale = navigator.language) => {
        return strA.localeCompare(strB, locale, collatorOptions)
    } : (strA: string, strB: string, locale?: string) => {
        // fallback approach
        return strA.toLocaleUpperCase(locale).localeCompare(strB.toLocaleUpperCase(locale), locale);
    };
})();

function compare(strA: string, strB: string, ignoreCase = false, locale = navigator.language) {
    if (typeof strA !== 'string' || typeof strB !== 'string') {
        return defaulCollator.compare(strA, strB);
    }
    if (ignoreCase) {
        return ciCompare(strA, strB, locale);
    }
    return strA.localeCompare(strB, locale);
}

// isEqual
function equals(strA: string, strB: string, ignoreCase = false, locale = navigator.language) {
    if (typeof strA !== 'string' || typeof strB !== 'string') {
        return strA === strB;
    }
    if (ignoreCase) {
        return ciCompare(strA, strB) === 0;
    }
    return strA.localeCompare(strB, locale) === 0;
}

function ciStartsWith(str: string, searchStr: string, locale = navigator.language) {
    if (typeof str !== 'string' || typeof searchStr !== 'string' || str.length < searchStr.length) {
        return false;
    }
    return equals(str.substring(0, searchStr.length), searchStr, true, locale);
}

function ciEndsWith(str: string, searchStr: string, locale = navigator.language) {
    if (typeof str !== 'string' || typeof searchStr !== 'string' || str.length < searchStr.length) {
        return false;
    }
    return equals(str.substring(str.length - searchStr.length), searchStr, true, locale);
}

function ciIndexOf(str: string, searchStr: string, locale = navigator.language) {
    if (typeof str !== 'string' || typeof searchStr !== 'string' || str.length < searchStr.length) {
        return -1;
    }
    return str.toLocaleUpperCase(locale).indexOf(searchStr.toLocaleUpperCase(locale));
}

function ciIncludes(str: string, searchStr: string, locale = navigator.language) {
    if (typeof str !== 'string' || typeof searchStr !== 'string' || str.length < searchStr.length) {
        return false;
    }
    return str.toLocaleUpperCase(locale).includes(searchStr.toLocaleUpperCase(locale));
}

export {
    equals,
    compare,
    ciCompare,
    ciStartsWith,
    ciEndsWith,
    ciIndexOf,
    ciIncludes
};