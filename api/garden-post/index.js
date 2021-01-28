const { Connection, Request } = require("tedious");
const { config, storageAccess } = require('../constants/constants');
const { v4: uuidv4 } = require('uuid');
var Readable = require('stream').Readable; 
const { BlobServiceClient } = require('@azure/storage-blob');
const multipart = require('parse-multipart');

module.exports = function (context, req) {
    const connection = new Connection(config);
    const ONE_MEGABYTE = 1024 * 1024;
    const uploadOptions = { bufferSize: 4 * ONE_MEGABYTE, maxBuffers: 20 };
    connection.connect(err => {
        if (err) {
            context.log(err.message);
            context.res = {
                status: 500,
                body: "Unable to establish a connection."
            }
            return context.done();
        } else {
            uploadData(connection, req);
        }
    });

    const uploadData = async (connection, req) => {
        const body = req.body;
        const boundary = multipart.getBoundary(req.headers["content-type"]);
        const SPLIT_CHAR = "%#"
        const parts = multipart.Parse(Buffer.from(body), boundary);
        const name = parts[0].filename.split(SPLIT_CHAR)[0].split('name: ')[1];
        const address = parts[0].filename.split(SPLIT_CHAR)[1].split('address: ')[1];
        const email = parts[0].filename.split(SPLIT_CHAR)[2].split('email: ')[1];
        const description = parts[0].filename.split(SPLIT_CHAR)[3].split('description: ')[1];
        const xCoord = parseFloat(parts[0].filename.split(SPLIT_CHAR)[4].split('xCoord: ')[1]);
        const yCoord = parseFloat(parts[0].filename.split(SPLIT_CHAR)[5].split('yCoord: ')[1]);
        var buffer = parts[0].data;
        var stream = new Readable();
        stream.push(buffer);
        stream.push(null);      
        const blobServiceClient = BlobServiceClient.fromConnectionString(storageAccess.storageConnectionString);
        const containerName = 'imagecontainer';
        const containerClient = blobServiceClient.getContainerClient(containerName);
        var uuid = uuidv4();
        var blobNames = [];
        for await (const blob of containerClient.listBlobsFlat()) {
            blobNames.push(blob.name);
        }
        while (blobNames.includes(uuid)) {
            uuid = uuidv4();
        }
        const blockBlobClient = containerClient.getBlockBlobClient(uuid);
        try {
            await blockBlobClient.uploadStream(stream, uploadOptions.bufferSize, uploadOptions.maxBuffers,
                { blobHTTPHeaders: { blobContentType: parts[0].type } });
            context.log(`INSERT INTO gardens(name, address, email, description, xCoord, yCoord, imageURL) VALUES('${name}', '${address}', '${email}', '${description}', '${xCoord}', '${yCoord}', '${blockBlobClient.url}');`);
            request = new Request(`INSERT INTO gardens(name, address, email, description, xCoord, yCoord, imageURL) VALUES('${name}', '${address}', '${email}', '${description}', '${xCoord}', '${yCoord}', '${blockBlobClient.url}');`, err => {
                if (err) {
                    context.log(err);
                    context.res = {
                        status: 500,
                        body: "Failed to connect to execute statement."
                    }
                    return context.done();
                }
            });
            request.on('requestCompleted', () => {
                context.log("SUCCESS!")
                context.res = {
                    body: "SUCCESS"
                }
                return context.done();
            })
            connection.execSql(request);
        } catch (err) {
            context.log(err);
            context.done();
        }
    }
}