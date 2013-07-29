define(function(require, exports, module){
	var $ = require('jquery');
	var _guid = 0; //global unique id

	function XmindEditor(node){
		this.cfg = {
			marginH: 200,  //margin width of two node
			marginV: 50,  //margin height of two node
			width: 122,    //default width of node
			height: 38     //default height of node
		};

		this.cache = {};
		this.cache.objects = {};

		if(Object.prototype.toString.call(node) == '[object String]'){
			this.node = $(nstr);
		}else{
			this.node = node;
		}

		this._init();
	}

	$.extend(XmindEditor.prototype, {

		_init: function(){
			var self = this, cache = self.cache, 
				father = $('.uixe'),
				menuBar = father.find('.menuBar'),
				editor = father.find('.editor');

			//set editor height
			editor.height(father.height()-menuBar.height());
		},

		_bindMenuEvent: function(){
			//create node
			menuBar.find('.create').on('click', function(){
				cache.currentCommand = 'create';
				self.createNode();
			});
		}

	});

	return XmindEditor;

});