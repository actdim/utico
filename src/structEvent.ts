import { Struct } from "./typeCore";

export class StructEvent<
    TStruct extends Record<string, any>,
    TTarget extends StructEventTarget<TStruct>,
    TType extends Extract<keyof TStruct, string> = Extract<keyof TStruct, string>
> extends CustomEvent<TStruct[TType]> {
    target: TTarget;
    // currentTarget: TTarget;
    type: TType;
    constructor(type: TType, eventInitDict?: CustomEventInit<TStruct[TType]> & { target: TTarget }) {
        super(type, eventInitDict);
        this.target = eventInitDict.target;
    }
}

// TKeys extends Extract<keyof TStruct, string> = Extract<keyof TStruct, string>>
// StructEventDispatcher
export class StructEventTarget<TStruct extends Record<string, any>> extends EventTarget implements StructEventTarget<TStruct> {
    constructor() {
        super();
    }

    addEventListener<K extends Extract<keyof TStruct, string>>(
        type: K,
        listener: (event: StructEvent<TStruct, this, K>) => void,
        options?: boolean | AddEventListenerOptions
    ): void {
        super.addEventListener(type, listener, options);
    }

    removeEventListener<K extends Extract<keyof TStruct, string>>(
        type: K,
        listener: (event: StructEvent<TStruct, this, K>) => void,
        options?: boolean | EventListenerOptions
    ): void {
        super.removeEventListener(type, listener);
    }

    dispatchEvent<K extends Extract<keyof TStruct, string>>(event: StructEvent<TStruct, this, K>): boolean {
        return super.dispatchEvent(event);
    }

    hasEventListener<K extends Extract<keyof TStruct, string>>(type: K, listener: (event: StructEvent<TStruct, this, K>) => void): boolean {
        throw new Error("Method not implemented.");
    }
}
