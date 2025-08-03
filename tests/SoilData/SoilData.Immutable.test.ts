import SoilData from '../SoilData';
import PotColorEnum from '../PotColorEnum';
import SoilTypeEnum from '../SoilTypeEnum';

describe('SoilData Immutable Creation', () => {
    it('should use default values when no overrides are provided', () => {
        const im = SoilData.of();
        expect(im.row).toBe(0);
        expect(im.topf).toBe('');
        expect(im.woche).toBe(0);
        expect(im.amount).toBe(0);
        expect(im.potcolor).toBe(PotColorEnum.Terra);
        expect(im.soiltype).toBe(SoilTypeEnum.Standard);
    });

    it('should apply valid overrides at creation', () => {
        const im = SoilData.of({
            row: 5,
            topf: 'A1',
            woche: 3,
            amount: 42,
            potcolor: PotColorEnum.Confetti,
            soiltype: SoilTypeEnum.Cyclame
        });
        // Use toJSON() so we match on the plain snapshot shape, not on the proxy’s private _data key
        expect(im.toJSON()).toMatchObject({
            row: 5,
            topf: 'A1',
            woche: 3,
            amount: 42,
            potcolor: PotColorEnum.Confetti,
            soiltype: SoilTypeEnum.Cyclame
        });
    });

    it('should skip undefined overrides and keep defaults', () => {
        // Force TS bypass
        const im = SoilData.of({ row: undefined } as any);
        expect(im.row).toBe(0);
    });

    it('should serialize to a plain snapshot object via toJSON()', () => {
        const im = SoilData.of({ amount: 7 });
        expect(im.toJSON()).toEqual({
            row: 0,
            topf: '',
            woche: 0,
            amount: 7,
            potcolor: PotColorEnum.Terra,
            soiltype: SoilTypeEnum.Standard
        });
    });
});

describe('SoilData Immutable Immutability', () => {
    let im: ReturnType<typeof SoilData.of>;

    beforeEach(() => {
        im = SoilData.of({ row: 1 });
    });

    it('should throw when mutating existing props', () => {
        expect(() => { (im as any).row = 2; }).toThrow(TypeError);
    });

    it('should throw when adding new props', () => {
        expect(() => { (im as any).newField = 123; }).toThrow(TypeError);
    });

    it('should throw when redefining properties', () => {
        expect(() => {
            Object.defineProperty(im, 'row', { value: 10 });
        }).toThrow();
    });

    it('should throw when deleting properties', () => {
        expect(() => {
            delete (im as any).amount;
        }).toThrow(TypeError);
    });
});
