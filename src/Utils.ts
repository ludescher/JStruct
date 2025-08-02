export function deepFreeze<U extends object>(obj: U): U {
    Object.getOwnPropertyNames(obj).forEach(key => {
        const val = (obj as any)[key];
        if (val && typeof val === "object") {
            deepFreeze(val);
        }
    });
    return Object.freeze(obj);
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

    defineProperty() {
        throw new TypeError("Cannot define property on struct");
    },

    deleteProperty() {
        throw new TypeError("Cannot delete property on struct");
    }
} as const;

export const IMMUTABLE_TRAPS: ProxyHandler<any> = {
    get(target, prop, receiver) {
        const val = Reflect.get(target, prop, receiver);
        if (typeof prop === "string" && prop in (target as any)._data) {
            return (target as any)._data[prop];
        }
        return typeof val === "function" ? val.bind(target) : val;
    },

    set() {
        throw new TypeError("Cannot modify readonly struct");
    },

    defineProperty() {
        throw new TypeError("Cannot define property on readonly struct");
    },

    deleteProperty() {
        throw new TypeError("Cannot delete property on readonly struct");
    }
} as const;