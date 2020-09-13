const router = require('express').Router();

module.exports = router;

/* GET home page. */
router.get('/', (req, res) => {
    // res.send("Hello world");

    res.sendFile(`${process.cwd()}/public/uploadCSV.html`, (err) => {
        res.end();

        if (err) throw err;
    });
});
