var Slider = (function(opts){

	//默认配置
	this.default = {
		el:'.slider-box', //默认选择顶级父元素
		autoPlay:false, //是否开启自动滚动 默认：false
		timeForAuto:1000,//滚动元素自动循环的间隔时间
		timeForAnimate:300 //滚动元素的滚动效果执行时间
	};
	//屏幕元素默认为第一个 0 
	this.iCurrent  = 0;
	//触摸点位置
	this.oPosition = {};
	this.startX = 0;
	this.startY = 0; 
	//滑动元素原始位置
	this.iLeft = 0;
	//内部Slider对象索引
	var _this = this;
	//扩展对象默认配置
	this._extends(opts);
	//jQuery('#lider')
	this._ele = $(this.default.el);
	//jQuery获取活动的元素
	this.oMover = $('ul',this.default.el);
	//获取设置相关预属性
	setAttr();
	//移动端触摸事件
	if(this.isMobile()){
		this.oMover.get(0).addEventListener('touchstart',startFunc,false);
		this.oMover.get(0).addEventListener('touchmove',moveFunc,false);
		this.oMover.get(0).addEventListener('touchend',endFunc,false);
	}else{
		//左右方向箭头按钮点击事件
		if(this._ele.find('.arrow-btn').length)this._ele.find('.arrow-btn').bind('click',function(e){
				var _name = e.target.className;
				if(_name.indexOf('prev') > -1){
					_this.PC('prev');
				}else if(_name.indexOf('next') > -1){
					_this.PC('next');
				}

			}
		)
	}
	//属性预配置
	function setAttr(){
		var $ele = _this._ele;
		//活动元素的宽度
		_this.attrW = Number($ele.find('li').eq(0).css('width').replace('px',''));
		//活动元素的总个数
		_this.attrL = $ele.find('li').length;
		//设置活动元素父元素的相关CSS属性
		var _$totleWidth = _this.attrL * _this.attrW;
		$ele.find('ul').css({
			position:'relative',
			overflow:'hidden',
			margin:0,
			width:_$totleWidth
		})
		_this._autoPlay = _this.default.autoPlay;
		if(_this._autoPlay)_this.autoRuning();
	}
	//手机触摸按下
	function startFunc(e){
		clearInterval(_this.timer);
		setTouchPos(e);
		_this.startX = _this.oPosition.x;
		_this.startY = _this.oPosition.y;
		_this.iLeft = _this.oMover.position().left;
	}
	//当按下时获取鼠标位置信息
	function setTouchPos(e){
		var touches = e.changedTouches;
		var targetX,targetY;
		targetX = touches[0].clientX;
		targetY = touches[0].clientY;
		_this.oPosition.x = targetX;
		_this.oPosition.y = targetY;
	}
	//触摸滑动
	function moveFunc(e){
		setTouchPos(e);
		var _moveX = _this.oPosition.x - _this.startX;
		var _moveY = _this.oPosition.y - _this.startY;
		if(Math.abs(_moveY) < Math.abs(_moveX)){
			e.preventDefault();
			_this.oMover.css({
				left: _this.iLeft + _moveX
			})
		}
	}
	//触摸抬起结束
	function endFunc(e){
		setTouchPos(e);
		var _disX = _this.oPosition.x - _this.startX;
		var _disY = _this.oPosition.y - _this.startY;
		if(Math.abs(_disY) < Math.abs(_disX)){
			if(_disX < 0){//向右滑动
				_this.iCurrent++;
				if(_this.iCurrent < _this.attrL && _this.iCurrent >= 0){
					_this.animating(_this.autoRuning);
				}else{
					_this.iCurrent = _this.attrL - 1;
					_this.animating(_this.autoRuning);
				}
			}else{//向左滑动
				_this.iCurrent--;
				if(_this.iCurrent < 0){
					_this.iCurrent = 0;
					_this.animating(_this.autoRuning);
				}else{
					_this.animating(_this.autoRuning);
				}
			}
		}
	}
});
Slider.prototype._extends = function(opts){
	var _this = this;
	Object.keys(opts).forEach(function(attr){
		_this.default[attr] = opts[attr]
	})
}
Slider.prototype.autoRuning = function(_this){
	var _this = _this || this;
	_this.timer = setInterval(function(){
		_this.iCurrent = _this.iCurrent >= _this.attrL - 1? 0 : _this.iCurrent+1;
		_this.animating();
	},_this.default.timeForAuto)
}
Slider.prototype.animating = function(fn){
	var _this = this;
	this.oMover.stop().animate({
		left : -(this.attrW * this.iCurrent)
	},_this.default.timeForAnimate,'swing',function(){
		_this._autoPlay && fn && (fn)(_this);
	})
}
Slider.prototype.PC = function(type){
	this.timer && clearInterval(this.timer);
	if(type === 'prev'){
		this.iCurrent = this.iCurrent <= 0 ? this.attrL - 1 : this.iCurrent - 1
		this.animating(this.autoRuning);
	}else{
		this.iCurrent = this.iCurrent >= this.attrL - 1 ? 0 : this.iCurrent + 1
		this.animating(this.autoRuning);
	}
}
Slider.prototype.isMobile = function(){
	if (navigator.userAgent.match(/Android/i) || 
		navigator.userAgent.indexOf('iPhone') != -1 || 
		navigator.userAgent.indexOf('iPod') != -1 || 
		navigator.userAgent.indexOf('iPad') != -1
	){
        return true;
    }else {
        return false;
    }
}

new Slider({
	el:'#sliderBox',
	autoPlay:false,
	timeForAuto:1500,
	timeForAnimate:500
});