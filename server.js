require('dotenv').config()

const express = require('express');
const cors = require('cors')
const db = require('./db')

const app = express();

app.use(cors());
app.use(express.json());

// Get all restaurants

app.get('/api/v1/restaurants', async (req, res) => {
    try {

        const result = await db.query('SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id;')

        res.status(200).json({
            status: 'success',
            result: result.rows.length,
            data: {
                restaurants: result.rows
            }
        })
    } catch (e) {
        console.log(e)
    }
})

// Get one restaurant

app.get('/api/v1/restaurants/:id', async (req, res) => {
    try {
        const restaurant = await db.query('SELECT * FROM restaurants LEFT JOIN (SELECT restaurant_id, COUNT(*), TRUNC(AVG(rating),1) AS average_rating FROM reviews GROUP BY restaurant_id) reviews ON restaurants.id = reviews.restaurant_id WHERE id = $1', [req.params.id])

        const reviews = await db.query('SELECT * FROM reviews WHERE restaurant_id = $1', [req.params.id])

        res.status(200).json({
            status: 'success',
            data: {
                restaurant: restaurant.rows[0],
                reviews: reviews.rows
            }
        })
    } catch (e) {
        console.log(e)
    }
})

// Create One restaurant

app.post('/api/v1/restaurants', async (req, res) => {
    try {
        const body = req.body;
        const result = await db.query('INSERT INTO restaurants (name, location, price_range) VALUES ($1, $2, $3) RETURNING *', [body.name, body.location, body.price_range])
        res.status(201).json({
            status: 'success',
            data: {
                restaurant: result.rows[0]
            }
        })
    } catch (e) {
        console.log(e)
    }
})

// Update One restaurant

app.put('/api/v1/restaurants/:id', async (req, res) => {
    try {
        const body = req.body;
        const params = req.params;
        const result = await db.query('UPDATE restaurants SET name = $1, location = $2, price_range = $3 WHERE id = $4 RETURNING *', [body.name, body.location, body.price_range, params.id])
        res.status(200).json({
            status: 'success',
            data: {
                restaurant: result.rows[0]
            }
        })
    } catch (e) {
        console.log(e)
    }
})

// Delete One restaurant

app.delete('/api/v1/restaurants/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM restaurants WHERE id = $1', [req.params.id])
        res.status(204).json({
            status: 'success'
        })
    } catch (e) {
        console.log(e)
    }
})

// Create One review

app.post('/api/v1/restaurants/:id/addReview', async (req, res) => {
    try {
        const body = req.body;
        const params = req.params;
        const result = await db.query('INSERT INTO reviews (restaurant_id, name, content, rating) VALUES ($1, $2, $3, $4) RETURNING *', [params.id, body.name, body.content, body.rating])
        res.status(201).json({
            status: 'success',
            data: {
                review: result.rows[0]
            }
        })
    } catch (e) {
        console.log(e)
    }
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is up and listening on port ${port}`)
});