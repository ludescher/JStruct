import PotColorEnum from "./PotColorEnum";
import SoilData from "./SoilData";
import SoilTypeEnum from "./SoilTypeEnum";

describe('SoilData Immutable', () => {

    it('1a. uses default values when no override is provided', () => {
        const im = SoilData.of();
        expect(im.row).toBe(0);
        expect(im.topf).toBe('');
        expect(im.woche).toBe(0);
        expect(im.amount).toBe(0);
        expect(im.potcolor).toBe(PotColorEnum.Terra);
        expect(im.soiltype).toBe(SoilTypeEnum.Standard);
    });

    it('1b. applies valid overrides at creation', () => {
        const im = SoilData.of({
            row: 5,
            topf: 'A1',
            woche: 3,
            amount: 42,
            potcolor: PotColorEnum.Confetti,
            soiltype: SoilTypeEnum.Cyclame,
        });
        expect(im.row).toBe(5);
        expect(im.topf).toBe('A1');
        expect(im.woche).toBe(3);
        expect(im.amount).toBe(42);
        expect(im.potcolor).toBe(PotColorEnum.Confetti);
        expect(im.soiltype).toBe(SoilTypeEnum.Cyclame);
    });

    it('1c. throws on invalid override types', () => {
        expect(() => SoilData.of({ row: 'bad' as any })).toThrow(TypeError);
        expect(() => SoilData.of({ potcolor: 999 as any })).toThrow(TypeError);
    });

    it('1d. cannot mutate or extend immutable instance', () => {
        const im = SoilData.of({ row: 1 });
        expect(() => { (im as any).row = 2; }).toThrow(TypeError);
        expect(() => { (im as any).newProp = 123; }).toThrow(TypeError);
        expect(() => { Object.defineProperty(im, 'row', { value: 10 }); }).toThrow();
        expect(() => { delete (im as any).amount; }).toThrow(TypeError);
    });

    it('1e. toJSON returns plain object snapshot', () => {
        const im = SoilData.of({ amount: 7 });
        const json = im.toJSON();
        expect(json).toEqual({
            row: 0,
            topf: '',
            woche: 0,
            amount: 7,
            potcolor: PotColorEnum.Terra,
            soiltype: SoilTypeEnum.Standard,
        });
    });

});

describe('SoilData Mutable', () => {

    it('2a. uses default values when no override is provided', () => {
        const mu = SoilData.ofMutable();
        expect(mu.row).toBe(0);
        expect(mu.topf).toBe('');
        expect(mu.woche).toBe(0);
        expect(mu.amount).toBe(0);
    });

    it('2b. applies valid overrides at creation', () => {
        const mu = SoilData.ofMutable({ row: 2, topf: 'B2' });
        expect(mu.row).toBe(2);
        expect(mu.topf).toBe('B2');
    });

    it('2c. throws on invalid override types at creation', () => {
        expect(() => SoilData.ofMutable({ woche: 'nope' as any })).toThrow(TypeError);
    });

    it('2d. allows updating existing fields', () => {
        const mu = SoilData.ofMutable({ row: 1 });
        mu.row = 10;
        mu.amount = 99;
        expect(mu.row).toBe(10);
        expect(mu.amount).toBe(99);
    });

    it('2e. does not re-run validators on assignment (runtime type safety)', () => {
        const mu: any = SoilData.ofMutable({ amount: 5 });
        mu.amount = 'string';   // no TypeError, because set-trap skips validators
        expect(mu.amount).toBe('string');
    });

    it('2f. cannot add new properties', () => {
        const mu: any = SoilData.ofMutable();
        expect(() => { mu.foo = 123; }).toThrow(TypeError);
    });

    it('2g. cannot delete properties', () => {
        const mu: any = SoilData.ofMutable({ row: 4 });
        expect(() => { delete mu.row; }).toThrow(TypeError);
        expect(mu.row).toBe(4);
    });

    it('2h. toJSON reflects latest mutations', () => {
        const mu: any = SoilData.ofMutable({ amount: 1 });
        mu.amount = 33;
        const snap = mu.toJSON();
        expect(snap.amount).toBe(33);
    });

});
