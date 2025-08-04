declare abstract class Struct {
    constructor();
    protected static create<T extends object>(defaults: T, rawValidators: Record<keyof T, any>, override?: Partial<T>): T;
}
export default Struct;
//# sourceMappingURL=Struct.d.ts.map