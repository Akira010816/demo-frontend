const withLess = require('@zeit/next-less')
const lessToJS = require('less-vars-to-js')
const withPlugins = require('next-compose-plugins')
const withCSS = require('@zeit/next-css')

const fs = require('fs')
const path = require('path')

const dotenv = require('dotenv')

dotenv.config()

// Where your antd-custom.less file lives
const themeVariables = lessToJS(
    fs.readFileSync(path.resolve(__dirname, './assets/antd-custom.less'), 'utf8')
)

// fix: prevents error when .less files are required by node
if (typeof require !== "undefined") {
    require.extensions[".less"] = (file) => {};
}

module.exports =
    withCSS({
        cssModules: true,
        cssLoaderOptions: {
            localIdentName: "[local]___[hash:base64:5]",
        },
        ...withLess({
                lessLoaderOptions: {
                    javascriptEnabled: true,
                    modifyVars: themeVariables
                },
                webpack:(config, {isServer}) => {
                    if (isServer) {
                        const antStyles = /antd\/.*?\/style.*?/
                        const origExternals = [...config.externals]
                        config.externals = [
                            (context, request, callback) => {
                                if (request.match(antStyles)) return callback()
                                if (typeof origExternals[0] === 'function') {
                                    origExternals[0](context, request, callback)
                                } else {
                                    callback()
                                }
                            },
                            ...(typeof origExternals[0] === 'function' ? [] : origExternals),
                        ]

                        config.module.rules.unshift({
                            test: antStyles,
                            use: 'null-loader',
                        });
                        config.module.rules.push({
                            test: /\.svg$/,
                            issuer: {
                                test: /\.(js|ts)x?$/,
                            },
                            use: ['@svgr/webpack'],
                        });
                        config.module.rules.push({
                            test: /\.(ttf|eot|svg|gif|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                            use: [{
                                loader: 'url-loader'
                            }]
                        });
                    } else {
                        config.module.rules.push({
                            test: /\.(ttf|eot|svg|gif|png)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                            use: [{
                                loader: 'url-loader'
                            }]
                        });
                    }
                    return config
                }
            }
        )
    }
);

