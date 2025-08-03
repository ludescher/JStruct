import SoilData from '../SoilData';

describe('SoilData Proxy Traps (immutable & mutable)', () => {
    it('get() should return undefined for unknown props (mutable)', () => {
        const mu: any = SoilData.ofMutable();
        expect(mu.nonExistent).toBeUndefined();
    });

    it('get() should return undefined for unknown props (immutable)', () => {
        const im: any = SoilData.of();
        expect(im.someRandomProp).toBeUndefined();
    });

    it('method getters stay bound when extracted', () => {
        const im: any = SoilData.of({ amount: 5 });
        const toJ = im.toJSON;        // no explicit receiver
        expect(toJ()).toEqual(im.toJSON());
    });

    it('defineProperty() on mutable should always error', () => {
        const mu = SoilData.ofMutable({ row: 7 });
        expect(() => {
            Object.defineProperty(mu, 'row', { value: 99 });
        }).toThrow(/^Cannot define property on struct/);
    });

    it('should prevent symbol-keyed additions on mutable', () => {
        const mu: any = SoilData.ofMutable();
        const sym = Symbol('test');
        expect(() => { mu[sym] = 42; }).toThrow(TypeError);
    });
});
