import SoilStruct from "./SoilStruct";

describe("SoilStruct.of - valid input", () => {
    it("should create a SoilStruct with valid data", () => {
        const instance = SoilStruct.of({
            row: 1,
            topf: "A1",
            woche: 32,
            amount: 100,
        });

        expect(instance.row).toBe(1);
        expect(instance.topf).toBe("A1");
        expect(instance.woche).toBe(32);
        expect(instance.amount).toBe(100);
    });
});

describe("SoilStruct.of - invalid input", () => {
    it("should throw if row is not a number", () => {
        expect(() => SoilStruct.of({ row: "not-a-number" as any }))
            .toThrow("row must be a number");
    });

    it("should throw if topf is not a string", () => {
        expect(() => SoilStruct.of({ topf: 123 as any }))
            .toThrow("topf must be a string");
    });

    it("should throw if woche is not a number", () => {
        expect(() => SoilStruct.of({ woche: "week" as any }))
            .toThrow("woche must be a number");
    });

    it("should throw if amount is not a number", () => {
        expect(() => SoilStruct.of({ amount: null as any }))
            .toThrow("amount must be a number");
    });
});

describe("SoilStruct.of - partial input", () => {
    it("should apply default values when some fields are missing", () => {
        const instance = SoilStruct.of({ topf: "B2" });

        expect(instance.row).toBe(0);
        expect(instance.topf).toBe("B2");
        expect(instance.woche).toBe(0);
        expect(instance.amount).toBe(0);
    });
});
