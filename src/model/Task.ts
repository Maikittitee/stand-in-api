import { Schema } from 'mongoose';
import { itemSchema } from './Product.js';
import { addressSchema } from './Address.js';


export enum TaskType {
    Queueing,
    Shopping,
}
export enum PackageSize {
    Small = 's',
    Medium = 'm',
    Laege = 'l',
}


export const taskSchema = new Schema({
    kind: {
        type: Number,
        enum: TaskType,
        required: true,
    },
}, {
    discriminatorKey: 'kind',
    _id: false,
});


export const queueingSchema = new Schema({
    location: {
        type: addressSchema,
        required: true,
    },
    datetime: {
        type: Date,
        required: true,
    },
    size: {
        type: String,
        enum: PackageSize,
        required: true,
    },
    detail: {
        type: String,
        required: true,
    },
}, {
    _id: false,
});


export const shoppingSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    items: [itemSchema],
}, {
    _id: false,
});


export function isQueueing(task: any): task is TQueueing {
    return task.kind === TaskType.Queueing;
}
export function isShopping(task: any): task is TShopping {
    return task.kind === TaskType.Shopping;
}


// https://mongoosejs.com/docs/discriminators.html