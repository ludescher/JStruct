import { normalizeValidator } from "./Utils";
import ValidatorMapType from "./ValidatorMapType";

abstract class Struct {
    private static PATCHED_CLASSES = new WeakSet<Function>();

    private static PatchInstanceOf(): void {
        if (this.PATCHED_CLASSES.has(this) === false) {
            Object.defineProperty(this, Symbol.hasInstance, {
                value: (obj: any) => {
                    return obj?.constructor?.name === this.name;
                },
                configurable: true
            });

            this.PATCHED_CLASSES.add(this);
        }
    }

    public constructor() {
        throw new Error(`The constructor of a Struct cannot be called! use "of" instead!`);
    }

    protected static create<T extends object>(
        defaults: T,
        rawValidators: Record<keyof T, any>,
        override: Partial<T> = {}
    ): T {
        this.PatchInstanceOf();

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

        const DATA_KEY: unique symbol = Symbol('hidden');
        const OBJECT_TARGET: Partial<T & { [DATA_KEY]: T; }> = { [DATA_KEY]: defaults as T } as T;

        Object.defineProperty(OBJECT_TARGET, 'constructor', {
            value: { name: this.name },
            writable: false,
            enumerable: false,
            configurable: false
        });

        for (const prop in defaults) {
            Object.defineProperty(OBJECT_TARGET, prop, {
                get() {
                    return OBJECT_TARGET[DATA_KEY]![prop];
                },
                set(value) {
                    if (prop in VALIDATORS) {
                        (OBJECT_TARGET[DATA_KEY]![prop as keyof T] as T[keyof T]) = VALIDATORS[prop as keyof T](value);
                    } else {
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

        return OBJECT_TARGET as T;
    }
}

export default Struct;