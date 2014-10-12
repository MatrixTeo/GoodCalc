$(function(){
	var Memory;
	var Core={};
	Core.getCurrentText=function(){
		return $("#text").html();
	}
	Core.appendMemToText=function(s){
		var new_s;
		var sign=s.substr(0, 1);
		new_s=s;
		if(sign=="+" || sign=="-"){
			new_s=s.substr(1, (s.length-1));
		}
		Core.appendToText(new_s);
	}
	Core.appendToText=function(s){
		$("#text").append(s);
		resizeString();
	}
	
	// film function
	var Film=function(){
		this.film=$("#string-film");
		this.frameHeight=0;
		this.frames=this.film.find(".text-frame");
		this.assignID=function(frame, id){
			frame.attr("id", "text-frame-"+id);
		};	
		this.create=function(frame, id){
			frame.attr("id", "text-frame-"+id);
		};
		this.size=function(){
			var fr=$("#string");
			this.frameHeight=fr.height();
			var num=this.film.find(".text-frame").length;
			this.film.css({"height": (fr.height()*num)+"px"});
			this.frames=this.film.find(".text-frame");
			this.frames.css({"height":this.frameHeight+"px"});
			this.slideTo(this.currentID, true);
		};
		this.sizeFrame=function(id){
			$("#text-frame-"+id).css({"height": this.frameHeight+"px"});
		}
		this.count=function(){
			return this.film.find(".text-frame").length;
		}
		this.append=function(s, not_slide){
			var $el=$('<div class="text-frame"><div class="text-frame-cell"><span id="text" class="text"></span></div></div>');
			
			var idf=this.count();
			if( (this.currentID+1) < idf){
				var precount=this.count();
				for( a=(this.currentID+1); a<precount; a++){
					console.log(a);
					$("#text-frame-"+a).remove();
				}
				idf=this.count();
			}
			$el.attr( "id", "text-frame-"+idf);
			$el.find(".text").attr("id", "text");
			$el.find(".text").html(s);
			this.film.append($el);
			this.sizeFrame(idf);
			noanimation=false;
			if(not_slide){
				noanimation=true;
			}
			this.slideTo(idf, noanimation);
			
		};
		this.slideTo=function(id, noanimation){
			
			if( id > (this.count()-1) || id < 0){
				return true;
			}
			var move=this.frameHeight*id;
			
			this.currentID=id;
			if(noanimation){
				this.film.addClass("noAnimation");
			}
			this.film.css({"transform": "translate3d(0px, -"+move+"px, 0px)"});
			if(noanimation){
				this.film.height();
				this.film.removeClass("noAnimation");
			}
			this.film.find("#text").attr("id", false);
			$("#text-frame-"+id).find(".text").attr( "id", "text");
			
		};
		this.append("", true);
		this.size();
		var context=this;
		$(window).resize(function(){
			context.size();
		});
		return this;
	};
	
	var FilmObj= new Film();
	
	search_regex_pre=["^([0-9\.]+)([\-\+\*\:])([0-9]+)\%$"];
	replace_regex_pre=["$1$2($3\%$1)"];
	
	search=["]", "}", "[", "{", ":", "%"];
	replace=[")", ")", "(", "(", "/", "/100*"];
	
	search_regex=["\\π([0-9]+)", "([0-9]+)\\π", "\\π", 
	"\\e([0-9]+)", "([0-9]+)\\e", "\\e",
	
	"asin\\((.*?)\\)", 
	"acos\\((.*?)\\)",
	"atan\\((.*?)\\)",
	
	"tan\\((.*?)\\)",
	"sqrt\\((.*?)\\)", "sin\\((.*?)\\)", "cos\\((.*?)\\)", "log\\((.*?)\\)", "ln\\((.*?)\\)", "([0-9]+)\\!", "(\\*)+", "(\\/)+",
	"([0-9]+)root\\((.*?)\\)",
	"(([0-9]+)(\.([0-9]+))*)\\^([0-9]+)",
	
	"sin_", "cos_",
	"tan_",
	];
	replace_regex=[
	"Math.PI*$1","$1*Math.PI", "Math.PI",
	"Math.E*$1","$1*Math.E", "Math.E",
	
	"Math.asin_($1)", 
	"Math.acos_($1)",
	"Math.atan_($1)",
	
	"Math.tan($1)",
	"Math.sqrt($1)", "Math.sin($1)", "Math.cos($1)", "Math.log($1)", "Math.ln($1)", "rFact($1)", "*", "/",
	"Math.pow($2, 1/$1)",
	"Math.pow($1, $5)",
	
	"sin", "cos",
	"tan"
	];
	s="sqrt(13)";
	
	function rFact(num)
	{
		if (num === 0)
		  { return 1; }
		else
		  { return num * rFact( num - 1 ); }
	}
	function exec(string){
		string2=string;
		for(a=0; a<search_regex_pre.length; a++){ // regex
			myregexp= new RegExp(search_regex_pre[a],"g");
			string2=string2.replace( new RegExp(search_regex_pre[a],"g"), replace_regex_pre[a] );
		}
		
		for(a=0; a<search.length; a++){ // classico
			string2=string2.replace( search[a], replace[a] );
		}
		for(a=0; a<search_regex.length; a++){ // regex
			myregexp= new RegExp(search_regex[a],"g");
			mymatch = myregexp.exec(string2);
			if(a==8){ // negative values under root
				if(mymatch!=null){
					if(mymatch[1] < 0){
						string2="0*";
						break;
					}
				}
			}
			string2=string2.replace( new RegExp(search_regex[a],"g"), replace_regex[a] );
		}
		$(".result").removeClass("error");
		res2=string;
		var error=false;
		try
		{
			console.log(string2);
		  eval("res2="+string2+";");
		}
		catch(e)
		{
		  error=true;
		}

		if(error || isNaN(res2)){
			$(".result").addClass("error");
			res2=string;
		 }
		return res2;
	}
	function res(){
		el=$("#text");
		r=exec(el.html());
		FilmObj.append(r);
		//el.html( r );
	}
	getIn=parseInt($("#text").css("font-size"));
	function resizeString(){
		
		if( $("#text").html() == ""){
			$(".cwrap").addClass("hide");
		}
		else{
			$(".cwrap").removeClass("hide");
		}
		var el_resize=$("#text");
		winner=el_resize.outerWidth();
		wouter=$("#exp").outerWidth();
		gap=0.1;
		gett=parseInt(el_resize.css("font-size"));
		if(winner > wouter){
			//console.log( $("#text").css("font-size")*0.9 );
			factor=1-gap;
			while(1){
				texf=parseInt(el_resize.css("font-size"))*factor;
				last=texf;
				
				el_resize.css("font-size", texf+"px");
				winner=el_resize.outerWidth();
				wouter=$("#exp").outerWidth();
				
				if(winner <= wouter){
					el_resize.css("font-size", last+"px");
					break;
				}
			}
			
		}
		
		else if(winner < wouter && getIn > gett){
			
				factor=1+gap;
				texf=gett;
				while(1){
					last=texf;
					texf=parseInt($("#text").css("font-size"))*factor; // ingrandisco
					
					if( texf >= getIn){ // non posso ingrandire
						break;
					}
					
					$("#text").css("font-size", texf+"px");
					winner=$("#text").outerWidth();
					wouter=$("#exp").outerWidth();
					
					if(winner >= wouter){ // supera il limite, applico l'ultimo valido
						$("#text").css("font-size", last+"px");
						break;
					}
				}
			
		}
		
	}
	$(document).on("tap", ".cancel", function(){
		$("#close-tonda").removeClass("alert").addClass("par");
		el=$("#text")
		t=el.html();
		nt=t.substr(0, t.length-1);
		el.html(nt);
		resizeString();
	});
	$(document).on("longtap", ".buttn", function(){
		val=$(this).attr("data-long");
		if(val){
			$(this).addClass("longtap");
			$("#exp #text").append( val );
		}
		resizeString();
	});
	$(document).on("longtap", ".cancel", function(){
		$("#close-tonda").removeClass("alert").addClass("par");
		$("#exp #text").html("");
		resizeString();
	});
	$(document).on("tap", ".buttn.insert", function(){
		if($(this).attr("id")=="close-tonda"){
			$("#close-tonda").removeClass("alert").addClass("par");
		}
		if($(this).hasClass("uguale")){ 
			res();
			resizeString();
			return true;
		}
		val=$(this).attr("data-val");
		if( $(this).attr("data-alert") && $(this).attr("data-alert")!==""){
			$("#close-tonda").addClass("alert");
		}
		$("#exp #text").append( val );
		resizeString();
	});
	
	$(window).resize(function(){
		$("body").css({"z-index":1, "font-size": parseInt($(window).height()/14+"px")});
		$("#string-film .text").css("font-size", "1em")
		getIn=parseInt($("#text").css("font-size"));
		resizeString();
	});
	$(window).trigger("resize");
	$(document).on("tap", ".buttn.info", function(){
		$(".film").addClass("slide");
		
	});
	$(document).on("tap", ".backbutton", function(){
		$(".film").removeClass("slide");
	});
	
	$(document).on("tap", ".buttn.action", function(){
		var action=$(this).attr("data-action");
		if(action){
			switch(action){
				case "M":
					if(Core.getCurrentText()!=""){
						$(this).addClass("alert");
						Memory=Core.getCurrentText();
					}
					//console.log(Memory);
				break;
				case "Mr":
					Core.appendMemToText(Memory, false);
				break;
			}
		}		
	});
	$(document).on("longtap", ".buttn.action", function(){
		var action=$(this).attr("data-action");
		var action=$(this).attr("data-action");
		if(action){
			switch(action){
				case "M":
					if(Memory!=""){
						Memory="";
						$("#btn-m").removeClass("alert");
					}
				break;
			}
		}
			
	
	});
	$(document).on("swipedown", ".result", function(){
		FilmObj.slideTo( (FilmObj.currentID-1) );
		resizeString();
	});
	
	$(document).on("swipeup", ".result", function(){
		FilmObj.slideTo( (FilmObj.currentID+1) );
		resizeString();
	});
	

	
	
});