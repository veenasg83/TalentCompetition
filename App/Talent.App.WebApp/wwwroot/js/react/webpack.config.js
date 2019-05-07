let path = require('path');
let webpack = require('webpack');

var talentApiHost, identityApiHost, profileApiHost, mode;

setUpApI = function () {  
    console.log("env", process.env.NODE_ENV );
    switch ( process.env.NODE_ENV.trim() ) {
        case 'production':
            talentApiHost = "'https://talentcompetition.azurewebsites.net/talent'";
            identityApiHost = "'https://talentcompetition.azurewebsites.net/identity'";
            profileApiHost = "'https://talentcompetition.azurewebsites.net/profile'";
            mode = 'production';
            console.log(talentApiHost);
            break;
        default:
            talentApiHost = "'http://localhost:51689'";
            identityApiHost = "'http://localhost:60998'";
            profileApiHost = "'http://localhost:60290'";
            mode = 'development';
            break;
    }
};
setUpApI();

module.exports = {
    context: __dirname,
    mode: mode,
    entry: {
        homePage: './ReactScripts/Home.js'
    },
    output:
    {
        path: __dirname + "/dist",
        filename: "[name].bundle.js"
    },
    plugins: [
        new webpack.DefinePlugin({
            _API_Talent_:talentApiHost,
            _API_Identity_: identityApiHost,
            _API_Profile_: profileApiHost,
            
        })
       
    ],
    watch: true,
    mode: 'development',
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.css$/,
                loaders: [
                    'style-loader',
                    'css-loader?modules'
                ]
            }
        ]
    }
}


