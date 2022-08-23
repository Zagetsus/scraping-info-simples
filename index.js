const express = require('express');
const axios = require("axios");
const cheerio = require ('cheerio');
const cleanPrice = require('./helper/format-price')

const app = express();
const port = 4444;


app.get('/', async (req, res) => {
    const url = 'https://storage.googleapis.com/infosimples-public/commercia/case/product.html';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const response = {};


    response['title'] = $('h2#product_title').text();
    response['brand'] = $('div.brand').text();
    response['categories'] = [];
    response['sku'] = [];


    $('nav.current-category').find('a').each(function () {
        response['categories'].push($(this).text());
    })


    $('div.skus-area > div:first-child').find('div.card').each(function () {
        const name = $(this).find('meta[itemprop="name"]').attr('content')
        const current_price = $(this).find('div.card-container > div.sku-current-price').text()
        const old_price = $(this).find('div.card-container > div.sku-old-price').text()
        const available = !$(this).hasClass('not-avaliable')

        response['sku'].push({
            name,
            current_price: cleanPrice(current_price),
            old_price: cleanPrice(old_price),
            available
        })
    })


    res.send(response)
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
