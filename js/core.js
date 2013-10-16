$(function(){

	search=["]", "}", "[", "{", ":", "%"];
	replace=[")", ")", "(", "(", "/", "/100*"];
	
	search_regex=["\\π([0-9]+)", "([0-9]+)\\π", "\\π", 
	"\\e([0-9]+)", "([0-9]+)\\e", "\\e",
	
	"sinh\\((.*?)\\)", "cosh\\((.*?)\\)",
	
	"sqrt\\((.*?)\\)", "sin\\((.*?)\\)", "log\\((.*?)\\)", "ln\\((.*?)\\)", "([0-9]+)\\!", "(\\*)+", "(\\/)+",
	"([0-9]+)root\\((.*?)\\)",
	"([0-9]+)\\^([0-9]+)",
	
	"sin_", "cos_",
	];
	replace_regex=[
	"Math.PI*$1","$1*Math.PI", "Math.PI",
	"Math.E*$1","$1*Math.E", "Math.E",
	
	"Math.asin_($1)", "Math.acos_($1)",
	
	"Math.sqrt($1)", "Math.sin($1)", "Math.log($1)", "Math.ln($1)", "rFact($1)", "*", "/",
	"Math.pow($2, 1/$1)",
	"Math.pow($1, $2)",
	
	"sin", "cos",
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
		for(a=0; a<search.length; a++){ // classico
			string2=string2.replace( search[a], replace[a] );
		}
		for(a=0; a<search_regex.length; a++){ // regex
			string2=string2.replace( new RegExp(search_regex[a],"g"), replace_regex[a] );
		}
		$(".result").removeClass("error");
		res2=string;
		try
		{
		  console.log( string2 );
		  eval("res2="+string2+";");
		}
		catch(e)
		{
		  $(".result").addClass("error");
		  res2=string;
		}
		
		return res2;
	}
	function res(){
		el=$("#text");
		r=exec(el.html());
		el.html( r );
	}
	getIn=parseInt($("#text").css("font-size"));
	function resizeString(){
		if( $("#text").html() == ""){
			$(".cwrap").addClass("hide");
		}
		else{
			$(".cwrap").removeClass("hide");
		}
		winner=$("#text").outerWidth();
		wouter=$("#exp").outerWidth();
		gap=0.1;
		gett=parseInt($("#text").css("font-size"));
		if(winner > wouter){
			//console.log( $("#text").css("font-size")*0.9 );
			factor=1-gap;
			
			while(1){
				texf=parseInt($("#text").css("font-size"))*factor;
				last=texf;
				$("#text").css("font-size", texf+"px");
				winner=$("#text").outerWidth();
				wouter=$("#exp").outerWidth();
				if(winner <= wouter){
					$("#text").css("font-size", last+"px");
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
	$(document).on("tap", ".buttn", function(){
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
		$("body").css("z-index", 1);
	
	});
	
	$(document).on("tap", ".buttn.info", function(){
		$(".film").addClass("slide");
		
	});
	$(document).on("tap", ".backbutton", function(){
		$(".film").removeClass("slide");
		
	});

});