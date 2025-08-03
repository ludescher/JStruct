import { deepFreeze, IMMUTABLE_TRAPS, MUTABLE_TRAPS, normalizeValidator } from "./Utils";
import ValidatorMapType from "./ValidatorMapType";

class StructBase<T extends object> {
    private _data: T;

    private constructor(data: T) {
        this._data = data;
    }

    static createMutable<T extends object>(
        defaults: T,
        rawValidators: Record<keyof T, any>,
        override: Partial<T> = {}
    ): StructBase<T> & T {
        // 1. Normalize every rawValidators[k] → (x: unknown) => T[K]
        const validators = {} as ValidatorMapType<T>;
        for (const k in rawValidators) {
            validators[k] = normalizeValidator(k, rawValidators[k]);
        }

        // 2. Merge + run validators exactly once on override
        const merged = { ...defaults } as T;
        for (const k in override) {
            if (override[k] !== undefined) {
                merged[k] = validators[k]!(override[k]);
            }
        }

        Object.preventExtensions(merged);
        const inst = new StructBase(merged);
        return new Proxy(inst, MUTABLE_TRAPS) as StructBase<T> & T;
    }

    static createImmutable<T extends object>(
        defaults: T,
        rawValidators: Record<keyof T, any>,
        override: Partial<T> = {}
    ): StructBase<T> & Readonly<T> {
        // 1. Normalize every rawValidators[k] → (x: unknown) => T[K]
        const validators = {} as ValidatorMapType<T>;
        for (const k in rawValidators) {
            validators[k] = normalizeValidator(k, rawValidators[k]);
        }

        // 2. Merge + run validators exactly once on override
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