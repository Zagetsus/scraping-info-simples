const express = require('express');
const axios = require("axios");
const cheerio = require('cheerio');
const fs = require('fs');

const cleanPrice = require('./helper/format-price')

const app = express();
const port = 4444;


app.get('/', async (req, res) => {
    try {
        const url = 'https://storage.googleapis.com/infosimples-public/commercia/case/product.html';
        const {data} = await axios.get(url);
        const $ = cheerio.load(data);
        const response = {};


        response['title'] = $('h2#product_title').text();
        response['brand'] = $('div.brand').text();
        response['categories'] = [];
        response['sku'] = [];
        response['properties'] = [];
        response['reviews'] = [];
        response['reviews_average_score'] = '';
        response['url'] = url


        $('nav.current-category > a').each(function () {
            response['categories'].push($(this).text());
        })


        $('div.skus-area > div:first-child > div.card').each(function () {
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

        $('#additional-properties > table.pure-table > tbody > tr').each(function () {
            const label = $(this).find('td:first-child').text()
            const value = $(this).find('td:last-child').text()

            response['properties'].push({
                label,
                value
            })
        })

        $('#comments > div.review-box').each(function () {
            const name = $(this).find('span.review-username').text();
            const date = $(this).find('span.review-date').text();
            const stars = $(this).find('span.review-stars').text().split('');
            const text = $(this).find('p').text()
            let note = 0

            stars.forEach(item => {
                if (item === '★') note++
            })

            response['reviews'].push({
                name,
                date,
                stars: note,
                text
            })
        })

        let note = $('#comments > h4').text().split(':')[1]
        response['reviews_average_score'] = Number(note.split('/')[0])

        const json = JSON.stringify(response);

        fs.writeFile('json/product.json', json, function (err) {
            if (err) res.status(400).send({
                status: false,
                body: 'There was a failure to save the json file'
            })
        });

        res.status(200).send({
            status: true,
            message: "File saved successfully",
            body: response
        });
    } catch (e) {
        res.status(400).send({
            status: false,
            body: 'A bad request occurred'
        })
    }
})

app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})
