import 'reflect-metadata';
import {TYPE_FUNCTION, TYPE_NUMBER, TYPE_STRING, TYPE_VOID} from "./types";

function Type (type: string):any {

    return Reflect.metadata("design:type", type);
};

interface MetaData {
    key: string;
    type: string;
    paramTypes: string[];
    returnType: string;
}

export class Emitter {

    @Type('string')
    name: string = '';

    @Type('function():  string')
    getHello(): string {
        return 'Hello';
    }

    @Type('function():number')
    getCount(): number {
        return 3;
    }

    @Type('function(number):void')
    apply(c: number) {
        console.log('applying: ', c);
    }
}

const getMetaData = (obj: any, key: any)  => {

    let data = Reflect.getMetadata("design:type", obj, key) || '';

    data = data.replace(/\s/g, '');

    let metaData: MetaData = {} as MetaData;

    metaData.key = key;
    metaData.paramTypes = [];

    if(data.includes(TYPE_FUNCTION)) {

        metaData.type = TYPE_FUNCTION;

        metaData.returnType = data.split(':')[1];

        metaData.paramTypes = data.substring(
            data.lastIndexOf("(") + 1,
            data.lastIndexOf(")")
        )
            .split(',');
    }
    else {
        metaData.type = data;
    }

    return metaData;
};

export class Receiver {

    @Type(TYPE_STRING)
    surname: string = '';

    @Type('function(string):void')
    log(s: string) {
        console.log(s);
    }

    @Type('function(number):void')
    increment(c: number) {
        c++;
        console.log(c);
    }
}

const getObjectPropMetaData = (obj: any, key: string): MetaData => {

    if (!obj.hasOwnProperty(key) && typeof obj[key] !== 'function') {
        throw new Error(`Undefined property: ${key}`);
    }

    return getMetaData(obj, key);
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