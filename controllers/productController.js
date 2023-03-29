const _ = require('lodash');
const formidable = require('formidable');
const fs = require('fs');
const { Product, validate } = require('../models/product');

module.exports.createProduct = async (req, res) => {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(400).send("Something went worng!");
        const {error} = validate(_.pick(fields, ["name", "description", 
        "price", "category", "quantity"]));
        if (error) return res.status(400).send(error.details[0].message);

        const product = new Product(fields);

        if (files.photo) {
            // <input type="file" name="photo">
            fs.readFile(files.photo.filepath, (err, data) => {
                if (err) return res.status(400).send("Problem in file data!");
                product.photo.data = data;
                product.photo.ContentType = files.photo.type;
                product.save((err, result) => {
                    if (err) res.status(500).send("Internal Server error!");
                    else return res.status(201).send({
                        message: "Product Created Successfully!",
                        data: _.pick(result, ["name", "description", "price",
                        "category", "quantity"])
                    })
                })
            })
        } else {
            return res.status(400).send("No image provided!");
        }
    })
}

// Query String
// api/product?order=desc&sortBy=name&limit=10
module.exports.getProducts = async (req, res) => {
    let order = req.query.order === 'desc' ? -1 : 1;
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id';
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const products = await Product.find()
    .select({photo: 0 }) // photo not send
    .sort({ [sortBy]: order }) // sortBy is a variable but using as property name
    .limit(limit)
    .populate('category', 'name createdAt');
    return res.status(200).send(products);
}

module.exports.getProductById = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId)
    .select({ photo: 0 })
    .populate('category', 'name');
    if (!product) res.status(404).send("Not Found!");
    return res.status(200).send(product);
}

module.exports.getPhoto = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId)
    .select({ photo: 1, _id: 0 }) // select only photo no the id
    res.set('Content-Type', product.photo.ContentType);
    return res.status(200).send(product.photo.data);
}

// Get Product by Id
// Collect form data
// update provided form fields
// Update photo (if Provided)
module.exports.updateProductById = async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, (err, fields, files) => {
        if (err) return res.status(400).send("Something wrong!");
        const updatedFields = _.pick(fields, ["name", "description", "price", 
        "category", "quantity"]);
        _.assignIn(product, updatedFields);

        if (files.photo) {
            fs.readFile(files.photo.filepath, (err, data) => {
                if (err) return res.status(400).send("Something wrong");
                product.photo.data = data;
                product.photo.ContentType = files.photo.type;
                product.save((err, result) => {
                    if (err) return res.status(500).send("Something failed!");
                    else return res.status(200).send({
                        message: "Product Updated Successfully!"
                    })
                })
            })
        } else {
            product.save((err, result) => {
                if (err) return res.status(500).send("Something failed!");
                else return res.status(200).send({
                    message: "Product Updated Successfully!"
                })
            })
        }
    })
}

// Filter products
const body = {
    order : 'desc',
    sortBy: 'price',
    limit: 6,
    skip: 20,
    filters: {
        price: [1000, 2000],
        category: ['663737ddsaaf', '80903303hhfhgh']
    }
}
module.exports.filterProducts = async (req, res) => {
    let order = req.body.order === 'desc' ? -1 : 1;
    let sortBy = req.body.sortBy ? req.body.sortBy : '_id';
    let limit = req.body.limit ? parseInt(req.body.limit) :10;
    let skip = parseInt(req.body.skip);
    let filters = req.body.filters;
    let args = {}

    for (let key in filters) {
        if (filters[key].length > 0) {
            if (key === 'price') {
                // { price: {$gte:0, &lte: 1000}}
                args['price'] = {
                    $gte : filters['price'][0],
                    $lte : filters['price'][1]
                }
                console.log(args);
            }
            if (key === 'category') {
                // category: { $in: ['']}
                args['category'] = {
                    $in : filters['category']
                }
                console.log(args);
            }
        }
    }

    const products = await Product.find(args)
        .select({ photo: 0 })
        .populate('category', 'name')
        .sort({ [sortBy]: order})
        .skip(skip)
        .limit(limit)
    return res.status(200).send(products);
}