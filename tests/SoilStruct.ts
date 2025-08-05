import Struct from "../src/Struct";

class SoilStruct extends Struct {
    public row!: number;
    public topf!: string;
    public woche!: number;
    public amount!: number;

    private constructor() { super(); }

    public static of(data: Partial<SoilStruct> = {}) {
        return this.create<SoilStruct>(
            {
                row: 0,
                topf: "",
                woche: 0,
                amount: 0,
            },
            {
                row: (raw: any) =>
                    typeof raw === "number"
                        ? raw
                        : (() => { throw new TypeError("row must be a number"); })(),
                topf: (raw: any) =>
                    typeof raw === "string"
                        ? raw
                        : (() => { throw new TypeError("topf must be a string"); })(),
                woche: (raw: any) =>
                    typeof raw === "number"
                        ? raw
                        : (() => { throw new TypeError("woche must be a number"); })(),
                amount: (raw: any) =>
                    typeof raw === "number"
                        ? raw
                        : (() => { throw new TypeError("amount must be a number"); })(),
            },
            data
        );
    }
}

export default SoilStruct;