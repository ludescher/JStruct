import { normalizeValidator } from "./Utils";
import ValidatorMapType from "./ValidatorMapType";

abstract class Struct {
    public constructor() { }

    protected static create<T extends object>(
        defaults: T,
        rawValidators: Record<keyof T, any>,
        override: Partial<T> = {}
    ): T {
        // normalize subclass's Validators → strict, throwing validators
        const VALIDATORS = {} as ValidatorMapType<T>;

        for (const k in rawValidators) {
            VALIDATORS[k] = normalizeValidator(k, rawValidators[k]);
        }

        // run validators on *every* default property
        for (const k in VALIDATORS) {
            defaults[k] = VALIDATORS[k](defaults[k]);
        }

        for (const k in override) {
            if (VALIDATORS[k] === undefined) {
                throw new TypeError(`Property "${k}" does not exist on "${this.name}"!`);
            } else {
                defaults[k] = VALIDATORS[k](override[k]);
            }
        }

        const OBJECT_TARGET: Partial<{ structname: string; data: T; }> = {};

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

        // proxy that re-validates on `set`
        return new Proxy<typeof OBJECT_TARGET>(OBJECT_TARGET, {
            has(target, prop) { // make `in` work
                return Reflect.has(target.data!, prop);
            },

            ownKeys(target) { // enumerate only real keys
                return Reflect.ownKeys(target);
            },

            getOwnPropertyDescriptor(target, prop) { // show those keys as enumerable props
                if (Reflect.has(target.data!, prop)) {
                    return {
                        configurable: true,
                        enumerable: true,
                        writable: true,
                        value: target.data![prop as keyof T],
                    };
                }
                return Reflect.getOwnPropertyDescriptor(target, prop);
            },

            get(target, prop, receiver) {
                if (typeof prop === "string" && Reflect.has(target.data!, prop)) {
                    return target.data![prop as keyof T];
                }

                const val = Reflect.get(target, prop, receiver);

                return typeof val === "function" ? val.bind(target) : undefined;
            },

            set(target, prop, value) {
                // Only allow updating existing fields on _data
                if (typeof prop === "string" && Reflect.has(target.data!, prop)) {
                    if (prop in VALIDATORS) {
                        target.data![prop as keyof T] = VALIDATORS[prop as keyof T](value);
                    } else {
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
        }) as Readonly<T>;
    }
}

export default Struct;