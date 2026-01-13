const DOMURL = window.URL || window.webkitURL;

export function createCanvas(w: number, h: number /*, dpi?: number*/) {
    const canvas = document.createElementNS("http://www.w3.org/1999/xhtml", "canvas") as HTMLCanvasElement;
    // if (!dpi) {
    //     dpi = window.devicePixelRatio;
    // }
    // context2d
    const context = canvas.getContext("2d");
    if (context) {
        // context.imageSmoothingEnabled = true;
        // context.mozImageSmoothingEnabled = true;
        // context.oImageSmoothingEnabled = true;
        // context.webkitImageSmoothingEnabled = true;
        context["imageSmoothingQuality"] = "high";
    }
    canvas.width = w;
    // canvas.width = w * dpi;
    canvas.height = h;
    // canvas.height = h * dpi;

    // canvas.style.width = w + "px";
    // context.scale(dpi, dpi);
    return { canvas, context };
}

const supportExtendedMetrics = "actualBoundingBoxRight" in TextMetrics.prototype;

export type TextSizeProvider = (fontSize: number) => [number, number];

export function fitText(
    ctx: CanvasRenderingContext2D,
    text = "",
    sizeProvider: TextSizeProvider,
    targetWidth = ctx.canvas.width,
    fontFamily = "Arial"
) {
    let fontSize = 1;
    const updateFont = () => {
        ctx.font = fontSize + "px " + fontFamily;
    };
    updateFont();
    let width = getBBOxWidth(text);
    // first pass width increment = 1
    while (width && width <= targetWidth) {
        fontSize++;
        updateFont();
        width = getBBOxWidth(text);
    }
    // second pass, the other way around, with increment = -0.1
    while (width && width > targetWidth) {
        fontSize -= 0.1;
        updateFont();
        width = getBBOxWidth(text);
    }
    // revert to last valid step
    fontSize += 0.1;
    updateFont();

    // we need to measure where our bounding box actually starts
    const offsetLeft = ctx.measureText(text).actualBoundingBoxLeft || 0;
    const [x, y] = sizeProvider(fontSize);
    ctx.fillText(text, x + offsetLeft, y);

    function getBBOxWidth(text) {
        const measure = ctx.measureText(text);

        return supportExtendedMetrics ? measure.actualBoundingBoxLeft + measure.actualBoundingBoxRight : measure.width;
    }
}

function encodeUnicode(str: any) {
    // +("0x" + s)
    return window.encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, s) => String.fromCharCode(parseInt(s, 16)));
    // old way
    // return window.unescape(window.encodeURIComponent(str))
}

export const html2Svg = (() => {
    const xmlSerializer = new XMLSerializer();
    return async (elements: HTMLElement[], viewBoxSize: number[], css: string) => {
        const w = viewBoxSize[0];
        const h = viewBoxSize[1];

        let html = elements
            .map(
                (el) => `<foreignObject width="${w}" height="${h}">
            <body xmlns="http://www.w3.org/1999/xhtml">
                ${el.outerHTML}
            </body>
        </foreignObject>`
            )
            .join("");
        html = `<style>${css}</style>${html}`;

        var svgElement = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svgElement.setAttributeNS(null, "viewBox", `0 0 ${w} ${h}`);
        svgElement.setAttributeNS(null, "width", w + "");
        svgElement.setAttributeNS(null, "height", h + "");
        svgElement.innerHTML = html;

        return xmlSerializer.serializeToString(svgElement); // svg string
    };
})();

export function getSvgImageObjectUrl(svgData: string) {
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    return DOMURL.createObjectURL(svgBlob);
}

export function getSvgImageDataUrl(svgData: string) {
    const svgBase64 = window.btoa(encodeUnicode(svgData));
    return "data:image/svg+xml;base64," + svgBase64;
    // without base64 encoding (ok for simple SVGs):
    // return "data:image/svg+xml;charset=utf-8," + window.encodeURIComponent(svgData); // "data:image/svg+xml;utf8,"; - incorrect!
}

// querySvgDataUrl
export const querySvgData = (() => {
    const xmlSerializer = new XMLSerializer();
    return (selector: string) => {
        const svg = document.querySelector(selector);
        const svgData = xmlSerializer.serializeToString(svg);
        return svgData;
    };
})();

export function toObjectUrl(canvas: HTMLCanvasElement, mimeType = "image/png", quality?: number) {
    // 'image/jpeg', 'image/webp'
    return new Promise<string>((res, rej) => {
        try {
            canvas.toBlob(
                (blob) => {
                    res(URL.createObjectURL(blob));
                },
                mimeType,
                quality
            );
        } catch (err) {
            rej(err);
        }
    });
}

export function drawImage(src: string, context: CanvasRenderingContext2D) {
    return new Promise<void>((res, rej) => {
        try {
            const image = new Image();
            // const image = document.createElement('img');
            image.crossOrigin = "anonymous";
            image.onload = () => {
                // image.naturalWidth, image.naturalHeight
                context.drawImage(image, 0, 0, image.width, image.height, 0, 0, context.canvas.width, context.canvas.height);
                res();
            };
            image.src = src;
        } catch (err) {
            rej(err);
        }
    });
}

export const drawSvg = (svgData: string, context: CanvasRenderingContext2D, useDataUrl = false) => {
    const imageSrc = useDataUrl ? getSvgImageDataUrl(svgData) : getSvgImageObjectUrl(svgData);
    return drawImage(imageSrc, context).finally(() => DOMURL.revokeObjectURL(imageSrc));
};

/*
export function canvasToImage(canvas: HTMLCanvasElement, size?: number[], mimeType = "image/png", quality?: number) {
    // const image = document.createElement("img")
    const image = new Image();
    image.crossOrigin = "anonymous";
    if (size) {
        if (size[0]) {
            image.width = size[0];
        }
        if (size[1]) {
            image.height = size[1];
        }
    }
    const imageSrc = canvas.toDataURL(mimeType, quality);
    image.src = imageSrc;
    return image;
}
*/

export async function canvasToImage(canvas: HTMLCanvasElement, size?: number[], mimeType = "image/png", quality?: number) {
    // document.createElement("img")
    const image = new Image();
    image.crossOrigin = "anonymous";
    if (size) {
        if (size[0]) {
            image.width = size[0];
        }
        if (size[1]) {
            image.height = size[1];
        }
    }
    const imageSrc = await toObjectUrl(canvas, mimeType, quality);
    image.onload = () => DOMURL.revokeObjectURL(imageSrc);
    image.src = imageSrc;
    return image;
}

export async function objectUrlToDataURL(objectUrl: string): Promise<string> {
    const response = await fetch(objectUrl);
    const blob = await response.blob();

    return new Promise((res, rej) => {
        try {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.readAsDataURL(blob);
        } catch (err) {
            rej(err);
        }
    });
}

export const getSvgSize = (() => {
    const domParser = new DOMParser();
    return (svg: string) => {
        const svgDom = domParser.parseFromString(svg, "text/xml");
        // svgElement/svgNode
        // const svgDoc = svgDom.documentElement;
        const svgDoc = svgDom.querySelector("svg");
        return getSvgElementSize(svgDoc);
    };
})();

export function getSvgElementSize(svgDoc: SVGSVGElement): [number, number] {
    let w = 0;
    if (svgDoc.width.baseVal.unitType === 5) {
        // units - pixels
        w = svgDoc.width.baseVal.value;
    }
    if (!w) {
        w = svgDoc.width.baseVal.value;
    }
    if (!w) {
        w = svgDoc.viewBox.baseVal.width;
    }

    let h = 0;
    if (svgDoc.height.baseVal.unitType === 5) {
        // units - pixels
        h = svgDoc.height.baseVal.value;
    }
    if (!h) {
        h = svgDoc.height.baseVal.value;
    }
    if (!h) {
        h = svgDoc.viewBox.baseVal.height;
    }

    // const attributes = svgDoc.attributes;
    // see also:
    // attributes.getNamedItem("viewBox").value
    // attributes.getNamedItem('width').value - with units
    // attributes.getNamedItem('height').value - with units

    return [w, h];
}

export const refineSvg = (() => {
    const domParser = new DOMParser();
    return (data: string) => {
        const svgDom = domParser.parseFromString(data, "text/xml");
        // const svgDoc = svgDom.documentElement;
        const svgDoc = svgDom.querySelector("svg");
        const size = getSvgElementSize(svgDoc);
        // workaround for https://bugzilla.mozilla.org/show_bug.cgi?id=700533#c39
        svgDoc.setAttribute("width", `${size[0]}px`);
        svgDoc.setAttribute("height", `${size[1]}px`);
        return svgDoc.outerHTML;
    };
})();

export function drawRoundedRect(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r:
        | number
        | {
              tl: number;
              tr: number;
              br: number;
              bl: number;
          }
) {
    if (typeof r === "number") {
        r = { tl: r, tr: r, br: r, bl: r };
    } else {
        const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
        for (let side in defaultRadius) {
            r[side] = r[side] || defaultRadius[side];
        }
    }
    context.beginPath();
    context.moveTo(x + r.tl, y);
    context.lineTo(x + w - r.tr, y);
    context.quadraticCurveTo(x + w, y, x + w, y + r.tr);
    context.lineTo(x + w, y + h - r.br);
    context.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
    context.lineTo(x + r.bl, y + h);
    context.quadraticCurveTo(x, y + h, x, y + h - r.bl);
    context.lineTo(x, y + r.tl);
    context.quadraticCurveTo(x, y, x + r.tl, y);
    context.closePath();

    // context.fill();
    // context.stroke();

    // simple but less accurate
    // if (w < 2 * r) {
    //     r = w / 2;
    // }
    // if (h < 2 * r) {
    //     r = h / 2;
    // }
    // context.beginPath();
    // context.moveTo(x + r, y);
    // context.arcTo(x + w, y, x + w, y + h, r);
    // context.arcTo(x + w, y + h, x, y + h, r);
    // context.arcTo(x, y + h, x, y, r);
    // context.arcTo(x, y, x + w, y, r);
    // context.closePath();

    // https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
    // + other: https://newfivefour.com/javascript-canvas-rounded-rectangle.html
}
