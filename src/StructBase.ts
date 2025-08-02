import { deepFreeze, IMMUTABLE_TRAPS, MUTABLE_TRAPS } from "./Utils";
import ValidatorMapType from "./ValidatorMapType";

class StructBase<T extends object> {
    private _data: T;

    private constructor(data: T) {
        this._data = data;
    }

    static createMutable<T extends object>(
        defaults: T,
        validators: ValidatorMapType<T>,
        override: Partial<T> = {}
    ): StructBase<T> & T {
        // Merge + validate
        const merged = { ...defaults } as T;
        for (const k in override) {
            if (override[k] !== undefined) {
                merged[k] = validators[k]!(override[k]);
            }
        }

        // Prevent new properties on merged
        Object.preventExtensions(merged);

        // Wrap in proxy
        const inst = new StructBase(merged);
        return new Proxy(inst, MUTABLE_TRAPS) as StructBase<T> & T;
    }

    static createImmutable<T extends object>(
        defaults: T,
        validators: ValidatorMapType<T>,
        override: Partial<T> = {}
    ): StructBase<T> & Readonly<T> {
        // merge + validate
        const merged = { ...defaults } as T;
        for (const k in override) {
            if (override[k] !== undefined) {
                merged[k] = validators[k]!(override[k]);
            }
        }
        const frozen = deepFreeze(merged);

        // wrap
        const inst = new StructBase(frozen);

        return new Proxy(inst, IMMUTABLE_TRAPS) as StructBase<T> & Readonly<T>;

    }

    toJSON() {
        return this._data;
    }
}

export default StructBase;