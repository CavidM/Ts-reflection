import 'reflect-metadata';

function Type(type: any) {
    return Reflect.metadata("design:type", type);
}

function ParamTypes(...types: any[]) {
    return Reflect.metadata("design:paramtypes", types);
}

function ReturnType(type: any) {
    return Reflect.metadata("design:returntype", type);
}


export class Emitter {

    @Type('string')
    name: string = '';

    @Type('function')
    @ReturnType('string')
    getHello(): string {
        return 'Hello';
    }

    @Type('function')
    @ReturnType('number')
    getCount(): number {
        return 3;
    }

    @Type('function')
    @ParamTypes('number')
    @ReturnType('void')
    apply(c: number) {
        console.log('applying: ', c);
    }
}


export class Receiver {

    @Type('string')
    surname: string = '';

    @Type('function')
    @ParamTypes('string')
    @ReturnType('void')
    log(s: string) {
        console.log(s);
    }

    @Type('function')
    @ParamTypes('number')
    @ReturnType('void')
    increment(c: number) {
        c++;
        console.log(c);
    }
}

let emitter = new Emitter();
let receiver = new Receiver();

interface MetaData {
    key: string;
    type: string;
    paramTypes: string[];
    returnType: string;
}

const getObjectPropMetaData = (obj: any, key: string): MetaData => {

    if (!obj.hasOwnProperty(key) && typeof obj[key] !== 'function') {
        throw new Error(`Undefined property: ${key}`);
    }

    let metaData: MetaData = {} as MetaData;

    metaData.key = key;
    metaData.type = Reflect.getMetadata("design:type", obj, key);
    metaData.paramTypes = Reflect.getMetadata("design:paramtypes", obj, key) || [];
    metaData.returnType = Reflect.getMetadata("design:returntype", obj, key);

    return metaData;
};

const getObjectPropsMetaData = (obj: any) => {

    let propsMetaData: MetaData[] = [];

    let fields = Object.keys(obj);

    fields.forEach(key => {

        propsMetaData.push(getObjectPropMetaData(obj, key));
    });

    let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(obj));

    methods.forEach(key => {

        if (key !== 'constructor') {

            propsMetaData.push(getObjectPropMetaData(obj, key));
        }
    });

    return propsMetaData;
};

const existsConnection = (receiverMetaData: MetaData, emitterMetaData: MetaData): Boolean => {

    let hasConnection = false;

    receiverMetaData.paramTypes.forEach(paramType => {

        if(emitterMetaData.type == paramType || emitterMetaData.returnType == paramType) {

            hasConnection = true;
        }
    });

    if(emitterMetaData.type == 'function') {

        if(emitterMetaData.returnType == receiverMetaData.type) {

            hasConnection = true;
        }
    }
    else {
        if(emitterMetaData.type == receiverMetaData.type) {

            hasConnection = true;
        }
    }

    return hasConnection;
};

export const GetSuitableIO = (receiver: Object, emitter: Object, receiverKey: string) => {

    let receiverMetaData = getObjectPropMetaData(receiver, receiverKey);

    let emittersMetaData = getObjectPropsMetaData(emitter);

    let io: any[] = [];

    emittersMetaData.map(emitterMetaData => {

        if(existsConnection(receiverMetaData, emitterMetaData)) {

            io.push(emitterMetaData.key);
        }
    });

    return io;
};

export const Connect = (receiver: any, emitter:any, receiverKey: string, emitterKey:any) => {

    let receiverMetaData = getObjectPropMetaData(receiver, receiverKey);
    let emitterMetaData = getObjectPropMetaData(emitter, emitterKey);

    if(!existsConnection(receiverMetaData, emitterMetaData))
        throw new Error(`There no connection between: ${receiverMetaData.key} and ${emitterMetaData.key}`);

    let emitterReturnData = null;

    if(
        emitterMetaData.type === 'function' &&
        emitterMetaData.returnType !== 'void'
    ) {

        emitterReturnData = emitter[emitterKey]();
    }

    if(receiverMetaData.type === 'function') {

        receiver[receiverKey](emitterReturnData);
    }
    else {

        receiver[receiverKey] = emitterReturnData;
    }

};