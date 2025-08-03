import StructBase from '../../src/StructBase';
import ValidatorMapType from '../../src/ValidatorMapType';

interface Sample {
    x: number;
    nested: { value: string; };
}

const defaults: Sample = { x: 5, nested: { value: 'orig' } };
const validators: ValidatorMapType<Sample> = {
    x: (raw) => {
        if (typeof raw !== 'number') throw new TypeError('x must be a number');
        return raw * 2;
    },
    nested: (raw) => {
        if (typeof raw !== 'object' || raw === null || typeof (raw as any).value !== 'string') {
            throw new TypeError('nested.value must be a string');
        }
        return raw as any;
    }
};

describe('StructBase.createImmutable()', () => {
    it('applies defaults when no override is provided', () => {
        const obj = StructBase.createImmutable(defaults, validators);
        expect(obj.x).toBe(5);
        expect(obj.nested).toEqual({ value: 'orig' });
    });

    it('runs validators on provided overrides only', () => {
        const obj = StructBase.createImmutable(defaults, validators, { x: 3 });
        expect(obj.x).toBe(6);  // doubled
    });

    it('skips undefined overrides', () => {
        const obj = StructBase.createImmutable(defaults, validators, { nested: undefined } as any);
        expect(obj.nested).toEqual({ value: 'orig' });
    });

    it('throws on unknown override keys', () => {
        expect(() => StructBase.createImmutable(defaults, validators, { foo: 'bar' } as any)).toThrow(TypeError);
    });

    it('deeply freezes root and nested values', () => {
        const obj = StructBase.createImmutable(defaults, validators);

        // root mutation
        expect(() => { (obj as any).x = 100; }).toThrow(TypeError);
        // nested mutation
        expect(() => { obj.nested.value = 'mutated'; }).toThrow(TypeError);
        // the proxy wrapper itself isn’t Object.freeze()’d, but the internal data _is_
        const internal = (obj as any)._data;
        expect(Object.isFrozen(internal)).toBe(true);
        expect(Object.isFrozen(internal.nested)).toBe(true);
    });
});
