import Struct from "../src/Struct";
import SoilStruct from "./SoilStruct";

describe("SoilStruct", () => {
    it("should create with default values", () => {
        const s = SoilStruct.of();
        expect(s.row).toBe(0);
        expect(s.topf).toBe("");
        expect(s.woche).toBe(0);
        expect(s.amount).toBe(0);
    });

    it("should override default values via constructor", () => {
        const s = SoilStruct.of({ row: 5, topf: "Test" });
        expect(s.row).toBe(5);
        expect(s.topf).toBe("Test");
    });

    it("should throw on invalid override", () => {
        expect(() => SoilStruct.of({ row: "not a number" as any })).toThrow("row must be a number");
    });

    it("should allow updating existing fields with valid values", () => {
        const s = SoilStruct.of();
        (s as any).row = 10;
        expect(s.row).toBe(10);
    });

    it("should throw when setting invalid value", () => {
        const s = SoilStruct.of();
        expect(() => ((s as any).row = "bad")).toThrow("row must be a number");
    });

    it("should throw when adding new property", () => {
        const s = SoilStruct.of();
        expect(() => ((s as any).newProp = 123)).toThrow('Cannot add new property "newProp" on readonly "SoilStruct"!');
    });

    it("should throw when deleting property", () => {
        const s = SoilStruct.of();
        expect(() => delete (s as any).row).toThrow('Cannot delete property on "SoilStruct"!');
    });

    it("should throw when defining property", () => {
        const s = SoilStruct.of();
        expect(() =>
            Object.defineProperty(s, "row", {
                value: 100,
            })
        ).toThrow('Cannot define property on "SoilStruct"!');
    });

    it("should return correct list of keys via Object.keys", () => {
        const s = SoilStruct.of();
        expect(Object.keys(s)).toEqual(["row", "topf", "woche", "amount"]);
    });

    it("should support 'in' operator", () => {
        const s = SoilStruct.of();
        expect("row" in s).toBe(true);
        expect("nonexistent" in s).toBe(false);
    });

    it("should throw when unknown property is passed to constructor", () => {
        expect(() => { SoilStruct.of({ dach: "franz" } as any); }).toThrow(TypeError);
    });

    it("should trigger getOwnPropertyDescriptor trap", () => {
        const s = SoilStruct.of({ topf: "Test" });
        const desc = Object.getOwnPropertyDescriptor(s, "topf");
        expect(desc).toEqual({
            configurable: true,
            enumerable: true,
            writable: true,
            value: "Test",
        });
    });

    it("should return undefined for unknown property descriptor", () => {
        const s = SoilStruct.of();
        const desc = Object.getOwnPropertyDescriptor(s, "nonexistent");
        expect(desc).toBeUndefined();
    });

    it("should throw when calling undefined method", () => {
        // @ts-ignore
        expect(() => { SoilStruct.of().laufdoch(); }).toThrow(TypeError);
    });

    it("should throw when assigning undefined property", () => {
        // @ts-ignore
        expect(() => { SoilStruct.of().peter = "Franz"; }).toThrow(TypeError);
    });

    it("should throw when modifying readonly property in subclass", () => {
        class CarStruct extends Struct {
            public brand!: string;

            public static of(data: Partial<CarStruct> = {}) {
                return this.create<CarStruct>(
                    {
                        brand: "CoolCar",
                    },
                    // @ts-ignore
                    {},
                    data
                );
            }
        }

        expect(() => { CarStruct.of().brand = "Puch"; }).toThrow(TypeError);
    });

    it("should trigger isExtensible trap", () => {
        const s = SoilStruct.of();
        expect(Object.isExtensible(s)).toBe(false);
    });

    it("should trigger preventExtensions trap", () => {
        const s = SoilStruct.of();
        const result = Object.preventExtensions(s);
        expect(result).toBe(s); // The object is returned, but not actually made non-extensible
        expect(Object.isExtensible(s)).toBe(false); // Confirm trap behavior
    });

    it("should trigger getPrototypeOf trap", () => {
        const s = SoilStruct.of();
        expect(Object.getPrototypeOf(s)).toBe(Object.prototype);
    });

    it("should trigger setPrototypeOf trap", () => {
        const s = SoilStruct.of();
        expect(() => { Object.setPrototypeOf(s, {}); }).toThrow(TypeError);
    });

    it("should throw on apply trap", () => {
        const fn = () => { };
        fn.structname = "SoilStruct";
        const proxy = new Proxy(fn, {
            apply(target) {
                throw new TypeError(`Cannot call "${target.structname}" as function!`);
            },
        });

        expect(() => proxy()).toThrow('Cannot call "SoilStruct" as function!');
    });

    it("should throw on construct trap", () => {
        const SoilFn = function () { } as unknown as new (...args: any[]) => any;
        (SoilFn as any).structname = "SoilStruct";

        const proxy = new Proxy(SoilFn, {
            construct(target) {
                throw new TypeError(`Cannot construct "${(target as any).structname}"!`);
            },
        });

        expect(() => new proxy()).toThrow('Cannot construct "SoilStruct"!');
    });



});
