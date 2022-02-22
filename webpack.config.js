const path = require("path");

module.exports = {
    entry: './public/js/index.js',

    output: {
        path: path.resolve(__dirname, 'public/dist'),
        filename: 'script.min.js'
      },

      mode: 'development'


};