/**
 * Created by Chiragkumar Rupani on 10/10/2015.
 */
var mongoose = require('mongoose');
var gracefulShutdown;
var dbUrl = 'mongodb://127.0.0.1/Elixir';

if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
    dbUrl = process.env.MONGOLAB_URI;
}

mongoose.connect(dbUrl);

// CONNECTION EVENTS
mongoose.connection.on('connected', function () {
    console.log('Mongoose connected to ' + dbUrl);
});

mongoose.connection.on('error', function (error) {
    console.log('Mongoose connection error: ' + error);
});

mongoose.connection.on('disconnected', function () {
    console.log('Mongoose disconnected');
});

// CAPTURE APP TERMINATION / RESTART EVENTS
// To be called when process is restarted or terminated
gracefulShutdown = function (message, callback) {
    mongoose.connection.close(function () {
        console.log('Mongoose disconnected through ' + message);
        callback();
    });
};

process.once('SIGUSR2', function () {
    gracefulShutdown('nodemon restart', function () {
        process.kill(process.pid, 'SIGUSR2');
    });
});

process.on('SIGINT', function () {
    gracefulShutdown('app termination', function () {
        process.exit(0);
    });
});

process.on('SIGTERM', function () {
    gracefulShutdown('Heroku app termination', function () {
        process.exit(0);
    });
});

// BRING IN YOUR SCHEMAS & MODELS