import StructBase from "../src/StructBase";
import { deepFreeze } from "../src/Utils";
import ValidatorMapType from "../src/ValidatorMapType";

describe('1. Proxy “has” and enumeration traps', () => {
    const data = { row: 42, col: 7 };

    // Validators must return the value (not a boolean)
    const validators = {
        row: (v: unknown): number => {
            if (typeof v !== 'number') {
                throw new TypeError(`Property "row" must be a number, got ${typeof v}`);
            }
            return v;
        },
        col: (v: unknown): number => {
            if (typeof v !== 'number') {
                throw new TypeError(`Property "col" must be a number, got ${typeof v}`);
            }
            return v;
        },
    };

    // Now you supply both defaults and validators
    const im = StructBase.createImmutable(data, validators);

    test('“in” operator reflects only actual keys', () => {
        expect('row' in im).toBe(true);
        expect('foo' in im).toBe(false);
    });

    test('Object.keys lists only data keys', () => {
        expect(Object.keys(im)).toEqual(['row', 'col']);
    });
});

describe('2. Defaults object immutability', () => {
    test('passing a mutable defaults object does not mutate it', () => {
        // 1) Define a defaults object
        const defaults = { a: 1, b: 2 };

        // 2) Supply matching validators (must return the value or throw)
        const validators = {
            a: (v: unknown): number => {
                if (typeof v !== 'number') {
                    throw new TypeError(`Property "a" must be a number, got ${typeof v}`);
                }
                return v;
            },
            b: (v: unknown): number => {
                if (typeof v !== 'number') {
                    throw new TypeError(`Property "b" must be a number, got ${typeof v}`);
                }
                return v;
            },
        };

        // 3) Create the immutable instance from defaults + validators
        const im = StructBase.createImmutable(defaults, validators);

        // Snapshot the defaults before we mutate them
        const beforeJson = JSON.stringify(defaults);

        // 4) Mutate the original defaults object
        defaults.a = 999;
        // Adding extra props to defaults is allowed at runtime,
        // but they won't affect the immutable instance
        ; (defaults as any).c = 123;

        // Original defaults have really changed
        expect(JSON.stringify(defaults)).not.toEqual(beforeJson);

        // Immutable instance still holds the old values
        expect(im.a).toBe(1);
        expect(im.b).toBe(2);

        // And it never saw our added "c" property
        expect('c' in (im as any)).toBe(false);
    });
});

describe('3. Deep-freeze on unusual inputs', () => {
    test('freezes an object with function properties', () => {
        const fn = () => 'hello';
        const obj = { fn };
        deepFreeze(obj);

        const desc = Object.getOwnPropertyDescriptor(obj, 'fn')!;
        expect(desc.configurable).toBe(false);
        expect(typeof obj.fn).toBe('function');
        expect(obj.fn()).toBe('hello');
    });

    test('handles circular references without blowing the stack', () => {
        const circ: any = { name: 'loop' };
        circ.self = circ;
        expect(() => deepFreeze(circ)).not.toThrow();
        expect(Object.isFrozen(circ)).toBe(true);
        expect(Object.isFrozen(circ.self)).toBe(true);
    });
});

describe('4. Array variants in StructBase', () => {
    const input = { items: [1, { nested: 2 }] };

    // Validator must return the array (or throw)
    const validators = {
        items: (v: unknown): any[] => {
            if (!Array.isArray(v)) {
                throw new TypeError(`Property "items" must be an array, got ${typeof v}`);
            }
            return v;
        },
    };

    // Create the immutable instance
    const im = StructBase.createImmutable(input, validators);

    test('freezes top-level array', () => {
        expect(Object.isFrozen(im.items)).toBe(true);
    });

    test('freezes nested object inside array', () => {
        expect(Object.isFrozen(im.items[1])).toBe(true);
    });

    test('mutating the array throws', () => {
        expect(() => {
            ; (im.items as any).push(3);
        }).toThrow(TypeError);
    });
});

describe('5. Enum-specific validations', () => {
    enum Colors {
        RED = 'RED',
        BLUE = 'BLUE'
    }

    // Validator returns the value or throws
    const validators = {
        color: (v: unknown): Colors => {
            if (!Object.values(Colors).includes(v as Colors)) {
                throw new TypeError(
                    `Property "color" must be one of ${Object.values(Colors).join(
                        ', '
                    )}, got ${typeof v}`
                );
            }
            return v as Colors;
        }
    };

    // Create an immutable instance
    const cs = StructBase.createImmutable({ color: Colors.RED }, validators);

    test('setter try to bypasses validation after creation', () => {
        // Bypass the readonly/validator layer by casting to any
        expect(() => (cs as any).color = 'GREEN').toThrow(TypeError);
    });
});

describe('6. Idempotence of deepFreeze', () => {
    test('calling deepFreeze twice is a no-op and returns same reference', () => {
        const obj = { x: { y: 5 } };
        const first = deepFreeze(obj);
        const second = deepFreeze(obj);

        expect(first).toBe(obj);
        expect(second).toBe(obj);
        expect(() => deepFreeze(first)).not.toThrow();
    });
});

describe('7. Inherited getters/setters', () => {
    // Only these count for validation
    type PersonData = { first: string; last: string; };

    // 1) Build a proto object that *at runtime* has fullName,
    //    but to TS it’s just PersonData & { fullName: string }.
    const proto = {} as PersonData & { readonly fullName: string; };

    Object.defineProperty(proto, 'fullName', {
        get() {
            // “this” is actually PersonData at runtime
            const self = this as PersonData;
            return `${self.first} ${self.last}`;
        },
        enumerable: true,
        configurable: true,
    });

    // 2) Create the raw object with that proto
    const raw = Object.create(proto) as unknown as PersonData;
    raw.first = 'Jane';
    raw.last = 'Doe';

    // 3) Validators only for first/last
    const validators: ValidatorMapType<PersonData> = {
        first: (v: unknown): string => {
            if (typeof v !== 'string') {
                throw new TypeError(`Property "first" must be a string, got ${typeof v}`);
            }
            return v;
        },
        last: (v: unknown): string => {
            if (typeof v !== 'string') {
                throw new TypeError(`Property "last" must be a string, got ${typeof v}`);
            }
            return v;
        },
    };

    // 4) Create the immutable instance
    const im = StructBase.createImmutable<PersonData>(raw, validators);

    test('"in" operator sees inherited getter', () => {
        expect('fullName' in im).toBe(true);
    });

    test('Object.keys does not list inherited accessor', () => {
        expect(Object.keys(im)).toEqual(['first', 'last']);
    });

    test('getter returns accurately', () => {
        // TS doesn't know about fullName, so cast to any
        expect((im as any).fullName).toBe('Jane Doe');
    });
});

describe('8. Error-message consistency', () => {
    test('invalid type at creation yields a predictable message', () => {
        expect(() => {
            StructBase.createImmutable({ count: 'NaN' as any }, { count: Number });
        }).toThrow(
            new TypeError('Property "count" must be a number, got string')
        );
    });
});
