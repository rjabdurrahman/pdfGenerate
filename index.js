const express = require('express')
const app = express();
const { executeQuery } = require('./db');
const exphbs = require('express-handlebars');
const { exec } = require("child_process");
const fs = require('fs');
let data = require('./pdf/data');

app.listen(3000, () => console.log('Listening on port 3000'));
app.use(express.json());
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.get('/', async(req, res) => {
    let clients = await executeQuery('SELECT * FROM clients');
    res.render('home', {
        layout: false,
        clients: clients
    });
})

var allParamData;

function dataBinder(obj) {
    let dataArr = data.split('/V (data)');
    for (i in dataArr) {
        dataArr[i] += `/V (data_${i})`;
    }
    allParamData = dataArr.join('');

    for (f in obj) {
        allParamData = allParamData.replace('data_' + f, obj[f]);
    }
    allParamData = allParamData.replace(/data_\d+/g, '');
}

app.get('/pdf/:id', async(req, res) => {
    let clientId = req.params.id;
    let client = await executeQuery(`SELECT * FROM clients WHERE number = ${clientId}`);
    dataBinder({
        '162': client[0].nom,
        '160': client[0].prenom
    });

    fs.writeFile('pdf/data_bind.fdf', allParamData, function(err) {
        if (err) throw err;
        console.log('FDF Saved!');
        // Running CMD
        exec(`./res/bin/pdftk`, (error, stdout, stderr) => {
            if (error) {
                res.send(`error: ${error.message}`);
                return;
            }
            // if (stderr) {
            //     res.send(`stderr: ${stderr}`);
            //     return;
            // }
            // res.send(`stdout: ${stdout}`);
            res.sendFile(__dirname + `/pdf/client_files/${clientId}.pdf`);
        });
        // CMD END
    });
    // Writeen FDF File
})