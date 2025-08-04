import { normalizeValidator } from "./Utils";
class Struct {
    constructor() { }
    static create(defaults, rawValidators, override = {}) {
        const VALIDATORS = {};
        for (const k in rawValidators) {
            VALIDATORS[k] = normalizeValidator(k, rawValidators[k]);
        }
        for (const k in VALIDATORS) {
            defaults[k] = VALIDATORS[k](defaults[k]);
        }
        for (const k in override) {
            if (VALIDATORS[k] === undefined) {
                throw new TypeError(`Property "${k}" does not exist on "${this.name}"!`);
            }
            else {
                defaults[k] = VALIDATORS[k](override[k]);
            }
        }
        const OBJECT_TARGET = {};
        Object.defineProperty(OBJECT_TARGET, "structname", {
            value: this.name,
            configurable: false,
            enumerable: false,
        });
        Object.defineProperty(OBJECT_TARGET, "data", {
            value: defaults,
            configurable: false,
            enumerable: false,
        });
        for (const prop in defaults) {
            Object.defineProperty(OBJECT_TARGET, prop, {
                value: undefined,
                configurable: true,
                enumerable: true,
            });
        }
        Object.preventExtensions(OBJECT_TARGET);
        return new Proxy(OBJECT_TARGET, {
            has(target, prop) {
                return Reflect.has(target.data, prop);
            },
            ownKeys(target) {
                return Reflect.ownKeys(target);
            },
            getOwnPropertyDescriptor(target, prop) {
                if (Reflect.has(target.data, prop)) {
                    return {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: target.data[prop],
                    };
                }
                return Reflect.getOwnPropertyDescriptor(target, prop);
            },
            get(target, prop, receiver) {
                if (typeof prop === "string" && Reflect.has(target.data, prop)) {
                    return target.data[prop];
                }
                const UNKNOWN_VALUE = Reflect.get(target, prop, receiver);
                return typeof UNKNOWN_VALUE === "function" ? UNKNOWN_VALUE.bind(target) : undefined;
            },
            set(target, prop, value) {
                if (typeof prop === "string" && Reflect.has(target.data, prop)) {
                    if (prop in VALIDATORS) {
                        target.data[prop] = VALIDATORS[prop](value);
                    }
                    else {
                        throw new TypeError(`Validator for property "${String(prop)}" is not defined on "${target.structname}"!`);
                    }
                    return true;
                }
                throw new TypeError(`Cannot add new property "${String(prop)}" on readonly "${target.structname}"!`);
            },
            defineProperty(target) { throw new TypeError(`Cannot define property on "${target.structname}"!`); },
            deleteProperty(target) { throw new TypeError(`Cannot delete property on "${target.structname}"!`); },
            isExtensible(target) {
                return Object.isExtensible(target);
            },
            preventExtensions(target) {
                Object.preventExtensions(target);
                return !Object.isExtensible(target);
            },
            getPrototypeOf(target) {
                return Object.getPrototypeOf(target);
            },
            setPrototypeOf() {
                return false;
            },
            apply(target) {
                throw new TypeError(`Cannot call "${target.structname}" as function!`);
            },
            construct(target) {
                throw new TypeError(`Cannot construct "${target.structname}"!`);
            },
        });
    }
}
export default Struct;
//# sourceMappingURL=Struct.js.map