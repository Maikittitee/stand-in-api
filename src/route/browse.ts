import { Router } from 'express';
import * as fuzz from 'fuzzball';

import { Product, ProductModel, ProductVariant, Brand } from '../model/Product.js';
import { Store, Building } from '../model/Address.js';
import { Stander } from '../model/Stander.js';
import { convertQuery } from '../middleware/validator.js';
import { ToNestedPath } from '../service/index.js';


export default Router()
    .use(convertQuery)


.get('/product', async (req, res) => {
    const {
        name,
        store_id,
        brand_id,
        category,
        price_start,
        price_end,
        sortby,
        ...options // color, size, etc.
    } = req.query;

    let models = await ProductModel.find({
        brand: brand_id,
        category: category,
    });

    if (name) {
        models = fuzz
            .extract(name, models, {
                scorer: fuzz.partial_ratio,
                processor: model => model.name,
                cutoff: 50,
            })
            .map(r => r[0]);
    }

    const variants = await ProductVariant.find({
        product_model: { $in: models.map(m => m._id) },
        price: { $gte: price_start || 0, $lte: price_end || Infinity },
        ...ToNestedPath(options)
    });

    const products = await Product
        .find({
            store: store_id,
            variant: { $in: variants.map(v => v._id) },
            available: true,
        })
        .populate({
            path: 'store',
            populate: 'building',
        })
        .populate({
            path: 'variant',
            populate: {
                path: 'product_model',
                populate: 'brand',
            }
        });

    res.json(products);
})

.get('/product/:id', async (req, res) => {
    const product = await Product
        .findById(req.params.id)
        .populate({
            path: 'store',
            populate: 'building',
        })
        .populate({
            path: 'variant',
            populate: {
                path: 'product_model',
                populate: 'brand',
            }
        });

    res.json(product);
})

.get('/stander', async (req, res) => {
    const { name, location, product } = req.query;

    const filtered_standers = await Stander.find({
        // service: {
        //     location: location,
        //     products: { $eleMatch: product },
        // }
    });

    const scores = await Promise.all(
        filtered_standers.map(async (stander) => {
            const score = await stander.getScore();

            if (score === undefined) {
                return { stander, score: 3 };
            }
            return { stander, score };
        }
    ));

    let standers = scores
        .sort((a, b) => b.score - a.score)
        .map(s => s.stander);

    if (name) {
        standers = fuzz.extract(name, standers, {
            scorer: fuzz.partial_ratio,
            processor: stander => stander.name,
            cutoff: 50,
        }).map(r => r[0]);
    }

    res.json(standers);
})

.get('/stander/:id', async (req, res) => {
    const stander = await Stander.findById(req.params.id);

    res.json(stander);
})

.get('/store', async (req, res) => {
    const { name } = req.query;
    const all_store = await Store.find();

    // const stores = fuzz.extract(name, all_store, {
    //     scorer: fuzz.partial_ratio,
    //     processor: store => store.name,
    //     cutoff: 50,
    // }).map(r => r[0]);

    res.json(all_store);
})
.get('/store/:id', async (req, res) => {
    const all_store = await Store.findById(req.params.id)


    res.json(all_store);
})
.get('/building', async (req, res) => {
    const { name } = req.query;
    const all_building = await Building.find({
        name: { $exists: true },
    });

    const buildings = fuzz.extract(name, all_building, {
        scorer: fuzz.partial_ratio,
        processor: building => building.name,
        cutoff: 50,
    }).map(r => r[0]);

    res.json(buildings);
})

.get('/brand', async (req, res) => {
    const { name } = req.query;
    const all_brand = await Brand.find();

    const brands = fuzz.extract(name, all_brand, {
        scorer: fuzz.partial_ratio,
        processor: brand => brand.name,
        cutoff: 50,
    }).map(r => r[0]);

    res.json(brands);
})

.get('/product_model', async (req, res) => {
    const { name } = req.query;
    const all_model = await ProductModel.find();

    const models = fuzz.extract(name, all_model, {
        scorer: fuzz.partial_ratio,
        processor: model => model.name,
        cutoff: 50,
    }).map(r => r[0]);

    res.json(models);
})