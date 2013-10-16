(function ( $ ) {
 
    $.fn.powerTouch = function( options ) {
		
        // This is the easiest way to have default options.
        var settings = $.extend({
        }, options );
		
		/*
			@User interface
		*/
		function UI(){
			mywindow={"height": $(window).height(), "width": $(window).width() };
			if( $(".menu-bottom").length > 0 ){
				hmb=$(".menu-bottom").outerHeight();
				
				$(".tree").css({"height": mywindow.height-hmb});
			}
			$(".tree").each(function(){
				size=$(this).find("li").children().length;
				li=$(this).children("li");
				$(this).css({"width": mywindow.width*size});
				li.css({"width": mywindow.width});
				size_content=mywindow.height-li.find(".navigation").outerHeight();
				$(".ui-fixed").each(function(){
					size_content -= $(this).outerHeight();
				});
				
				li.find(".content").css({"height":size_content});
			});
		}
		UI(); 
		$(window).resize(function(){ 
			UI(); 
		}); // refresh UI
		/*
			@End User interface
		*/
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
		animationEnd=true;
		disable=false;
		speedClick="a.button, .listView li a, .ui-el";
		tapped="a.button, .listView li a, .block-switch .switch-circle, .ui-el, .menu li a";
		
		
		menufix=false;
		$(document).on("touchstart mousedown", ".menu li a", function(event){ menufix=true;});
		$(document).on("touchend mouseup", ".menu li a", function(event){ menufix=false;});
		
		$(document).on("touchstart mousedown", tapped, function(event){
			
			
			//event.preventDefault();
			if(animationEnd==false){ return true; }
			drag=true;
			
			$(this).addClass("hover");
			//$(this).data("hover",true);
			//$(this).trigger("tap");return true;
			// coordinate iniziali
			
			getCoord($(this));
			if(menufix==true){ return false; }
			if (!(typeof longtimer === 'undefined')) {
				clearTimeout( longtimer );
			}
			longtimer=setTimeout(function(){
				if(catOrigin.target.hasClass("hover")){
				//if( catOrigin.target.data("hover")==true){
					catOrigin.target.trigger("longtap");
				}
			},400);
			
		});
		
		$(document).on("touchmove mousemove", "html", function(event){
			if(!$(event.target).parents(".scrollable").hasClass("scrollable") || slider.drag==true ) {
				event.preventDefault();
				return false;
			}
			drag=false;
		});
		
		$(document).on("touchmove mousemove", "html", function(event){
			
			if(drag==true){
				//event.preventDefault();
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
				}
			}
			else{
				if (!(typeof catOrigin === 'undefined')) {
					catOrigin.target.removeClass("hover");
				}
			}
			

		});

		$(document).on("touchend mouseup", "html", function(){
			clearTimeout( longtimer );
			if(drag==true && animationEnd == true){
				drag=false;
				if(catOrigin.target.hasClass("longtap")){
					catOrigin.target.removeClass("longtap");
					catOrigin.target.removeClass("hover");
				}
				else if(catOrigin.target.hasClass("hover")){
				//if( catOrigin.target.data("hover")==true){
					catOrigin.target.removeClass("hover");
					catOrigin.target.trigger("tap");
				}	
			}
		});

		$(document).on("tap", speedClick, function(event) {
			
			list=$(this).parents("ul.ajaxList");
			ajax=list.attr("data-ajax");
			ajax_=$(this).attr("data-ajax");
			if( ajax_ ){
				ajax=ajax_;
			}
			//tree=$(this).parents("ul.tree");
			par=$(this).attr("data-post");
			if( ajax && par ){
				
				params=$(this).attr("data-post");
				target=list.attr("data-targetPanel");
				target_=$(this).attr("data-targetPanel");
				if( target_ ){
					target=target_;
				}
				$.ajax({
					type: "POST",
					url: ajax,
					data: params,
					dataType: "json",
					success: function(data){
						
						if( data.html ){
							$.each(data.html, function(i, html){
								
								$(target).find( i ).html( html );
							});
						}
					}
				});
				effect=list.attr("data-effect");
				animatePanel(target, effect, 1);
			}
			if( $(this).hasClass("back") ){ // indietro
				animatePanel($(this).parents(".panel"), last_effect, 0);
			}
			if( $(this).hasClass("menu") ){ // menu
				if( $(".framework").hasClass("slideright") ){
					$(".framework").removeClass("slideright");
				}
				else
				{
					$(".framework").addClass("slideright");
				}
			}
		});
		
		last_effect="slide";
		function animatePanel(t, effect, next){
			target=t;
			
			panel=$(target);
			panel.show();
			tree=panel.parents("ul.tree");
			if(effect=="slide" && next==0){
				panel=$(tree.data("prev"));
			}
			width=panel.width();
			c=tree.data("number");
			if(c==null){
				c=0;
			}
			add=-1;
			if(next==1){
				add=1;
			}
			
			if(effect=="popIn" || effect=="popOut" || effect=="slideUp" || effect=="slideBottom" || effect=="slideLeft"){
				
					if(effect=="popIn" || effect=="popOut"){
						p="pop";
					}
					if(effect=="slideUp" || effect=="slideBottom" || effect=="slideLeft"){
						p="slide";
					}

					ef=effect;
					animationEnd=false;
					if(next==0){ // remove
						panel.addClass(ef);
						
						panel.bind("webkitTransitionEnd", function(){
							tree.find("li.panel").removeClass("p");
							panel.removeClass(p+" animate "+ef);
							panel.unbind("webkitTransitionEnd");
							panel.hide();
							animationEnd=true;
						});
					}
					else{
						last_effect=effect; 
						
						panel.css({"z-index":(100+c)});
						tree.find("li.panel").addClass(p);
						panel.addClass(ef);panel.addClass(ef+"_");
						panel.height();
						panel.addClass("animate");
						panel.removeClass(ef);
						panel.bind("webkitTransitionEnd", function(){
							animationEnd=true;
							panel.unbind("webkitTransitionEnd");
						});
					}
			}
			else{ // slide
					last_effect="slide";
					
					move=((c+add)*width);
					
					tree.data({"effect": "slide", "number":c+add, "prev":target});
					tree.css({"-webkit-transform":"translateX(-"+move+"px)"});
					
					animationEnd=false;
					tree.bind("webkitTransitionEnd", function(e){
						animationEnd=true;
						tree.unbind("webkitTransitionEnd");
						//if(next==0){ panel.hide(); }
					});
			}
			
			
		}

		
		
		/* UI REPLACEMENT */
		function uiBuild(){
		$(".listView li a").each(function(){
			$(this).append("<span class='arrow-right'></div>");
		});
			/* Switches */
			$(".block-switch").each(function(){
				input=$(this).find("input");
				c="";
				if(!input.attr("checked")){
					c=" inactive";
				}
				$(this).find("span").html( "<div class='switch-container'><a class='switch-circle"+c+"' href='javascript:;'></a><div class='switch-flow'><div class='switch-film"+c+"'>  <div class='switch-active'></div><div class='switch-inactive'></div>   </div></div></div>");
				$(this).find(".switch-film").addClass("animate");
				$(this).find(".switch-circle").addClass("animate");
			});
			
			/* Slider */
			$(".block-slider").each(function(){
				val=$(this).attr("data-value");
				min=$(this).attr("data-min");
				max=$(this).attr("data-max");
				range=max-min;
				$(this).data("range", range);
				$(this).find("input").val( val );
				$(this).find("span").html("<div class='slider-film'><div class='slider-line'></div><div class='slider-circle scrollable'><div class='slider-label'></div></div></div>");
				
				line=$(this).find(".slider-line");
				w=line.width();
				c=$(this).find(".slider-circle");
				c.css({"left": val/range*100+"%"});
				c.find(".slider-label").html( val );
			});
			
			/* Search bar */
			$(".search-bar").each(function(){
				th=$(this);
				th.find("span").html('<i class="icon"></i>');
				cancel=th.find("input").attr("data-cancel");
				if(cancel==1){
					th.find("span").append('<a class="cancel ui-el" href="javascript:;">&times;</a>');
				}
			});
		}
		uiBuild();
		
		/* Switches */
		
		
		$(document).on("tap", ".block-switch .switch-circle", function(){
			p=$(this).parents(".switch-container");
			pp=$(this).parents(".block-switch");
			d=pp.find("input");
			if($(this).hasClass("inactive")){
				d.attr("checked", true);
				$(this).removeClass("inactive");
				p.find(".switch-film").removeClass("inactive");
			}
			else{
				d.attr("checked", false);
				$(this).addClass("inactive");
				p.find(".switch-film").addClass("inactive");
			}
		});
		
		/* Slider */
		
		slider={"drag":false, "target":false, "x":0};
		$(document).on("touchstart mousedown", ".block-slider .slider-circle", function(){
			$(this).addClass("enlarge");
			slider.drag=true;
			slider.target=$(this);
			
		});
		$(document).on("touchmove mousemove", "html", function(event){
			if( slider.drag==true ){
				sli=slider.target.parents(".block-slider");
				if(!event.pageX){
					endCoords = event.originalEvent.targetTouches[0];
					event.pageX=endCoords.pageX;
					event.pageY=endCoords.pageY;
				}
				line=slider.target.parents(".block-slider").find(".slider-line")
				l=line.offset().left;
				w=line.width();
				fx=event.pageX-l;
				//console.log( w );
				if(fx < 0){
					fx=0;
				}
				else if(fx > w){
					fx=w;
				}
				slider.x=fx;
				perc=slider.x/w;
				
				range=sli.data("range");
				min=sli.attr("data-min");
				q=Math.round(perc*range);
				slider.target.css({"left": q/range*100+"%"}); //perc*range
				slider.target.find(".slider-label").html(q+parseInt(min));
				sli.find("input").val( q );
			}
		});
		$(document).on("touchend mouseup", "html", function(){
			if( slider.drag==true ){
				slider.target.removeClass("enlarge");
				slider.drag=false;
			}
		});
		
		
		/* Search bar */
		$(document).on("tap", ".search-bar .cancel", function(){
			$(this).hide();
			input=$(this).parents(".search-bar").find("input");
			input.val("");
			input.focus();
		});
		$(document).on("keyup", ".search-bar input", function(){
			parent=cancel=$(this).parents(".search-bar");
			input=parent.find("input");
			cancel=$(this).parents(".search-bar").find(".cancel");
			if( $(this).val() == ""){
				cancel.hide();
			}
			else {
				cancel.show();
				ajax=parent.attr("data-ajax");
				extra=parent.attr("data-extra-post");
				target=parent.attr("data-target");
				$.ajax({
					type: "POST",
					url: ajax,
					data: "query="+escape(input.val())+"&"+extra,
					dataType: "json",
					success: function(data){
						if( data.html ){
							$.each(data.html, function(i, html){
								$(target).find( i ).html( html );
							});
							
						}
					}
				});
			}
		});
		current_panel=null;
		/* Menu Ajax */
		$(document).on("tap", ".menuAjax li a", function(){
			bottom=false;
			if( $(this).parents(".menu-bottom").length > 0){
				bottom=true;
			}
			el=$(this);
			ajax=el.attr("data-ajax");
			post=el.attr("data-post");
			$.ajax({
				type: "POST",
				url: ajax,
				data: post,
				dataType: "json",
				success: function(data){
					if( data.html ){
						
						$.each(data.html, function(i, html){
							$( i ).html( html );
						});
						if( $(".framework").hasClass("slideright") ){
							$(".framework").removeClass("slideright");
						}
						if(bottom==true){
							tree=$(".tree")
							//tree.addClass("noAnimation");
							tree.css({"-webkit-transform":"translateX(0)"});
							tree.height();
							//tree.removeClass("noAnimation");
							tree.data("number", 0);
						}
						UI();
						uiBuild();
					}
				}
			});
		
		});
		
		$(document).on("focus", "input", function(event){	
			event.preventDefault();
			if(animationEnd==false){ return false; }
		
		});
		
		
		isTouch=false;
		if ("ontouchstart" in document.documentElement)
		{
			$(document).unbind("mousedown mouseup mousemove");
			isTouch=true;
		}
		else
		{
		}
    };
	
}( jQuery ));