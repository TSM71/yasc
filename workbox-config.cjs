module.exports = {
	globDirectory: 'dist/',
	globPatterns: [
		'**/*.{png,html,js,json,css}'
	],
	swDest: 'dist/sw.js',
	ignoreURLParametersMatching: [
		/^utm_/,
		/^fbclid$/
	]
};
