import PotColorEnum from "./PotColorEnum";
import SoilTypeEnum from "./SoilTypeEnum";
import ValidatorMapType from "../src/ValidatorMapType";
import StructBase from "../src/StructBase";

interface ISoilData {
    row: number;
    topf: string;
    woche: number;
    amount: number;
    potcolor: PotColorEnum;
    soiltype: SoilTypeEnum;
}

const defaultSoilData: ISoilData = {
    row: 0,
    topf: "",
    woche: 0,
    amount: 0,
    potcolor: PotColorEnum.Terra,
    soiltype: SoilTypeEnum.Standard,
};

const soilValidators: ValidatorMapType<ISoilData> = {
    row: raw =>
        typeof raw === "number"
            ? raw
            : (() => { throw new TypeError("row must be a number"); })(),
    topf: raw =>
        typeof raw === "string"
            ? raw
            : (() => { throw new TypeError("topf must be a string"); })(),
    woche: raw =>
        typeof raw === "number"
            ? raw
            : (() => { throw new TypeError("woche must be a number"); })(),
    amount: raw =>
        typeof raw === "number"
            ? raw
            : (() => { throw new TypeError("amount must be a number"); })(),
    potcolor: raw =>
        typeof raw === "number" && raw in PotColorEnum
            ? (raw as PotColorEnum)
            : (() => { throw new TypeError("invalid potcolor"); })(),
    soiltype: raw =>
        typeof raw === "number" && raw in SoilTypeEnum
            ? (raw as SoilTypeEnum)
            : (() => { throw new TypeError("invalid soiltype"); })(),
};

class SoilData {
    public static createImmutable = StructBase.createImmutable.bind(StructBase);
    public static createMutable = StructBase.createMutable.bind(StructBase);

    private constructor() { } // never used

    public static of(data: Partial<ISoilData> = {}) {
        return this.createImmutable(defaultSoilData, soilValidators, data);
    }

    public static ofMutable(data: Partial<ISoilData> = {}) {
        return this.createMutable(defaultSoilData, soilValidators, data);
    }
}

export default SoilData;