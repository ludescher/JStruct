import SoilData from '../SoilData';

describe('SoilData Validation Rules', () => {
    it('throws if override has an unknown key (immutable)', () => {
        expect(() => (SoilData.of as any)({ unknown: 123 })).toThrow(TypeError);
    });

    it('throws if override has an unknown key (mutable)', () => {
        expect(() => (SoilData.ofMutable as any)({ foo: 'bar' })).toThrow(TypeError);
    });

    it('throws on invalid override types (immutable)', () => {
        expect(() => SoilData.of({ row: 'bad' as any })).toThrow(TypeError);
        expect(() => SoilData.of({ topf: 938 as any })).toThrow(TypeError);
        expect(() => SoilData.of({ soiltype: 999 as any })).toThrow(TypeError);
    });

    it('throws on invalid override types (mutable)', () => {
        expect(() => SoilData.ofMutable({ amount: 'six' as any })).toThrow(TypeError);
        expect(() => SoilData.ofMutable({ potcolor: 999 as any })).toThrow(TypeError);
    });
});
