const assert = require('assert');
const fs = require('fs');
const path = require('path');
const governify = require('governify-commons')

const http = require('../index');
const Logger = require('governify-commons/logger');
const { Console } = require('console');
const serverUrl = "http://localhost:5200";

// For skipping tests in case of failure
const skip = [];
const keep = [];

describe('Tests', function () {
    describe('#apiPublicPostRequest()', function () {
        apiPublicPostRequest();
      });
    describe('#apiPublicGetRequest()', function () {
        apiPublicGetRequest();
      });
    describe('#apiPublicPutRequest()', function () {
        apiPublicPutRequest();
      });
    describe('#apiPublicPatchRequest()', function () {
        apiPublicPatchRequest();
      });
    describe('#apiPublicPostErrorRequest()', function () {
        apiPublicPostErrorRequest();
      });
    describe('#apiPublicGetErrorRequest()', function () {
        apiPublicGetErrorRequest();
      });
    describe('#apiPublicPutErrorRequest()', function () {
        apiPublicPutErrorRequest();
      });
    describe('#apiPublicPatchErrorRequest()', function () {
        apiPublicPatchErrorRequest();
      });
    describe('#privateTestError()', function () {
        privateTestError();
      });

    after((done) => {
        const fileNames = JSON.parse(fs.readFileSync(path.join(__dirname, '/filesNames.json')));
        for (const fileName of fileNames) {
                fs.unlinkSync('./files/public/'+fileName)
        };
        http.undeploy(done);
    });
 });

function apiPublicPostRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/testRequests.json')));
    for (const testRequest of testRequests) {
        if (((keep.length === 0 && !skip.includes(testRequest.name)) || (keep.length !== 0 && keep.includes(testRequest.name))) && testRequest.type === "POST") {
    
            it('should doc '+ testRequest.docName+' not be previously created (' + testRequest.name + ')', function (done) { 
                var docCreated = fs.existsSync('./files/public/'+testRequest.docName)
                //Check file not exist
                assert.strictEqual(docCreated,false);
                done();
            });

            it('should respond with 200 OK on POST (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'POST',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    data: testRequest.body,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        //Check operation successful
                        assert.strictEqual(response.status, 200);
                        //Check correct response
                        assert.strictEqual(response.data, '');
                        done();
                    }).catch(err => {
                    assert.fail('Error on request');
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });

            it('should doce exist after POST (' + testRequest.name + ')', function (done) { 
                var docCreated = fs.existsSync('./files/public/'+testRequest.docName)
                //Check file created successfully
                assert.strictEqual(docCreated,true);
                done();
            });
        }
    }
}

function apiPublicGetRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/testRequests.json')));
    for (const testRequest of testRequests) {
        if (((keep.length === 0 && !skip.includes(testRequest.name)) || (keep.length !== 0 && keep.includes(testRequest.name))) && testRequest.type === "GET") {
            let responseData = '';

            it('should respond with 200 OK on GET (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        //Check operation successful
                        assert.strictEqual(response.status, 200);
                        responseData = JSON.stringify(response.data) 
                        done();
                    }).catch(err => {
                    assert.fail('Error on request');
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });

            it('should respond body be correct data GET (' + testRequest.name + ')', function (done) {
                //Check correct response
                assert.strictEqual(responseData, JSON.stringify(testRequest.body));
                done();
            });
        }
    }
}

function apiPublicPutRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/testRequests.json')));
    for (const testRequest of testRequests) {
        if (((keep.length === 0 && !skip.includes(testRequest.name)) || (keep.length !== 0 && keep.includes(testRequest.name))) && testRequest.type === "PUT") {

            it('should doc '+ testRequest.docName+' be previously created (' + testRequest.name + ')', function (done) { 
                var docCreated = fs.existsSync('./files/public/'+testRequest.docName)
                //Check file already exist
                assert.strictEqual(docCreated,true);
                done();
            });

            it('should respond with 200 OK on Put (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'PUT',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    data: testRequest.body,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        //Check operation successful
                        assert.strictEqual(response.status, 200);
                        done();
                    }).catch(err => {
                    assert.fail('Error on request');
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });

            it('should respond body be correct new data PUT (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        //Check operation successful
                        assert.strictEqual(response.status, 200);
                        //Check correct response
                        assert.strictEqual(JSON.stringify(response.data) , JSON.stringify(testRequest.body));
                        done();
                    }).catch(err => {
                    assert.fail('Error on request');
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }  
            });
        }
    }
}

function apiPublicPatchRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/testRequests.json')));
    for (const testRequest of testRequests) {
        if (((keep.length === 0 && !skip.includes(testRequest.name)) || (keep.length !== 0 && keep.includes(testRequest.name))) && testRequest.type === "PATCH") {
            let actualData = '';
            it('should doc '+ testRequest.docName+' be previously created (' + testRequest.name + ')', function (done) { 
                var docCreated = fs.existsSync('./files/public/'+testRequest.docName)
                //Check file already exist and geting actual data
                assert.strictEqual(docCreated,true);
                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        actualData = JSON.stringify(response.data)
                    }).catch(() => {
                    assert.fail('Error on geting actual data request');
                    });
                } catch (err) {
                    assert.fail('Error when geting actual data sending request');
                }

                done();
            });

            it('should respond with 200 OK on PATCH (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'PATCH',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    data: testRequest.body,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        //Check operation successful
                        assert.strictEqual(response.status, 200);
                        done();
                    }).catch(err => {
                    assert.fail('Error on request');
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });

            it('should respond body be correct appended data PATCH (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        //Check operation successful
                        assert.strictEqual(response.status, 200);
                        //Check correct response with data apendded
                        assert.strictEqual(replaceAll(JSON.stringify(response.data),"\\","") , '"'+actualData+testRequest.body.content+'"');
                        done();
                    }).catch(err => {
                    assert.fail('Error on request');
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }  
            });
        }
    }
}

function apiPublicPostErrorRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/negativeTestRequests.json')));
    for (const testRequest of testRequests) {
        if (((keep.length === 0 && !skip.includes(testRequest.name)) || (keep.length !== 0 && keep.includes(testRequest.name))) && testRequest.type === "POST") {
    
            it('should doc '+ testRequest.docName+' be previously created (' + testRequest.name + ')', function (done) { 
                var docCreated = fs.existsSync('./files/public/'+testRequest.docName)
                //Check file already exist
                assert.strictEqual(docCreated,true);
                done();
            });

            it('should respond with Already exist on POST (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'POST',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    data: testRequest.body,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        //Check operation successful
                        assert.strictEqual(response.status, 200);
                        //Check correct response
                        assert.strictEqual(response.data, 'File already exists.');
                        done();
                    }).catch(err => {
                    assert.fail('Error on request');
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });

        }
    }
}

function apiPublicGetErrorRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/negativeTestRequests.json')));
    for (const testRequest of testRequests) {
        if (((keep.length === 0 && !skip.includes(testRequest.name)) || (keep.length !== 0 && keep.includes(testRequest.name))) 
            && testRequest.type === "GET" && testRequest.privacy !== "Private") {

            it('should respond with File not found. 404 error on GET Private(' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {

                    }).catch(err => {
                        //Check operation error
                        assert.strictEqual(err.response.status, 404);
                        //Check error message
                        assert.strictEqual(err.response.data, 'File not found.');
                        done();
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });
        }
    }
}

function apiPublicPutErrorRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/negativeTestRequests.json')));
    for (const testRequest of testRequests) {
        if (((keep.length === 0 && !skip.includes(testRequest.name)) || (keep.length !== 0 && keep.includes(testRequest.name))) && testRequest.type === "PUT") {

            it('should doc '+ testRequest.docName+' not be previously created (' + testRequest.name + ')', function (done) { 
                var docCreated = fs.existsSync('./files/public/'+testRequest.docName)
                //Check file already exist
                assert.strictEqual(docCreated,false);
                done();
            });

            it('should respond with File doesnt exist, use POST to create a new file on Put (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'PUT',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    data: testRequest.body,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        //Check operation successful
                        assert.strictEqual(response.status, 200);
                        assert.strictEqual(response.data, 'File doesnt exist, use POST to create a new file');
                        done();
                    }).catch(err => {
                    assert.fail('Error on request');
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });     
        }
    }
}

function apiPublicPatchErrorRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/negativeTestRequests.json')));
    for (const testRequest of testRequests) {
        if (((keep.length === 0 && !skip.includes(testRequest.name)) || (keep.length !== 0 && keep.includes(testRequest.name))) && testRequest.type === "PATCH") {

            it('should doc '+ testRequest.docName+' not be previously created (' + testRequest.name + ')', function (done) { 
                var docCreated = fs.existsSync('./files/public/'+testRequest.docName)
                //Check file already exist
                assert.strictEqual(docCreated,false);
                done();
            });

            it('should respond with File doesnt exist, use POST to create a new file on PATCH (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'PUT',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    data: testRequest.body,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        //Check operation successful
                        assert.strictEqual(response.status, 200);
                        assert.strictEqual(response.data, 'File doesnt exist, use POST to create a new file');
                        done();
                    }).catch(err => {
                    assert.fail('Error on request');
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });     
        }
    }
}

function privateTestError(){
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/negativeTestRequests.json')));
    for (const testRequest of testRequests) {
        if (((keep.length === 0 && !skip.includes(testRequest.name)) || (keep.length !== 0 && keep.includes(testRequest.name))) && testRequest.type === "GET" && testRequest.privacy === "Private") {
            it('should respond not specify private key ERROR(' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/api/v1/private/'+ testRequest.docName ,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {

                    }).catch(err => {
                        //Check operation error
                        assert.strictEqual(err.response.status, 500);
                        //Check error message
                        assert.strictEqual(err.response.data, 'You must specify private key to access private files.');
                        done();
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });

            it('should respond invalid Key ERROR(' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/api/v1/private/'+ testRequest.docName +'?private_key=error',
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':'application/json'
                    }
                    };
                    governify.httpClient.request(options).then(response => {

                    }).catch(err => {
                        //Check operation error
                        assert.strictEqual(err.response.status, 500);
                        //Check error message
                        assert.strictEqual(err.response.data, 'Invalid private key.');
                        done();
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });
        }
    }
}

//Support function to replace all caracter \ from strings
function replaceAll(string, search, replace) {
    return string.split(search).join(replace);
  }