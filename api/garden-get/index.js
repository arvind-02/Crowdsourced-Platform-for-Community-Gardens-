const { Connection, Request } = require("tedious");
const { config } = require('../constants/constants');

module.exports = function (context, req) {
    var currentData = {};
    const fields = ["ID", "NAME", "ADDRESS", "EMAIL", "DESCRIPTION", "IMAGE_URL"]
    const connection = new Connection(config);

    connection.connect(err => {
        if (err) {
            context.error(err.message);
            context.res = {
                status: 500,
                body: "Unable to establish a connection."
            }
            return context.done();
        } else {
            getGardens();
        }
    });

    const getGardens = () => {

        request = new Request("SELECT * FROM gardens;", err => {
            if (err) {
                context.log(err);
                context.res = {
                    status: 500,
                    body: "Failed to connect to execute statement."
                }
                return context.done();
            }
        });

        request.on('row', columns => {
            currentData[columns[1].value.trim()] = {};
            columns.map((val, idx) => {
                currentData[columns[1].value.trim()][fields[idx]] = val.value;
            })
        });

        request.on('requestCompleted', () => {
            context.res = {
                body: currentData
            }
            return context.done();
        })

        connection.execSql(request);
    }
}