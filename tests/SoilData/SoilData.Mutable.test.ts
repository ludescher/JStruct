import SoilData from '../SoilData';

describe('SoilData Mutable Creation & Update', () => {
    it('should use default values when no overrides are provided', () => {
        const mu = SoilData.ofMutable();
        // snapshot via toJSON()—toMatchObject ignores extra props (potcolor/soiltype)
        expect(mu.toJSON()).toMatchObject({
            row: 0,
            topf: '',
            woche: 0,
            amount: 0
        });
    });

    it('should apply valid overrides at creation', () => {
        const mu = SoilData.ofMutable({ row: 2, topf: 'B2' });
        expect(mu.row).toBe(2);
        expect(mu.topf).toBe('B2');
    });

    it('should skip undefined overrides', () => {
        const mu = SoilData.ofMutable({ woche: undefined } as any);
        expect(mu.woche).toBe(0);
    });

    it('should throw on invalid override types at creation', () => {
        expect(() => SoilData.ofMutable({ woche: 'nope' as any })).toThrow(TypeError);
    });

    it('should allow updating existing fields', () => {
        const mu = SoilData.ofMutable({ amount: 5 });
        mu.amount = 99;
        expect(mu.amount).toBe(99);
    });

    it('should skip validation on assignment (runtime type safety)', () => {
        const mu: any = SoilData.ofMutable({ amount: 5 });
        mu.amount = 'string';
        expect(mu.amount).toBe('string');
    });

    it('should prevent adding new properties', () => {
        const mu: any = SoilData.ofMutable();
        expect(() => { mu.foo = 123; }).toThrow(TypeError);
    });

    it('should prevent deleting properties', () => {
        const mu: any = SoilData.ofMutable({ row: 4 });
        expect(() => { delete mu.row; }).toThrow(TypeError);
        expect(mu.row).toBe(4);
    });

    it('toJSON() should reflect latest mutations', () => {
        const mu: any = SoilData.ofMutable({ amount: 1 });
        mu.amount = 33;
        expect(mu.toJSON().amount).toBe(33);
    });
});
