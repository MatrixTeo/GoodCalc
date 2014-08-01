(function($){
   var powertouch = function(element, options)
   {
		var elem = $(element);
		var obj = this;
		var config = $.extend({
		   touchstart: function(){},
		   touchmovefocus: function(){}
		}, options || {});
		
		tapped=".ui-el";
	   
		isTouch=false;
		var events={"mousedown":"mousedown", "mousemove":"mousemove", "mouseup":"mouseup"};
		if ("ontouchstart" in document.documentElement)
		{
			var events={"mousedown":"touchstart", "mousemove":"touchmove", "mouseup":"touchend"};
			isTouch=true;
		}
		console.log( events );
		var touch = function()
		{
			function getCoord(target){
				catOrigin={
					"width":parseInt(target.outerWidth()), 
					"height":parseInt(target.outerHeight()),
					"left":parseInt(target.offset().left),
					"top":parseInt(target.offset().top), 
					"target":target
				};
			}
			drag=false;
			
			$(document).on(events.mousedown, tapped, function(event){
				event.preventDefault();
				drag=true;
				el=$(this);
				$(this).addClass("hover");
				getCoord($(this));
				if($(this).attr("data-longtap")==1){
					if (!(typeof longtimer === 'undefined')) {
						clearTimeout( longtimer );
					}
					longtimer=setTimeout(function(){
						if(catOrigin.target.hasClass("hover")){
							catOrigin.target.trigger("longtap");
							catOrigin.target.addClass("longtap");
						}
				},400);
				}
				config.touchstart(el, event);

			});


			
			$(document).on(events.mousemove, "html", function(event){
				
				if(drag==true){
					event.preventDefault();
					getCoord(catOrigin.target);
					if(!event.pageX){
						endCoords = event.originalEvent.targetTouches[0];
						event.pageX=endCoords.pageX;
						event.pageY=endCoords.pageY;
					}
					if(!(
						event.pageX > catOrigin.left && event.pageX < catOrigin.left+catOrigin.width &&
						event.pageY > catOrigin.top && event.pageY < catOrigin.top+catOrigin.height
					)){
						catOrigin.target.removeClass("hover");
					}
					else {
						catOrigin.target.addClass("hover");
						config.touchmovefocus(el, event);
					}
				}
				else{
					if (!(typeof catOrigin === 'undefined')) {
						catOrigin.target.removeClass("hover");
					}
				}
				

			});

			$(document).on(events.mouseup, "html", function(event){
				
				if (!(typeof longtimer === 'undefined')) {
					clearTimeout( longtimer );
				}
				if(drag==true){
					drag=false;
					if(catOrigin.target.hasClass("longtap")){
						catOrigin.target.removeClass("longtap");
						catOrigin.target.removeClass("hover");
					}
					else if(catOrigin.target.hasClass("hover")){
						catOrigin.target.removeClass("hover");
						catOrigin.target.trigger("tap");
					}	
				}
			});
			

       };
	   touch();

   };

   $.fn.powerTouch = function(options)
   {
       return this.each(function()
       {
           var element = $(this);
          
           // already exists
           if (element.data('powertouch')) return;

           // pass options
           var powerTouch = new powertouch(this, options);

           // store plugin
           element.data('powerTouch', powerTouch);
       });
   };
})(jQuery);
