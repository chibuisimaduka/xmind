define(function(require, exports, module){
	var $ = require('jquery');
	var _guid = 0; //global unique id

	function XmindEditor(){
		this.cache = {};
		this._init();
		this.cfg = {
			marginH: 200,  //margin width of two node
			marginV: 50,  //margin height of two node
			width: 122,    //default width of node
			height: 38     //default height of node
		};
	}

	$.extend(XmindEditor.prototype, {

		createNode: function(){
			var self = this, cache = self.cache, cfg=self.cfg, editor = self.editor,
				objs = cache.objects, libs = cache.indexs, levels = cache.levels, dis = cache.distances,
				id = 'node_'+ guid(), cid = '#'+id,
				tpl = '<div id="'+id+'" contenteditable="true" class="node">在此输入内容 '+id+'</div>';
			
			var node  = $(tpl);
			if(objs.length==0){
				//the first node
				var off = editor.offset(),  lt = (editor.width()-cfg.width)*0.5, tp = (editor.height()-cfg.height)*0.5;
				node.css({left: lt, top: tp}).appendTo(editor);
				var nobj = {id: cid, level:0, parent: 0, top: tp, left: lt, width:cfg.width, height:cfg.height, centerX: lt+cfg.width/2, centerY: tp+cfg.height/2};
				cache.currentNode = nobj;
				objs.push(nobj);
				libs[cid] = objs.length-1;
				levels[0] = [cid];
				dis[0] = [cfg.marginV];

				cache.currentCommand = null;
				node.on('mouseenter', function(){
					var ps = $(this).position(),
						toolbar = editor.find('.toolbar');
					toolbar.show().css({left: ps.left, top: ps.top-35});
					toolbar.find('.icon-move').show();
				});
			} else {
				if(cache.currentNode){
					node.appendTo(editor);
					var cno = cache.currentNode;
					objs.push({id: cid, level:cno.level+1, parent: cno, top:0, left:0, width:cfg.width, height:cfg.height, centerX: cfg.width/2, centerY: cfg.height/2});
					libs[cid] = cache.objects.length-1;
					var ls = levels[cno.level+1] || [];
					ls.push(cid);
					levels[cno.level+1] = ls;
					var ds = dis[cno.level+1] || [];
					ds.push(cfg.marginV);
					dis[cno.level+1] = ds;
					self.render({oper: 'append', id: cno.id});

					node.on('mouseenter', function(e){
						if(!cache.moveTarget){
							var ps = $(this).position(),
								toolbar = editor.find('.toolbar');
							toolbar.show().css({left: ps.left, top: ps.top-35});
							toolbar.find('.icon-move').hide();
							console.log(ps.left, ps.top, objs[libs[cid]].left, objs[libs[cid]].top);
						}
					});
				}
			}

			//bind node event
			node.on('click', function(){
				var libs = cache.indexs, objs = cache.objects, obj = objs[libs[cid]];
				cache.currentNode = obj;
				self.editor.find('.node').removeClass('selected');
				$(this).addClass('selected');
			});
		},

		render: function(opt){
			var self = this, cache = self.cache,
				objs = cache.objects, libs = cache.indexs, levels = cache.levels, dis = cache.distances;

			if(opt.oper == 'append'){
				//append node

				var pix = libs[opt.id],	pn = objs[pix]; //parent node
				var nos = levels[pn.level+1];
				
				self._renderOneLevel(pn, opt);
				if(nos){
					for(var j=0, l=nos.length; j<l; j++){
						var chn = objs[libs[nos[j]]];
						self.render({oper: 'append', id: chn.id});
					}
				}
			} else if(opt.oper == 'delete'){

			}
		},

		_renderOneLevel: function(pn, opt){
			var self = this, cache = self.cache,
				objs = cache.objects, libs = cache.indexs, levels = cache.levels, dis = cache.distances;

			// start from parent node, render all children
			var nos = levels[pn.level+1], distan = dis[pn.level+1], pdistan = dis[pn.level];
			if(nos){
				if(pn.level){
					var chNos = [], chNosmv=[];
					for(var i=0, l=nos.length; i<l; i++){
						if(objs[libs[nos[i]]].parent.id == pn.id){
							chNos.push(nos[i]);
							chNosmv.push(distan[i]);
						}
					}
					if(chNos.length == 0){
						for(var j=0, l=chNos.length; j<l; j++){
							var node = objs[libs[chNos[j]]];
							node.left = pos[j].left;
							node.top = pos[j].top;
							node.centerX = node.left + node.width/2;
							node.centerY = node.top + node.height/2;
							$(node.id).css({left: node.left, top: node.top});
						}
						alert(0);
					}
					var	pos = self._computePosition(pn, chNos, chNosmv),
						pnIdx, pnle = levels[pn.level];
					//get the next node's id of the parent node
					for(var i=0, l=pnle.length; i<l; i++){
						if(pnle[i] == pn.id){
							pnIdx = i;
							break;
						}
					}
					var loop=false, index = nos.length-1, cnh = pos[index].top + objs[libs[nos[index]]].height;
					if(pnIdx != undefined){
						if(cnh > pn.top+pn.height+ pdistan[pnIdx]/2){
							pdistan[pnIdx] = (cnh - pn.top - pn.height)*2;
							loop = true;
						}
					}
					cnh = pos[0].top;
					if(pnIdx != undefined && pnIdx-1>0){
						if(cnh > pn.top-pdistan[pnIdx-1]/2){
							pdistan[pnIdx-1] = (cnh - pn.top)*2;
							loop = true;
						}
					}
					if(loop){
						opt.id = pn.parent.id;
						self.render(opt);
					} else {
						for(var j=0, l=chNos.length; j<l; j++){
							var node = objs[libs[chNos[j]]];
							node.left = pos[j].left;
							node.top = pos[j].top;
							node.centerX = node.left + node.width/2;
							node.centerY = node.top + node.height/2;
							$(node.id).css({left: node.left, top: node.top});
						}
					}
				} else {
					var	pos = self._computePosition(pn, nos, distan);
					for(var j=0, l=nos.length; j<l; j++){
						var node = objs[libs[nos[j]]];
						node.left = pos[j].left;
						node.top = pos[j].top;
						node.centerX = node.left + node.width/2;
						node.centerY = node.top + node.height/2;
						$(node.id).css({left: node.left, top: node.top});
					}
				}
			}
		},

		_computePosition: function(pn, n, d){
			var self = this, cache = self.cache, cfg = self.cfg, objs = cache.objects,
				libs = cache.indexs, dis = cache.distances,
				left = pn.left + self.cfg.marginH, position = [];

			n.sort();
			if(n.length%2){
				//odd number nodes
				var center = Math.ceil(n.length/2)-1, j=0, 
					val = (pn.height-objs[libs[n[center]]].height)*0.5,
					absv = Math.abs(val), sign = absv? val/absv : 0;
				//center node
				position.push({left: left, top: pn.top + sign*absv});

				for(var i=center-1; i>-1; i--){
					//upper part of parent node
					var p = {}, node = objs[libs[n[i]]];
					p.left = left;
					p.top = position[j].top-d[i]-node.height;
					position.push(p);
					j++;
				}
				position.reverse();
				j=position.length-1;
				for(var i=center+1; i<n.length; i++){
					//lower part of parent node
					var p = {}, node = objs[libs[n[i]]];
					p.left = left;
					p.top = position[j].top + d[i] + node.height;
					position.push(p);
					j++;
				}

			} else {
				//even number nodes
				var center = n.length/2-1, j=0;
				//center node
				position.push({left: left, top: pn.centerY- 0.5*d[center] - objs[libs[n[center]]].height});
				
				for(var i=center-1; i>-1; i--){
					//upper part of parent node
					var p = {}, node = objs[libs[n[i]]];
					p.left = left;
					p.top = position[j].top - d[i] - node.height;
					position.push(p);
					j++;
				}
				position.reverse();
				j = position.length-1;
				for(var i=center+1; i<n.length; i++){
					//lower part of parent node
					var p = {}, node = objs[libs[n[i]]];
					p.left = left;
					p.top = position[j].top + d[i] + node.height;
					position.push(p);
					j++;
				}
			}
			return position;
		},

		_init: function(){
			var self = this, cache = self.cache, 
				father = $('.uixe'),
				menuBar = father.find('.menuBar'),
				editor = father.find('.editor');

			self.father = father;
			self.editor = editor;
			cache.objects = [];
			cache.indexs = {};
			cache.levels = {};
			cache.distances = {};

			//set editor height
			editor.height(father.height()-menuBar.height());

			//command event binding
			//new doc
			menuBar.find('.new').on('click', function(){
			});
			//save doc
			menuBar.find('.save').on('click', function(){
			});
			menuBar.find('.color').on('click', function(){
				editor.css('background', '#fff');
			});
			//undo
			menuBar.find('.undo').on('click', function(){
			});
			//redo
			menuBar.find('.redo').on('click', function(){
			});
			//create node
			menuBar.find('.create').on('click', function(){
				cache.currentCommand = 'create';
				self.createNode();
			});
			//copy node
			menuBar.find('.copy').on('click', function(){
			});
			//edit node
			menuBar.find('.edit').on('click', function(){
			});
			//delete node
			menuBar.find('.delete').on('click', function(){
			});
			//move node
			menuBar.find('.move').on('click', function(){
			});
			//move node to the left
			menuBar.find('.toleft').on('click', function(){
			});
			//move node to the right
			menuBar.find('.toright').on('click', function(){
			});
			menuBar.on('selectstart', function(){
				return false;
			});

			var toolbar = editor.find('.toolbar');
			toolbar.find('.icon-move').on('mousedown', function(e){
				if(!e.button){
					var p = toolbar, po = p.position();
					cache.moveTarget={obj: p, left:e.pageX-po.left, top:e.pageY-po.top};
					
					$(document).on('mousemove', function(e){
						var mtar = cache.moveTarget;
						if(mtar){
							var l = e.pageX-mtar.left, t = e.pageY-mtar.top;
							mtar.obj.css({left: l, top: t});
						}
					});
					$(document).on('mouseup', function(e){
						var mtar = cache.moveTarget;
						if(mtar){
							var mo = mtar.obj,
								node = cache.objects[0],
								mop = mo.position(),
								l = mop.left,
								t = mop.top+35;
							node.left = l;
							node.top = t;
							node.centerX = l+node.width/2;
							node.centerY = t+node.height/2;
							cache.moveTarget = null;
							$(node.id).css({left:l, top:t});
							$(document).on('mousemove', null);
							self.render({oper: 'append', id: node.id});
						}
					});
				}
			});
			toolbar.find('.close').on('click', function(){
				toolbar.hide();
			});
		},

		_moveBorder: function(off){
			var self = this,
				menuBorder = self.father.find('.menu-border');
			menuBorder.show().animate({left: off.left-5}, 300, 'swing');
		}

	});

	function guid(){
		return ++_guid;
	}

	function log(){
		for(var i=0, l=arguments.length; i<l; i++){
			console.log(arguments[i]);
		}
	}

	return XmindEditor;
});