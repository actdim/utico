export function copyArray(src: any[], dst: any[], srcIndex = 0, dstIndex = 0, length?: number) {    
    return dst.copy(src, srcIndex, dstIndex, length);
}