const fs = require("fs");

const nodeModules = {};
fs.readdirSync("node_modules")
	.filter(x => [".bin"].indexOf(x) === -1)
	.forEach(mod => {
		nodeModules[mod] = `commonjs ${mod}`;
	});

const loaders = {
	js: {
		test: /\.js?/,
		use: "babel-loader"
	},
	ts: {
		test: /\.ts?$/,
		exclude: /\/node_modules\//,
		use: ["babel-loader", "ts-loader"]
	},
	json: {
		test: /\.json$/,
		use: "json-loader"
	}
};

 module.exports = {
	target: "node",
	mode: "production",
	externals: nodeModules,
	context: `${__dirname}/src/ts/`,
	entry: [
		`${__dirname}/src/ts/index.ts`],
	resolve: {
		extensions: [".ts", ".js", ".json"]
	},
	output: {
		path: `${__dirname}/build/`,
		filename: `bundle.min.js`
	},
	module: {
		rules: [loaders.ts, loaders.json]
	}
};