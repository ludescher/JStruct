import { normalizeValidator } from "./Utils";
class Struct {
    static PatchInstanceOf() {
        if (this.PATCHED_CLASSES.has(this) === false) {
            Object.defineProperty(this, Symbol.hasInstance, {
                value: (obj) => {
                    return obj?.constructor?.name === this.name;
                },
                configurable: true
            });
            this.PATCHED_CLASSES.add(this);
        }
    }
    constructor() {
        throw new Error(`The constructor of a Struct cannot be called! use "of" instead!`);
    }
    static create(defaults, rawValidators, override = {}) {
        this.PatchInstanceOf();
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
        const DATA_KEY = Symbol('hidden');
        const OBJECT_TARGET = { [DATA_KEY]: defaults };
        Object.defineProperty(OBJECT_TARGET, 'constructor', {
            value: { name: this.name },
            writable: false,
            enumerable: false,
            configurable: false
        });
        for (const prop in defaults) {
            Object.defineProperty(OBJECT_TARGET, prop, {
                get() {
                    return OBJECT_TARGET[DATA_KEY][prop];
                },
                set(value) {
                    if (prop in VALIDATORS) {
                        OBJECT_TARGET[DATA_KEY][prop] = VALIDATORS[prop](value);
                    }
                    else {
                        throw new TypeError(`Validator for property "${String(prop)}" is not defined on "${this.name}"!`);
                    }
                },
                enumerable: true,
                configurable: true
            });
        }
        Object.preventExtensions(OBJECT_TARGET);
        Object.seal(OBJECT_TARGET);
        Object.freeze(OBJECT_TARGET);
        return OBJECT_TARGET;
    }
}
Struct.PATCHED_CLASSES = new WeakSet();
export default Struct;
//# sourceMappingURL=Struct.js.map