import ValidatorFunctionType from "./ValidatorFunctionType";

type ValidatorMapType<X> = { [K in keyof X]: ValidatorFunctionType<X[K]> };

export default ValidatorMapType;