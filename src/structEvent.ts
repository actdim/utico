import { Struct } from "./typeCore";

export class StructEvent<
    TStruct extends Record<string, any>,
    TTarget extends StructEventTarget<TStruct>,
    TType extends Extract<keyof TStruct, string> = Extract<keyof TStruct, string>
> extends CustomEvent<TStruct[TType]> {
    // with useDefineForClassFields: false (in tsconfig), TypeScript compiles class fields using legacy assignment semantics 
    // instead of native ES2022 Object.defineProperty.
    // declare readonly type: TType;    
    get type() {
        return super.type as TType;
    }
    // readonly type: TType;
    target: TTarget;
    constructor(type: TType, eventInitDict?: CustomEventInit<TStruct[TType]> & { target: TTarget }) {
        super(type, eventInitDict);
        // this.type = type; // without declare
        this.target = eventInitDict.target;
    }
}

// TKeys extends Extract<keyof TStruct, string> = Extract<keyof TStruct, string>>
// StructEventDispatcher
export class StructEventTarget<TStruct extends Record<string, any>> extends EventTarget implements StructEventTarget<TStruct> {
    private _listenerRegistry = new Map<string, Set<Function>>();

    constructor() {
        super();
    }

    addEventListener<K extends Extract<keyof TStruct, string>>(
        type: K,
        listener: (event: StructEvent<TStruct, this, K>) => void,
        options?: boolean | AddEventListenerOptions
    ): void {
        let set = this._listenerRegistry.get(type);
        if (!set) {
            set = new Set();
            this._listenerRegistry.set(type, set);
        }
        set.add(listener);
        super.addEventListener(type, listener, options);
    }

    removeEventListener<K extends Extract<keyof TStruct, string>>(
        type: K,
        listener: (event: StructEvent<TStruct, this, K>) => void,
        options?: boolean | EventListenerOptions
    ): void {
        this._listenerRegistry.get(type)?.delete(listener);
        super.removeEventListener(type, listener);
    }

    dispatchEvent<K extends Extract<keyof TStruct, string>>(event: StructEvent<TStruct, StructEventTarget<TStruct>, K>): boolean {
        return super.dispatchEvent(event);
    }

    hasEventListener<K extends Extract<keyof TStruct, string>>(type: K, listener: (event: StructEvent<TStruct, StructEventTarget<TStruct>, K>) => void): boolean {
        return this._listenerRegistry.get(type)?.has(listener) ?? false;
    }
}
