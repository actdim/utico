
interface Array<T> {
    find(callback: (element: T, index: number, array: Array<T>) => boolean): T; // aka firstOrDefault
    unfold<TItem>(callback: (element: T) => Array<TItem>): Array<TItem>;  // aka selectMany
    max<TItem>(selector: (element: T) => TItem, defaultValue?: any): TItem;
    min<TItem>(selector: (element: T) => TItem, defaultValue?: any): TItem;
    orderBy<TItem>(selector: (element: T) => TItem): Array<T>;
    groupBy(selector: (element: T) => string): { [key: string]: Array<T> };
    // groupBy(key: string): { [key: string]: Array<T> };	
    orderByDesc<TItem>(selector: (element: T) => TItem): Array<T>;
    distinct(): Array<T>; // unique
    distinct<TItem>(selector: (element: T) => TItem): Array<T>; // distinctBy/uniqueBy
    // TODO: pushMany aka addRange
    /** NOTE: there is no native array copy method (all existing methods rely on spread) */
    copy(src: any[], srcIndex?: number, dstIndex?: number, length?: number): this; // copyFrom
    copyTo(dst: any[], srcIndex?: number, dstIndex?: number, length?: number): this;
}

// Comparers
class Sorters {
    static asc(a: any, b: any) {
        // comparison
        return (a === b) ? 0
            : (a > b) ? 1
                : -1;
        // if (a < b) {
        //     return -1;
        // }
        // if (a > b) {
        //     return 1;
        // }
        // // a must be equal to b
        // return 0;
        // localeCompare?
        // numeric: a - b
    }

    static desc(a: any, b: any) {
        return -Sorters.asc(a, b);
        // return Sorters.asc(b, a);
    }
}

Array.prototype.unfold = function (callback: (element: any) => any[]): any[] {
    return this.reduce((res, element) => {
        Array.prototype.push.apply(res, callback(element));
        return res;
    }, []);
};

Array.prototype.max = function (selector: (element: any) => any, defaultValue?: any): any {
    if (this.length == 0) {
        return defaultValue;
    }
    return this.map(selector).sort(Sorters.desc)[0];

    // return this.reduce((x, el) => {
    //     let order = el.Order();
    //     return x == undefined ? order : (order > x ? order : o);
    // }, undefined);
};

Array.prototype.min = function (selector: (element: any) => any, defaultValue?: any): any {
    if (this.length == 0) {
        return defaultValue;
    }
    return this.map(selector).sort(Sorters.asc)[0];
};

Array.prototype.orderBy = function (selector: (element: any) => any): any[] {
    return this.slice(0).sort((a, b) => Sorters.asc(selector(a), selector(b)));
};

Array.prototype.orderByDesc = function (selector: (element: any) => any): any[] {
    return this.slice(0).sort((a, b) => Sorters.desc(selector(a), selector(b)));
};

// Array.prototype.groupBy = function (key: string): { [key: string]: any[] } {
// 	return this.reduce((result, item) => {
// 		const value = item[key].toString();
// 		(result[item[key]] = result[item[key]] || []).push(item);
// 		return result;
// 	}, {});
// };

Array.prototype.groupBy = function (selector: (element: any) => string): { [key: string]: any[] } {
    return this.reduce((result, item) => {
        const value = selector(item); //.toString()
        (result[value] = result[value] || []).push(item);
        return result;
    }, {});
};

class Filters {
    static notNull(element: any): boolean {
        return element != null;
    }

    static notUndefined(element: any): boolean { // notMissing
        return element != undefined;
    }

    static notEmpty(element: any): boolean {
        return element !== '';
    }

    // unique
    static distinct(element, index, self) {
        return self.indexOf(element) === index;
    }
}

// distinctBy/uniqueBy
Array.prototype.distinct = function (selector?: (element: any) => any): any[] {
    if (!selector) {
        return this.filter(Filters.distinct);
        // return this.sort().filter(function (element, index, self) {
        //     return !index || element != self[index - 1];
        // });
    }

    // let keys = {}; // elements/items
    // return this.filter(function (element) {
    //     const key = selector(element);
    //     return keys.hasOwnProperty(key) ? false : (keys[key] = true);
    // });

    let keys = []; // elements/items
    return this.filter(function (element) {
        const key = selector(element);
        return keys.indexOf(key) >= 0 ? false : keys.push(key);
    });
};

// copyFrom
Array.prototype.copy = function (src: any[], srcIndex = 0, dstIndex = 0, length?: number) {
    return copyArray(src, this, srcIndex, dstIndex, length);
}

Array.prototype.copyTo = function (dst: any[], srcIndex = 0, dstIndex = 0, length?: number) {
    return copyArray(this, dst, srcIndex, dstIndex, length);
}

function copyArray(src: any[], dst: any[], srcIndex = 0, dstIndex = 0, length?: number) {
    if (srcIndex == undefined || srcIndex < 0) {
        srcIndex = 0;
    }
    if (dstIndex == undefined || dstIndex < 0) {
        dstIndex = 0;
    }
    if (length == undefined) {
        length = Math.min(src.length, src.length - srcIndex);
    }
    let j = dstIndex;
    for (let i = srcIndex; i < length; i++) {
        dst[j] = src[i];
        j++;
    }
    return dst;
}