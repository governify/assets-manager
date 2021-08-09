const assert = require('assert');
const fs = require('fs');
const path = require('path');
const governify = require('governify-commons')

const server = require('../index');
const Logger = require('governify-commons/logger');
const { Console } = require('console');
const sinon = require('sinon');
const serverUrl = "http://localhost:5200";
const filesPathPrefix = process.env.NODE_ENV === 'production' ? '/home/project' : './files'
// For skipping tests in case of failure

process.env.NODE_ENV = "test"
sinon.stub(console);

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
    describe('#apiPublicDeleteRequest()', function () {
        apiPublicDeleteRequest();
      });
    describe('#apiPublicAuthorizationRequest()', function () {
        apiPublicAuthorizationRequest();
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
    describe('#apiPublicAuthorizationErrorRequest()', function () {
        apiPublicAuthorizationErrorRequest();
      });
    after((done) => {
        server.undeploy(done);
    });
 });

function apiPublicPostRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/testRequests.json')));
    for (const testRequest of testRequests) {
        if (testRequest.type === "POST") {
    
            it('should doc '+ testRequest.docName+' not be previously created (' + testRequest.name + ')', function (done) { 
                var docCreated = fs.existsSync(filesPathPrefix+'/public/'+testRequest.docName)
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
                        'Content-Type': testRequest.contentType
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
                var docCreated = fs.existsSync(filesPathPrefix+'/public/'+testRequest.docName)
                //Check file created successfully
                assert.strictEqual(docCreated,true);
                fs.unlinkSync('./files/public/' + testRequest.docName)
                done();
            });

           
        }
    }
}

function apiPublicGetRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/testRequests.json')));
    for (const testRequest of testRequests) {
        if (testRequest.type === "GET") {
            let responseData;

            it('should respond with 200 OK on GET (' + testRequest.name + ')', function (done) {

                fs.writeFileSync(filesPathPrefix + '/public/'+ testRequest.docName, JSON.stringify(testRequest.body), 'UTF8')

                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    headers: {
                        'User-Agent': 'request'
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
                assert.strictEqual(responseData, testRequest.response ? JSON.stringify(testRequest.response) :  JSON.stringify(testRequest.body));
                fs.unlinkSync('./files/public/' + testRequest.docName)
                done();
            });
        }
    }
}

function apiPublicPutRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/testRequests.json')));
    for (const testRequest of testRequests) {
        if (testRequest.type === "PUT") {

            it('should doc '+ testRequest.docName+' be previously created (' + testRequest.name + ')', function (done) { 

                fs.writeFileSync(filesPathPrefix + '/public/'+ testRequest.docName, JSON.stringify(testRequest.body), 'UTF8')

                var docCreated = fs.existsSync(filesPathPrefix+'/public/'+testRequest.docName)
                //Check file already exist
                assert.strictEqual(docCreated,true);
                done();
            });

            it('should respond with 200 OK on Put (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'PUT',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    data: testRequest.bodyUpdate,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type':testRequest.contentType
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
                        'User-Agent': 'request'
                    }
                    };
                    governify.httpClient.request(options).then(response => {
                        //Check operation successful
                        assert.strictEqual(response.status, 200);
                        //Check correct response
                        assert.strictEqual(JSON.stringify(response.data) , JSON.stringify(testRequest.bodyUpdate));
                        fs.unlinkSync('./files/public/' + testRequest.docName)
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
        if (testRequest.type === "PATCH") {
            let actualData;
            it('should doc '+ testRequest.docName+' be previously created (' + testRequest.name + ')', function (done) { 
                fs.writeFileSync(filesPathPrefix + '/public/'+ testRequest.docName, JSON.stringify(testRequest.body), 'UTF8')
                var docCreated = fs.existsSync(filesPathPrefix+'/public/'+testRequest.docName)
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
                    data: testRequest.body2,
                    headers: {
                        'User-Agent': 'request',
                        'Content-Type': testRequest.contentType
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
                        assert.strictEqual(JSON.stringify(response.data) , JSON.stringify(actualData+testRequest.body2.content));
                        fs.unlinkSync('./files/public/' + testRequest.docName)
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
function apiPublicDeleteRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/testRequests.json')));
    for (const testRequest of testRequests) {
        if (testRequest.type === "DELETE") {

            it('should respond with 200 OK on Delete (' + testRequest.name + ')', function (done) {

                fs.writeFileSync(filesPathPrefix + '/public/'+ testRequest.docName, JSON.stringify(testRequest.body), 'UTF8')

                try {
                    const options = {
                    method: 'DELETE',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    headers: {
                        'User-Agent': 'request'
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
        }
    }
}

function apiPublicAuthorizationRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/testRequests.json')));
    for (const testRequest of testRequests) {
        if (testRequest.type === "Authorization") {
            let responseData;

            it('should respond with Authorization OK  (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/',
                    headers: {
                        'User-Agent': 'request',
                        'Authorization': testRequest.authorization
                    }
                    };
                    governify.httpClient.request(options).then(response => {

                    }).catch(err => {
                        //Check operation Code
                        assert.strictEqual(err.response.status, 409);
                        assert.strictEqual(err.response.data, testRequest.response);
                        done();
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
        if (testRequest.type === "POST") {
    
            it('should doc '+ testRequest.docName+' be previously created (' + testRequest.name + ')', function (done) { 
                fs.writeFileSync(filesPathPrefix + '/public/'+ testRequest.docName, JSON.stringify(testRequest.body), 'UTF8')
                var docCreated = fs.existsSync(filesPathPrefix+'/public/'+testRequest.docName)
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
                        'Content-Type': testRequest.contentType
                    }
                    };
                    governify.httpClient.request(options).then(response => {

                    }).catch(err => {
                        //Check operation status
                        assert.strictEqual(err.response.status, 409);
                        //Check correct response
                        assert.strictEqual(err.response.data, testRequest.response);
                        fs.unlinkSync('./files/public/' + testRequest.docName)
                        done();
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
        if (testRequest.type === "GET" && testRequest.privacy !== "Private") {

            it('should respond with File not found. 404 error on GET Private(' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/api/v1/public/'+ testRequest.docName,
                    headers: {
                        'User-Agent': 'request'
                    }
                    };
                    governify.httpClient.request(options).then(response => {

                    }).catch(err => {
                        //Check operation error
                        assert.strictEqual(err.response.status, 404);
                        //Check error message
                        assert.strictEqual(err.response.data, testRequest.response);
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
        if (testRequest.type === "PUT") {

            it('should doc '+ testRequest.docName+' not be previously created (' + testRequest.name + ')', function (done) { 
                var docCreated = fs.existsSync(filesPathPrefix+'/public/'+testRequest.docName)
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
                        'Content-Type': testRequest.contentType
                    }
                    };
                    governify.httpClient.request(options).then(response => {

                    }).catch(err => {
                     //Check operation status
                     assert.strictEqual(err.response.status, 404);
                     assert.strictEqual(err.response.data, testRequest.response);
                     done();
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
        if (testRequest.type === "PATCH") {

            it('should doc '+ testRequest.docName+' not be previously created (' + testRequest.name + ')', function (done) { 
                var docCreated = fs.existsSync(filesPathPrefix+'/public/'+testRequest.docName)
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
                        'Content-Type': testRequest.contentType
                    }
                    };
                    governify.httpClient.request(options).then(response => {
  
                    }).catch(err => {
                        //Check operation status
                        assert.strictEqual(err.response.status, 404);
                        assert.strictEqual(err.response.data, testRequest.response);
                        done();
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
        if (testRequest.type === "GET" && testRequest.privacy === "Private") {
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

function apiPublicAuthorizationErrorRequest() {
    const testRequests = JSON.parse(fs.readFileSync(path.join(__dirname, '/negativeTestRequests.json')));
    for (const testRequest of testRequests) {
        if (testRequest.type === "Authorization ERROR") {
            let responseData;

            it('should respond with Authorization ERROR  (' + testRequest.name + ')', function (done) {
                try {
                    const options = {
                    method: 'GET',
                    url: serverUrl + '/',
                    headers: {
                        'User-Agent': 'request',
                    }
                    };
                    governify.httpClient.request(options).then(response => {

                    }).catch(err => {
                        //Check operation Code
                        console.log(err.response.data)
                        assert.strictEqual(err.response.status, 401);
                        assert.strictEqual(err.response.data, testRequest.response);
                        done();
                    });
                } catch (err) {
                    assert.fail('Error when sending request');
                }
            });
        }
    }
}
