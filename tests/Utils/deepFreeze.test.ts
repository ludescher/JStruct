import { deepFreeze } from '../../src/Utils';

describe('deepFreeze()', () => {
    it('should recursively freeze plain objects and arrays', () => {
        const data = { a: 1, nested: { b: 2 }, arr: [3, { c: 4 }] };
        const frozen = deepFreeze(data);

        expect(frozen).toBe(data);
        expect(Object.isFrozen(data)).toBe(true);
        expect(Object.isFrozen(data.nested)).toBe(true);
        expect(Object.isFrozen(data.arr)).toBe(true);
        expect(Object.isFrozen(data.arr[1])).toBe(true);
    });

    it('should prevent adding or changing properties', () => {
        'use strict';
        const o = deepFreeze({ x: 1, y: { z: 2 } });

        expect(() => { (o as any).new = 5; }).toThrow();
        expect(() => { o.x = 10; }).toThrow();
        expect(() => { delete (o.y as any).z; }).toThrow();
    });

    it('should throw when passed null or undefined', () => {
        expect(() => deepFreeze(null as any)).toThrow(TypeError);
        expect(() => deepFreeze(undefined as any)).toThrow(TypeError);
    });
});
