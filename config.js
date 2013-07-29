seajs.config({
	// 配置插件
	plugins: ['shim'],

	// 配置别名
	alias: {
		'jquery': {
			src: 'jquery-1.9.1.js',
			exports: 'jQuery'
		}
	}
});