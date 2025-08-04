import ValidatorFunctionType from "./ValidatorFunctionType";

export function normalizeValidator<T>(key: string, v: any): (x: unknown) => T {
    if (v === String || v === Number || v === Boolean) {
        return (x: unknown) => {
            if (typeof x !== typeof (v as any)()) {
                throw new TypeError(`Property "${key}" expected ${v.name} and not "${x}" of type "${typeof x}"!`);
            }

            return x as T;
        };
    }

    if (Array.isArray(v) && v.length === 1) {
        const VALIDATOR_FUNCTION = normalizeValidator(key, v[0]);

        return (x: unknown) => {
            if (!Array.isArray(x)) {
                throw new TypeError(`Property "${key}" expected array and not "${x}" of type "${typeof x}"!`);
            }

            return x.map(VALIDATOR_FUNCTION) as any as T;
        };
    }

    if (typeof v === "function" && v.length === 1) {
        return v as ValidatorFunctionType<T>;
    }

    throw new TypeError(`Invalid validator for property "${key}"`);
}