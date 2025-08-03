import StructBase from '../../src/StructBase';
import ValidatorMapType from '../../src/ValidatorMapType';

interface Sample {
    x: number;
    nested: { value: string; };
}

const defaults: Sample = { x: 10, nested: { value: 'orig' } };
const validators: ValidatorMapType<Sample> = {
    x: (raw) => {
        if (typeof raw !== 'number') throw new TypeError('x must be a number');
        return raw;
    },
    nested: (raw) => {
        if (typeof raw !== 'object' || raw === null || typeof (raw as any).value !== 'string') {
            throw new TypeError('nested.value must be a string');
        }
        return raw as any;
    }
};

describe('StructBase.createMutable()', () => {
    it('applies defaults when no override is provided', () => {
        const obj = StructBase.createMutable(defaults, validators);
        expect(obj.x).toBe(10);
        expect(obj.nested).toEqual({ value: 'orig' });
    });

    it('applies valid overrides', () => {
        const obj = StructBase.createMutable(defaults, validators, { x: 42 });
        expect(obj.x).toBe(42);
    });

    it('skips undefined overrides', () => {
        const obj = StructBase.createMutable(defaults, validators, { nested: undefined } as any);
        expect(obj.nested).toEqual({ value: 'orig' });
    });

    it('throws on unknown override keys', () => {
        expect(() => StructBase.createMutable(defaults, validators, { foo: 1 } as any)).toThrow(TypeError);
    });
});
