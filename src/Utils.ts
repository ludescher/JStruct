import ValidatorFunctionType from "./ValidatorFunctionType";

export function deepFreeze<T>(obj: T, seen = new WeakSet()): T {
    // non-objects or already frozen? bail out
    if (obj == null || typeof obj !== "object" || Object.isFrozen(obj)) {
        return obj;
    }

    // cycle check
    if (seen.has(obj)) {
        return obj;
    }
    seen.add(obj);

    // freeze all nested props first
    for (const key of Object.getOwnPropertyNames(obj)) {
        // @ts-ignore
        deepFreeze((obj as any)[key], seen);
    }

    // then freeze self
    return Object.freeze(obj);
}

export function normalizeValidator<T>(key: string, v: any): (x: unknown) => T {
    if (typeof v === "function" && v.length === 1) {
        return v as ValidatorFunctionType<T>;
    }

    if (v === String || v === Number || v === Boolean) {
        return (x: unknown) => {
            const result = (v as any)(x);
            if (typeof result !== typeof (v as any)()) {
                throw new TypeError(`Property "${key}" expected ${v.name}`);
            }
            return result;
        };
    }

    if (Array.isArray(v) && v.length === 1) {
        const fn = normalizeValidator(key, v[0]);
        return (x: unknown) => {
            if (!Array.isArray(x)) {
                throw new TypeError(`Property "${key}" expected array`);
            }
            return x.map(fn) as any as T;
        };
    }

    throw new TypeError(`Invalid validator for property "${key}"`);
}

export const MUTABLE_TRAPS: ProxyHandler<any> = {
    get(target, prop, receiver) {
        const val = Reflect.get(target, prop, receiver);
        if (typeof prop === "string" && prop in target._data) {
            return target._data[prop];
        }
        return typeof val === "function" ? val.bind(target) : val;
    },

    set(target, prop, value) {
        // Only allow updating existing fields on _data
        if (typeof prop === "string" && prop in target._data) {
            // Validate? You can re-run validators here if needed
            target._data[prop] = value;
            return true;
        }
        throw new TypeError(
            `Cannot add new property '${String(prop)}' to struct`
        );
    },

    // 1a) make `in` work
    has(target, prop) {
        return Reflect.has(target._data, prop);
    },

    // 1b) enumerate only real keys
    ownKeys(target) {
        return Reflect.ownKeys(target._data);
    },

    // 1c) show those keys as enumerable props
    getOwnPropertyDescriptor(target, prop) {
        if (Reflect.has(target._data, prop)) {
            return {
                configurable: true,
                enumerable: true,
                writable: true,
                value: target._data[prop as string],
            };
        }
        return Reflect.getOwnPropertyDescriptor(target, prop);
    },

    defineProperty(target, prop, desc) {
        // leave existing behavior, if you already proxy this
        return Reflect.defineProperty(target._data, prop, desc);
    },

    deleteProperty() {
        throw new TypeError("Cannot delete property on struct");
    }
} as const;

export const IMMUTABLE_TRAPS: ProxyHandler<any> = {
    get: MUTABLE_TRAPS.get!,
    has: MUTABLE_TRAPS.has!,
    ownKeys: MUTABLE_TRAPS.ownKeys!,
    getOwnPropertyDescriptor: MUTABLE_TRAPS.getOwnPropertyDescriptor!,

    set(target, prop, value) {
        // allow reassigning existing keys, block new keys
        if (Reflect.has(target._data, prop)) {
            target._data[prop as string] = value;
            return true;
        }
        throw new TypeError("Cannot modify readonly struct");
    },

    defineProperty() {
        throw new TypeError("Cannot define property on readonly struct");
    },

    deleteProperty() {
        throw new TypeError("Cannot delete property on readonly struct");
    }
} as const;