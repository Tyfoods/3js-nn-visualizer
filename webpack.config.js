// Require path.
const path = require( 'path' );

// Configuration object.
const config = {
	mode: 'development',
	// Create the entry points.
	entry: {
		//the key here will replace the [name] portion of the output config below.
		index: './src/index.ts',
	},
		// Setup a loader to transpile down the latest and great JavaScript so older browsers
	// can understand it.
	module: {
		rules: [
			// {
			// 	loader: 'babel-loader',
			// 	test: /\.js$/,
			// 	// use: 'babel-loader',
			// 	exclude: [/node_modules/, /three/],
			// 	options: {
			// 		presets: ['@babel/preset-env'],
			// 		plugins: ['@babel/plugin-proposal-optional-chaining'],
			// 	}
			// },
			{
				// Look for any .ts or tsx files.
				test: /\.tsx?$/,
				use: 'ts-loader',
				// Exclude the node_modules + three folder.
				exclude: [/node_modules/, /three/],
				// Use loader to transpile the files.
			},

		]
	},
	// Create the output files.
	// One for each of our entry points.
	output: {
		// [name] allows for the entry object keys to be used as file names.
		filename: '[name].js',
		// Specify the path to the JS files.
		path: path.resolve( __dirname, 'dist' )
	},
	resolve: {
		extensions: [ '.tsx', '.ts', '.js' ],
	},
}

// Export the config object.
module.exports = config;