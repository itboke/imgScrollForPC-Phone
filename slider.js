/*
 * @ 基于jquery or zepto
 * @ zepto'plugin as a name is lowSwiper for animating the pictures
 * @ author hzl
*/
var LowSwiper = function(opts){
    this.options = {
        el:'.slider-box',//默认选择顶级父元素
		autoPlay:false, //是否开启自动滚动 默认：false
		timeForAuto:1500,//滚动元素自动循环的间隔时间
		timeForAnimate:300, //滚动元素的滚动效果执行时间
        pagination:true,//是否显示小圆圈 默认是true
        initialSlider:0,//默认显示的元素
		ratio:0.2, //滑动的距离比例才进行运动
        isEnd:false,//是否是滚动到最后一个元素
        nextButton:'',//下一个按钮
        prevButton:'',//上一个按钮
        onTouchEnd:null//一个不知道用处的回调函数
	};
    this.iCurrent = 0;//屏幕元素默认为第一个 0
    this.oPosition = {}; //触摸点位置
    this.startX = 0; //触摸点位置 x
    this.startY = 0; //触摸点位置 y
    this.iLeft = 0; //滑动元素原始位置
    //初始化相关操作属性
    this.attrW,this.attrL,this.totleWidth,this.timer,this.pagination;

    //相关类名
    this.cirCurrent = 'swiper-pagination-bullet-active';//小圆圈 当前类名
    this.cirCommon  = 'swiper-pagination-bullet';//小圆圈CSS类名
    this.cirWrapper = 'swiper-pagination';//小圆圈容器类名
    this.sliderItem = '.swiper-slide';//滚动元素

    $.extend(this.options,opts); //默认信息合并
    this.$ele = $(this.options.el); //对象索引
    this.oMover = this.$ele.find('.swiper-wrapper');//运动的盒子
    var _self = this;

    this.autoPlay = this.options.autoPlay;

    //判断是否存在图片
    if(this.$ele.find(this.sliderItem).length){
        _self.attrW = _self.$ele.get(0).clientWidth;
        _self.attrL = _self.$ele.find(_self.sliderItem).length;
        _self.totleWidth = _self.attrW * _self.attrL;
        _self.oMover.css({
            position:'relative',
            margin:0,
            left:0,
            width:_self.totleWidth
        });
        _self.$ele.find(_self.sliderItem).css('width',_self.attrW + 'px');
        //轮播小圆圈
        _self.pagination = _self.$ele.find('.' + _self.cirWrapper);
        if(_self.options.pagination){
            if(_self.pagination.length){
                var l = _self.attrL;
                while(l--){
                    var $ele = $('<span></span>');
                    // $ele.css({
                    //     display:'inline-block',
                    //     margin:'0 5px',
                    //     width:'.16rem',
                    //     height:'.16rem',
                    //     borderRadius:'50%',
                    //     background:'#fff',
                    //     opacity:'0.8'
                    // });
                    $ele.addClass(_self.cirCommon);
                    _self.pagination.append($ele);
                };
                _self.pagination.find('span').eq(0).addClass(_self.cirCurrent);
            }
        }
        //初始化默认的显示元素
        if(Number(_self.options.initialSlider) > 0){
            _self.iCurrent = Number(_self.options.initialSlider);
            _self.oMover.css({
                left: -(_self.attrW * _self.iCurrent)
            })
        }
        //初始化点击切换事件
        var _opt = _self.options;
        if(_opt.nextButton && _opt.prevButton){
            $(_opt.nextButton).on('click',function(){
                _self.timer && clearInterval(_self.timer);
                if(_self.iCurrent >= _self.attrL - 1){
                    _self.isEnd = true;
                    _self.iCurrent = 0;
                }else{
                    _self.isEnd = false;
                    _self.iCurrent = _self.iCurrent + 1;
                }
                _self.animating(_self.autoRuning);
            })
            $(_opt.prevButton).on('click',function(){
                _self.timer && clearInterval(_self.timer);
                if(_self.iCurrent <= 0){
                    _self.isEnd = false;
                    _self.iCurrent = _self.attrL - 1;
                }else{
                    _self.iCurrent = _self.iCurrent - 1;
                }
                _self.animating(_self.autoRuning);
            })
        }
        if(_self.autoPlay)_self.autoRuning();
    }

    if(_self.oMover.length){
        this.oMover.get(0).addEventListener('touchstart',_self.startFunc.bind(_self),false);
		this.oMover.get(0).addEventListener('touchmove',_self.moveFunc.bind(_self),false);
		this.oMover.get(0).addEventListener('touchend',_self.endFunc.bind(_self),false);
    }
};
//手势之按下触摸
LowSwiper.prototype.startFunc = function(e){
    var _self = this;
    clearInterval(_self.timer);
    _self.touchPos(e);
    _self.startX = _self.oPosition.x;
    _self.startY = _self.oPosition.y;
    _self.iLeft  = _self.oMover.position().left;
};
//手势之获取手势点位置
LowSwiper.prototype.touchPos = function(e){
    var touches,targetX,targetY;
    touches = e.changedTouches;
    targetX = touches[0].clientX;
    targetY = touches[0].clientY;
    this.oPosition.x = targetX;
    this.oPosition.y = targetY;
};
//手势之按下抬起
LowSwiper.prototype.endFunc = function(e){
    var _self = this;
    _self.touchPos(e);
    var _disX = _self.oPosition.x - _self.startX;
    var _disY = _self.oPosition.y - _self.startY;
    if(Math.abs(_disY) < Math.abs(_disX)){
        var ratio = Math.abs(_disX) / _self.attrW;
        if(ratio >= _self.options.ratio){
            if(_disX < 0){//向右滑动
                _self.iCurrent++;
                if(_self.iCurrent < _self.attrL && _self.iCurrent >= 0){
                    _self.animating(_self.autoRuning);
                }else{
                    _self.iCurrent = _self.attrL - 1;
                    _self.animating(_self.autoRuning);
                }
            }else{//向左滑动
                _self.iCurrent--;
                if(_self.iCurrent < 0){
                    _self.iCurrent = 0;
                    _self.animating(_self.autoRuning);
                }else{
                    _self.animating(_self.autoRuning);
                }
            }
        }else{
            _self.animating(_self.autoRuning);
        }
    }
};
//手势之按下滑动
LowSwiper.prototype.moveFunc = function(e){
    var _self = this;
    this.touchPos(e);
    var _moveX = _self.oPosition.x - _self.startX;
    var _moveY = _self.oPosition.y - _self.startY;
    if(Math.abs(_moveY) < Math.abs(_moveX)){
        e.preventDefault();
        _self.oMover.css({
            left: _self.iLeft + _moveX
        })
    }
};
//自动滚动
LowSwiper.prototype.autoRuning = function(_self){

    var _self = _self || this;
    _self.timer && clearInterval(_self.timer);
    _self.timer = setInterval(function(){
        _self.iCurrent = _self.iCurrent >= _self.attrL - 1? 0 : _self.iCurrent + 1;
        _self.animating();
    },_self.options.timeForAuto);
};
//运动函数
LowSwiper.prototype.animating = function(fn){
    var _self = this;
    _self.oMover.animate({
        left : -(_self.attrW * _self.iCurrent)
    },_self.options.timeForAnimate,'swing',function(){
        _self.autoPlay && fn && (fn)(_self);
    })
    if(_self.options.pagination){
        _self.pagination.find('span').removeClass(_self.cirCurrent).eq(_self.iCurrent).addClass(_self.cirCurrent);
    }
    if(typeof _self.options.onTouchEnd === 'function'){
        _self.activeIndex = _self.iCurrent;
        _self.options.onTouchEnd(_self);
    }
};
//滑动向哪一个元素
LowSwiper.prototype.slideTo = function(index){
    this.iCurrent = Number(index);
    this.timer && clearInterval(this.timer);
    this.animating(this.autoRuning);
};
//窗口改变
LowSwiper.prototype.resize = function(){
    var _self = this;
    $(window).resize(function(){
        _self.attrW = _self.$ele.get(0).clientWidth;
    })
};
module.exports = LowSwiper;
