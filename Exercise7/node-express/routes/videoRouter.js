const express = require ('express');
const videoRouter = express.Router();
const fs = require('fs');
const path = require ('path');

const filepath = path.join(__dirname, '../db.json');

async function readData() {
    try{
        const data = await fs.promises.readFile(filepath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return {articles:[], videos: []};
    }
};

async function writeData(data) {
    await fs.promises.writeFile(filepath, JSON.stringify(data, null, 2), 'utf8');
};

videoRouter.route('/')
    .get(async (req, res) => {
        try {
            const data = await readData();
            res.status(200).json({
                message: "Will send all the videos to you!",
                videos: data.videos
            });
        } catch (err) {
            res.status(500).send ('Error reading data');
        }
    })

    .post(async (req,res) => {
        try {
            const data = await readData();
            const newId = data.videos.length > 0 ? data.videos[data.videos.length - 1].id + 1 : 1;
            const newVideo = {
                id: newId, 
                title: req.body.title, 
                duration: req.body.duration, 
                author: req.body.author 
            };
            data.videos.push(newVideo);
            await writeData(data);
            res.status(201).json(newVideo);
        } catch (err) {
            res.status(400).json({ message: err.message});
        }
    })

    .put(async (req, res) => {
        res.status(403).end('PUT operation not supported on /videos')
    })

    .delete(async (req, res) => {
    try {
        const data = await readData();
        data.videos = [];
        await writeData(data);
        res.status(200).end('Deleting all videos');
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

videoRouter.route('/:id') 
    .get(async (req, res) => {
        try {
            const data = await readData();
            const Id = Number(req.params.id);
            const video = data.videos.find(a => a.id === Id);
            if (!video) {
                return res.status(404).json({message: `video ${Id} not found`});
            }
            res.status(200).json(video);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    })

    .post(async (req, res) => {
        res.status(403).end('POST operation not supported on /videos/' + + req.params.id);
    })

    .put (async (req, res) => {
        try {
            const data = await readData();
            const Id = Number (req.params.id);
            const index = data.videos.findIndex(a => a.id === Id);
            if (index === -1) {
                return res.status(404).json({message: `video ${Id} not found`});
            }
            data.videos[index] = {
                ...data.videos[index],
                title: req.body.title,
                duration: req.body.duration,
                author: req.body.author
            }
            await writeData(data);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    })

    .delete(async (req,res) => {
        try {
            const data = await readData();
            const Id = Number (req.params.id);
            const index = data.videos.findIndex(a => a.id === Id);
            if (index === -1) {
                return res.status(404).json({message: `video ${Id} not found`});
            }
            // ở vị trí index xóa 1 phần tử
            data.videos.splice(index, 1); 
            writeData(data); 
            res.status(200).end('Deleting video: ' + req.params.id);
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    })

module.exports = videoRouter;