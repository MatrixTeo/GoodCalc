(function($){
   $.powerTouch = function(options)
   {
         var gconfig = $.extend({
		   debug: false,
		}, options || {});
		
		events={"mousedown":"mousedown", "mousemove":"mousemove", "mouseup":"mouseup"};
		if ("ontouchstart" in document.documentElement)
		{
			events={"mousedown":"touchstart", "mousemove":"touchmove", "mouseup":"touchend"};
		}
		Global={};
		Global.config=gconfig;
		Global.catOrigin={};
		Global.drag=false;
		Global.Target={};
		
		// Gesture
		Global.dragGesture=false;
		Global.Gesture={ "start": [0,0], "end":[0,0], "time":0 };

		Global.Gesture.startTimer=function(){
			Global.Gesture.time++;
			Global.Gesture.timer=setInterval(function(){
				Global.Gesture.time++;
			}, 5);
		};
		Global.Gesture.stopTimer=function(){
			clearInterval(Global.Gesture.timer);
			Global.Gesture.time=0;
		};
		
		//- Gesture
		
		$(document).on(events.mousemove, "html", function(event){
			if(Global.dragGesture){
				event.preventDefault();
			}
			if(Global.drag==true){
				event.preventDefault();
				Global.catOrigin=Global.getCoord(Global.catOrigin.target);
				event=Global.manipulateEvent(event);
				var catOrigin=Global.catOrigin;
				if(!(
					event.pageX > catOrigin.left && event.pageX < catOrigin.left+catOrigin.width &&
					event.pageY > catOrigin.top && event.pageY < catOrigin.top+catOrigin.height
				)){
					catOrigin.target.removeClass("hover");
					catOrigin.target.data("hover", false);
				}
				else {
					catOrigin.target.addClass("hover");
					catOrigin.target.data("hover", true);
					
				}
			}
		});
		
		$(document).on(events.mouseup, "html", function(event){
			Global.drag=false;
			
			if(Global.dragGesture){
				event=Global.manipulateEvent(event);
				Global.Gesture.end[0]=event.pageX;
				Global.Gesture.end[1]=event.pageY;
				var gestureX = Global.Gesture.end[0]-Global.Gesture.start[0];
				var gestureY = Global.Gesture.end[1]-Global.Gesture.start[1];
				
				var gestureP = Math.sqrt ( Math.pow(Math.abs(gestureX), 2)+Math.pow(Math.abs(gestureY), 2) );
				// Swipe 
				var speed=gestureP/Global.Gesture.time;
				var acceleration=speed/Global.Gesture.time;
				if(acceleration*100 > Global.Target.config.acceleration && Global.Gesture.time < 80 && Global.Gesture.time > 5){
					if(Math.abs(gestureX) >= Math.abs(gestureY) ){ // left or right
						if(gestureX > 0){ // right
							Global.catOrigin.target.trigger("swiperight");
						}
						else { // left
							Global.catOrigin.target.trigger("swipeleft");
						}
					}
					else {
						if(gestureY > 0){ // down
							Global.catOrigin.target.trigger("swipedown");
						}
						else { // up
							Global.catOrigin.target.trigger("swipeup");
						}
					}
				}
				//- Swipe 
				Global.Gesture.stopTimer();
			}
			Global.dragGesture=false;
		});
		
		Global.manipulateEvent =function getCoord(event){
			if(!event.pageX){
				if(event.originalEvent.targetTouches[0]){
					var endCoords = event.originalEvent.targetTouches[0];
				}
				else if(event.originalEvent.changedTouches[0]){
					var endCoords = event.originalEvent.changedTouches[0];
				}
				event.pageX=endCoords.pageX;
				event.pageY=endCoords.pageY;
			}
			return event;
		};
		
		Global.getCoord =function getCoord(target){
			 var tmp={} || null;
			 tmp={
				"width":parseInt(target.outerWidth()), 
				"height":parseInt(target.outerHeight()),
				"left":parseInt(target.offset().left),
				"top":parseInt(target.offset().top), 
				"target":target
			};
			return tmp;
		};
		
		var Interface ={
			"attachTouch": function(selector, options){
				 var config = $.extend({
				   touchstart: function(){},
				   ghost: false,
				   delay: 0,
				   selector: ".ui-el",
				}, options || {});
				
				$(selector).each(function(){
					Attach($(this), config);
				});
			},
			"attachGesture": function(selector, options){
				 var config = $.extend({
				   touchstart: function(){},
				   selector: ".ui-gesture",
				}, options || {});
				$(selector).each(function(){
					AttachGesture($(this), config);
				});
			}
		};
		
		return Interface;
   };
   var Attach=function(el, config){
		var Local={};
		Local.catOrigin={};
		Local.longtimer=false;
		Local.longtimer_used=false;
		el.on(events.mousedown, function(event){
			Global.catOrigin=Global.getCoord($(this));
			Local.catOrigin=Global.catOrigin;
			Global.drag=true;
			Local.catOrigin.target.data("hover", true);
			$(this).addClass("hover");
			if($(this).attr("data-longtap")){
				if (Local.longtimer) {
					clearTimeout( Local.longtimer );
				}
				Local.longtimer=setTimeout(function(){
					if(Local.catOrigin.target.data("hover")){
						Local.catOrigin.target.trigger("longtap");
						Local.catOrigin.target.addClass("longtap");
						$(Local.catOrigin.target).removeClass("hover");
						Local.longtimer_used=true;
					}
				},400);
			}
			config.touchstart(el, event);
		});
		
		el.on(events.mouseup, function(event){
			Global.catOrigin=Global.getCoord($(this));
			Local.catOrigin=Global.catOrigin;
			if (Local.longtimer) {
				clearTimeout( Local.longtimer );
			}
			if(Global.config.debug){
				console.log( "Local.longtimer_used:"+Local.longtimer_used );
			}
			if($(Local.catOrigin.target).data("hover")==true){
				$(Local.catOrigin.target).data("hover", false);
				Global.drag=false;
				var disable_tap;
				if(!Local.longtimer_used){
					disable_tap=true;
				}
				if(disable_tap){
					$(Local.catOrigin.target).trigger("tap");
				}
				if(config.delay==0){
					$(Local.catOrigin.target).removeClass("hover");
				}
				else {
					setTimeout(function(){
						$(Local.catOrigin.target).removeClass("hover");
					}, config.delay);
				}
			}
			Local.longtimer_used=false;
		});
   
   };
   
   var AttachGesture=function(el, config){
		var Local={};
		Local.drag=false;
		el.on(events.mousedown, function(event){
			Global.dragGesture=true;
			event.preventDefault();
			Global.catOrigin=Global.getCoord($(this));
			Global.Target.config=config;
			event=Global.manipulateEvent(event);
			Global.Gesture.start[0]=event.pageX;
			Global.Gesture.start[1]=event.pageY;
			Global.Gesture.startTimer();
		});

		
   };
})(jQuery);
