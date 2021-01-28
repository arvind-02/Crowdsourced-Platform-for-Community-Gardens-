const config = {
    authentication: {
        options: {
            userName: "everybodyeatsAdmin",
            password: "`JRk'd#6#'$9Mr\"L" //`JRk'd#6#'$9Mr"L
        },
        type: "default"
    },
    server: "everybodyeats.database.windows.net",
    options: {
        database: "EverybodyEatsDB",
        encrypt: true
    }
};

const storageAccess = {
    storageConnectionString: "DefaultEndpointsProtocol=https;AccountName=everybodyeatsstorage;AccountKey=x3i8uttFjphDJbDPzm6/TTYxXZbPS37AVDH9zRjczB2Ijbk31iGn3z5pjpykRsb6EGXFJ/LmyovwH2nubcDnKQ==;EndpointSuffix=core.windows.net"
}

exports.config = config;
exports.storageAccess = storageAccess;