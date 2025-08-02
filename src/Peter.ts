enum SoilType {
    Standard,
    Mager,
    Sonder,
    Poinsettie,
    Cyclame,
}

enum PotColor {
    Terra,
    Schwarz,
    Bio13,
    Confetti,
}

// 1. deepFreeze helper
function deepFreeze<U extends object>(obj: U): U {
    Object.getOwnPropertyNames(obj).forEach(key => {
        const val = (obj as any)[key];
        if (val && typeof val === "object") {
            deepFreeze(val);
        }
    });
    return Object.freeze(obj);
}

const mutableTraps: ProxyHandler<any> = {
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
};

// immutableTraps.ts
const immutableTraps: ProxyHandler<any> = {
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
};

// 2. Validator types
type ValidatorFn<X> = (raw: unknown) => X;
type ValidatorMap<X> = { [K in keyof X]: ValidatorFn<X[K]> };

// 3. The base class with static factory
class StructBase<T extends object> {
    private _data: T;

    private constructor(data: T) {
        this._data = data;
    }

    static createMutable<T extends object>(
        defaults: T,
        validators: ValidatorMap<T>,
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
        return new Proxy(inst, mutableTraps) as StructBase<T> & T;
    }

    static createImmutable<T extends object>(
        defaults: T,
        validators: ValidatorMap<T>,
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

        return new Proxy(inst, immutableTraps) as StructBase<T> & Readonly<T>;

    }

    toJSON() {
        return this._data;
    }
}

// 4. Your domain example
interface ISoilData {
    row: number;
    topf: string;
    woche: number;
    amount: number;
    potcolor: PotColor;
    soiltype: SoilType;
}

// 2a. Defaults
const defaultSoilData: ISoilData = {
    row: 0,
    topf: "",
    woche: 0,
    amount: 0,
    potcolor: PotColor.Terra,
    soiltype: SoilType.Standard,
};

// 2b. Validators
const soilValidators: ValidatorMap<ISoilData> = {
    row: raw =>
        typeof raw === "number"
            ? raw
            : (() => { throw new TypeError("row must be a number"); })(),
    topf: raw =>
        typeof raw === "string"
            ? raw
            : (() => { throw new TypeError("topf must be a string"); })(),
    woche: raw =>
        typeof raw === "number"
            ? raw
            : (() => { throw new TypeError("woche must be a number"); })(),
    amount: raw =>
        typeof raw === "number"
            ? raw
            : (() => { throw new TypeError("amount must be a number"); })(),
    potcolor: raw =>
        typeof raw === "number" && raw in PotColor
            ? (raw as PotColor)
            : (() => { throw new TypeError("invalid potcolor"); })(),
    soiltype: raw =>
        typeof raw === "number" && raw in SoilType
            ? (raw as SoilType)
            : (() => { throw new TypeError("invalid soiltype"); })(),
};

class SoilData {
    public static createImmutable = StructBase.createImmutable.bind(StructBase);
    public static createMutable = StructBase.createMutable.bind(StructBase);

    private constructor() { } // never used

    public static of(data: Partial<ISoilData> = {}) {
        return this.createImmutable(defaultSoilData, soilValidators, data);
    }

    public static ofMutable(data: Partial<ISoilData> = {}) {
        return this.createMutable(defaultSoilData, soilValidators, data);
    }
}

// Usage:

// Immutable — shape and values locked
const im = SoilData.of({ row: 1 });
im.row = 2;      // ❌ TypeError
(im as any).newProp = 5; // ❌ TypeError

// Mutable—but fixed shape
const mu = SoilData.ofMutable({ row: 3 });
mu.row = 10;     // ✅ allowed
mu.amount = 7;   // ✅ allowed
(mu as any).foo = "bar"; // ❌ TypeError
