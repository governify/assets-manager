const express = require('express')
const fs = require('fs');
const mustache = require('mustache');
const app = express();
const port = 3000
const config = require('./configurations')


app.get('*', (req, res) => {
    var response;
    var fileContent;
    console.log(req.query)
    var path = __dirname + '/files' + req.path;
    if (!req.path.toLowerCase().startsWith('/public') ){
       if (!req.query.private_key){
           res.send(500, 'You must specify private key to access private files.')
            return;
        }
        if (req.query.private_key != config.private_key){
            res.send(500, 'Invalid private key.')
            return;
        }
        
    }
    //Check file exists
    if (!fs.existsSync(path)) {
        response = 'File not found.'
        res.send(response);
        return;
    }
    else {
        fileContent = fs.readFileSync(path, 'utf8');
    }

    //Parse response with enviroment variables
    response = mustache.render(fileContent, process.env);

    //Set headers to format content properly
    res.set({
        'Content-Type': 'text/plain',
    });
    //Send response
    res.send(response)

})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})