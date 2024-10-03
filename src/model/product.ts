import { Schema, model, Types } from 'mongoose';


const Category = [
    'Clothing',
    'Beauty',
    'Electronics',
    'Home',
    'Stationery',
    'Toys & Games',
];


const brandSchema = new Schema({
    name: { 
        type: String, 
        unique: true, 
        required: true, 
    },
    logo: { 
        type: String,     
    },
});


const variantSchema = new Schema({
    images: [String],
    price: {
        type: Number,
    },
    description: {
        type: String,
    },
    option: {

    }
});


const modelSchema = new Schema({
    name: { 
        type: String, 
        required: true, 
    },
    brand: {
        type: Schema.Types.ObjectId,
        ref: 'Brand',
        required: true, 
    },
    category: { 
        type: String, 
        enum: Category,
    },
    variant: [variantSchema],
});


const productSchema = new Schema({
    store: {
        type: Schema.Types.ObjectId,
        ref: 'Store',
        required: true,
    },
    model: {
        type: Schema.Types.ObjectId,
        ref: 'ProductModel',
        required: true,
    },
    subproduct: [{
        variant: {
            type: Schema.Types.ObjectId,
            ref: 'ProductVariant',
            required: true,
        },
        available: {
            type: Boolean,
            default: true,
            required: true,
        },
    }],
});


export interface IItem extends Types.Subdocument {
    product: Types.ObjectId;
    variant: Types.ObjectId;
    quantity: number;
}
export const itemSchema = new Schema<IItem>({
    product: { 
        type: Schema.Types.ObjectId, 
        ref: 'Product',
        required: true,
    },
    variant: {
        type: Schema.Types.ObjectId, 
        ref: 'ProductVariant',
        required: true,
    },
    quantity: { 
        type: Number, 
        min: 1,
        required: true,
    },
}, {
    _id: false,
});


// https://www.mongodb.com/community/forums/t/product-with-different-varients-schema/136631
// https://stackoverflow.com/questions/42295107/mongodb-schema-for-ecommerce-products-that-have-variations-with-different-skus
// https://stackoverflow.com/questions/24923469/modeling-product-variants

export const Brand = model('Brand', brandSchema);
export const ProductModel = model('ProductModel', modelSchema);
export const ProductVariant = model('ProductVariant', variantSchema);
export const Product = model('Product', productSchema);