import SoilStruct from "./SoilStruct";

describe("SoilStruct", () => {
    it("should create with default values", () => {
        const s = SoilStruct.of();
        expect(s.row).toBe(0);
        expect(s.topf).toBe("");
        expect(s.woche).toBe(0);
        expect(s.amount).toBe(0);
    });

    it("should override values", () => {
        const s = SoilStruct.of({ row: 5, topf: "Test" });
        expect(s.row).toBe(5);
        expect(s.topf).toBe("Test");
    });

    it("should throw on invalid override", () => {
        expect(() => SoilStruct.of({ row: "not a number" as any })).toThrow("row must be a number");
    });

    it("should allow updating existing fields", () => {
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

    it("should list keys correctly", () => {
        const s = SoilStruct.of();
        expect(Object.keys(s)).toEqual(["row", "topf", "woche", "amount"]);
    });

    it("should support 'in' operator", () => {
        const s = SoilStruct.of();
        expect("row" in s).toBe(true);
        expect("nonexistent" in s).toBe(false);
    });
});
