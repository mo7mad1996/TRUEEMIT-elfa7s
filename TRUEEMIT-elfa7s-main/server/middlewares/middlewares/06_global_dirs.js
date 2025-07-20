const express = require("express");

module.exports = (app) => app.use(express.static("./server/upload"));

/**
 *  this file to handle the uploading of files from users,
 *  it will save them in a folder called `upload`
 *  and then send back as files
 *  GET /:filename - Returns the requested file if it exists,
 *
 *  otherwise 404s with a JSON error object
 **/
