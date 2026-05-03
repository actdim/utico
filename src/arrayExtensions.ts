
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
    return this.reduce((best: any, el: any) => {
        const v = selector(el);
        return best === undefined || v > best ? v : best;
    }, undefined);
};

Array.prototype.min = function (selector: (element: any) => any, defaultValue?: any): any {
    if (this.length == 0) {
        return defaultValue;
    }
    return this.reduce((best: any, el: any) => {
        const v = selector(el);
        return best === undefined || v < best ? v : best;
    }, undefined);
};

Array.prototype.orderBy = function (selector: (element: any) => any): any[] {
    return this.slice(0).sort((a, b) => {
        const va = selector(a), vb = selector(b);
        return va === vb ? 0 : va > vb ? 1 : -1;
    });
};

Array.prototype.orderByDesc = function (selector: (element: any) => any): any[] {
    return this.slice(0).sort((a, b) => {
        const va = selector(a), vb = selector(b);
        return va === vb ? 0 : va > vb ? -1 : 1;
    });
};

Array.prototype.groupBy = function (selector: (element: any) => string): { [key: string]: any[] } {
    return this.reduce((result, item) => {
        const value = selector(item);
        (result[value] = result[value] || []).push(item);
        return result;
    }, {});
};

// distinctBy/uniqueBy
Array.prototype.distinct = function (selector?: (element: any) => any): any[] {
    if (!selector) {
        return [...new Set(this)];
    }
    const seen = new Set();
    return this.filter(function (element) {
        const key = selector(element);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
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
    if (srcIndex < 0) {
        srcIndex = 0;
    }
    if (dstIndex < 0) {
        dstIndex = 0;
    }
    if (length == undefined) {
        length = src.length - srcIndex;
    }
    let j = dstIndex;
    for (let i = srcIndex; i < srcIndex + length; i++) {
        dst[j] = src[i];
        j++;
    }
    return dst;
}