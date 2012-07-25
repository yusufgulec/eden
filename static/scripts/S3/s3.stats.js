var drawerOpen=false;
var subGeoShowing = false;
var subGeoHover = true;
var reassignRatings;
var activeWindow;
var markersOn=false;
var median;
var highest_level = 3;
var updateChart;
var setLevel;
var ratingsObject; // JSON object with fake ratings


$(document).ready(function(){
        
    TypeHelpers.insertClasses();
    
    $("#dataTopBar").hover(function(){
        $("#dataTopBar img").css("background-color", "#f7941d");
        $("#dataTopBar img").attr("src", S3.Ap.concat("/img/stats/dropdownArrowOverPng8.png"));
        $("#dataOptions").fadeIn(150);
        $("#defaultDataLink").css("color", "#c47a21");
    },
    function(){
        $("#dataTopBar img").css("background-color", "transparent");
        $("#dataTopBar img").attr("src", S3.Ap.concat("/img/stats/dropdownArrowPng8.png"));
        $("#dataOptions").fadeOut(150);
        $("#defaultDataLink").css("color", "#f7941d");
    });
    $("#reportsTopBar").hover(function(){
        $("#reportsTopBar img").css("background-color", "#f7941d");
        $("#reportsTopBar img").attr("src", S3.Ap.concat("/img/stats/dropdownArrowOverPng8.png"));
        $("#reportsOptions").fadeIn(150);
        $("#defaultReportsLink").css("color", "#c47a21");
    },
    function(){
        $("#reportsTopBar img").css("background-color", "transparent");
        $("#reportsTopBar img").attr("src", S3.Ap.concat("/img/stats/dropdownArrowPng8.png"));
        $("#reportsOptions").fadeOut(150);
        $("#defaultReportsLink").css("color", "#f7941d");
    });
    $(".closechromeframe").click(function(){ $(".chromeframe").hide(); });
    
    $('#timelineSlider').slider({
		value: 2012,
		min: 1990,
		max: 2012,
		step: 1,
		slide: function( event, ui ) {
			$( "#amount" ).val( ui.value );
		}
	});
	$( "#amount" ).val( 2012 );

	// set up selectmenu for chart
	$("#chartSwitcher").selectmenu({
	    style: "popup",
	    maxHeight:280,
	    width:125,
	    menuWidth:125
	});
	
	//set up selectmenus for "Browse other regions" section
	$("#browseOtherRegions ul li select").selectmenu({
	    style: "popup",
		maxHeight:280,
		width:160,
		menuWidth:160,
		icons: [
			{find: '.one'},
			{find: '.two'},
			{find: '.three'},
			{find: '.four'},
			{find: '.five'}
		]
	});
	// set up selectmenus for infoWindows
	$(".subGeoSelect").selectmenu({
	    style: "popup",
		maxHeight:280,
		width:160,
		menuWidth:160,
		icons: [
			{find: '.one'},
			{find: '.two'},
			{find: '.three'},
			{find: '.four'},
			{find: '.five'}
		]	    
	})
	
    // $("#amount").change( function(){ console.log($("#amount").val()) });

    //click events for opening/closing drawer
    $("#show-hide").click(function(){ drawerSlide(); });
    $("#risingTab").click(function(){ drawerSlide(); });

    $("#subGeo, .currentQuality").hover(
        function(){ //show popup with sub-geography if user hovers for .2 second
            var tempPopupDivVar = $(this).find(".popup");
            $(tempPopupDivVar).data('timeout', setTimeout(function(){ showSubGeo(tempPopupDivVar, 200); }, 200)) },
        function(){ 
            var tempPopupDivVar = $(this).find(".popup");
            hideSubGeo(tempPopupDivVar, 200);
            clearTimeout($(tempPopupDivVar).data('timeout'));
        }); // cancel popup if user moves mouse before .2 second passes

    $(".listText").hover(
        function(){
            showSubGeo($(this).siblings(".popup"), 0);
        },
        function(){
            hideSubGeo($(this).siblings(".popup"), 0);
    });
        
    $("#subGeoPopup").hover(
        function(){ 
            if(!subGeoHover){  // on mouseover, if the mouseout counter is still going, cancel it
                clearTimeout($(this).data('timeout'));
                subGeoHover=true;
            }
        },
        function () { //if the user moves mouse away from the div, start a .3s timer before hiding the sub-geography popup
            var tempPopupDivVar = $(this);
            subGeoHover = false;
            $(this).data('timeout', setTimeout( function () {
                hideSubGeo(tempPopupDivVar);
            }, 300));
    });

    // $("#closeSubGeo").click(function(){ showSubGeo(); });

    // grab search value when search is clicked AND when enter/return is pressed (while the search is in focus)
    $("#searchSubmit").click(function(){ alert( $("#search input").val()); });  
    $("#search input").keyup(function(keyEvent){
        if(keyEvent.which==13){
            alert( $("#search input").val() );
        }
    });


    // open the reports section/lightbox background when reports links are clicked
    $(".reports").click(function(){ 
        $("#lightbox, #reportsSection").fadeIn(300);
    });
    
    $(".infoWindow img").click(function(){
        $("#lightbox, #photoPanel").fadeIn(300);
    });
    
    $(".calculationLink").click(function(){
        $("#lightbox, #calculationView").fadeIn(300);
    });
    
    //close sections when lightbox surrounding area OR x in UR corner is clicked
    $("#lightbox").click(function(){ $("#lightbox, #reportsSection, #calculationView, #photoPanel").fadeOut(300); })
    $("#reportSection .closePanel").click(function(){
        $("#lightbox, #reportsSection").fadeOut(300);
    });
    $("#calculationView .closePanel").click(function(){
        $("#lightbox, #calculationView").fadeOut(300);
    });
    $("#photoPanel .closePanel").click(function(){
        $("#lightbox, #photoPanel").fadeOut(300);
    });
    
    
    //fake country selection when user is in global view.
    $("#vulnerability").click(function(){
        if(!$("#l0_breadcrumb").is(":visible")){
            $("#show-hide, #divider, #analysisLink, #risingTab").fadeIn(200);
            $("#l0_select option[value='vietnam']").attr("selected",true);
            $("#l0_select").selectmenu("destroy").selectmenu({
        	    style: "popup",
        		maxHeight:280,
        		width:160,
        		menuWidth:160,
        		icons: [
        			{find: '.one'},
        			{find: '.two'},
        			{find: '.three'},
        			{find: '.four'},
        			{find: '.five'}
        		]
        	});
            reassignRatings(0);
            $(".activeWindow").fadeIn(300);
        }
    });
    
    refreshDropdowns = function(select_id){
        switch(select_id){
            case "l0_select":
                $("#l1, #l2, #l3, #l4, #l5").fadeOut(200);
                $("#l1_select option.none, #l2_select option.none, #l3_select option.none, #l4_select option.none, #l5_select option.none").attr("selected", true);
                if( $("#l0_select").val() != "na"){
                    $("#l1").fadeIn(200);
                }
                $("#l1_select, #l2_select, #l3_select, #l4_select, #l5_select").selectmenu("destroy").selectmenu({
            	    style: "popup",
            		maxHeight:280,
            		width:160,
            		menuWidth:160,
            		icons: [
            			{find: '.one'},
            			{find: '.two'},
            			{find: '.three'},
            			{find: '.four'},
            			{find: '.five'}
            		]
            	});
                break;
            case "l1_select":
                $("#l2, #l3, #l4, #l5").fadeOut(200);
                $("#l2_select option.none, #l3_select option.none, #l4_select option.none, #l5_select option.none").attr("selected", "selected");
                if( $("#l1_select").val() != "na"){
                    $("#l2").fadeIn(200);
                }
                $("#l2_select, #l3_select, #l4_select, #l5_select").selectmenu("destroy").selectmenu({
            	    style: "popup",
            		maxHeight:280,
            		width:160,
            		menuWidth:160,
            		icons: [
            			{find: '.one'},
            			{find: '.two'},
            			{find: '.three'},
            			{find: '.four'},
            			{find: '.five'}
            		]
            	});
                break;
            case "l2_select":
                $("#l3, #l4, #l5").fadeOut(200);
                $("#l3_select option.none, #l4_select option.none, #l5_select option.none").attr("selected", true);
                if( $("#l2_select").val() != "na"){
                    $("#l3").fadeIn(200);
                }
                $("#l3_select, #l4_select, #l5_select").selectmenu("destroy").selectmenu({
            	    style: "popup",
            		maxHeight:280,
            		width:160,
            		menuWidth:160,
            		icons: [
            			{find: '.one'},
            			{find: '.two'},
            			{find: '.three'},
            			{find: '.four'},
            			{find: '.five'}
            		]
            	});
                break;
            case "l3_select":
                if(highest_level>3){
                    $("#l5").fadeOut(200);
                    $("#l4_select option.none, #l5_select option.none").attr("selected", true);
                    if( $("#l3_select").val() != "na"){
                        $("#l4").fadeIn(200);
                    }
                }
                break;
            case "l4_select":
                if(highest_level>4){
                    $("#l5").fadeOut(200);
                    $("#l4_select option.none, #l5_select option.none").attr("selected", true);
                    if( $("#l3_select").val() != "na"){
                        $("#l4").fadeIn(200);
                    }
                }
                break;
            case "l5_select":
                break;
            default:
                $("#l1, #l2, #l3, #l4, #l5").fadeOut(200);
                $("#l0_select option.none, #l1_select option.none, #l2_select option.none, #l3_select option.none, #l4_select option.none, #l5_select option.none").attr("selected", true);
                $("#l0_select, #l1_select, #l2_select, #l3_select, #l4_select, #l5_select").selectmenu("destroy").selectmenu({
            	    style: "popup",
            		maxHeight:280,
            		width:160,
            		menuWidth:160,
            		icons: [
            			{find: '.one'},
            			{find: '.two'},
            			{find: '.three'},
            			{find: '.four'},
            			{find: '.five'}
            		]
            	});
                
        }
    }
    
    setLevel = function(){
        var l_level=0;
        if($("#l5_select-button").is(":visible")){
            switch($("#l5_select option:selected").val()){
                case "na":
                    l_level=4;
                    break;
                default:
                    l_level=5;
            }
        } else if ($("#l4_select-button").is(":visible")){
            switch($("#l4_select option:selected").val()){
                case "na":
                    l_level=3;
                    break;
                default:
                    l_level=4;
            }
        } else if ($("#l3_select-button").is(":visible")){
            switch($("#l3_select option:selected").val()){
                case "na":
                    l_level=2;
                    break;
                default:
                    l_level=3;
            }
        } else if ($("#l2_select-button").is(":visible")){
            switch($("#l2_select option:selected").val()){
                case "na":
                    l_level=1;
                    break;
                default:
                    l_level=2;
            }
        } else if ($("#l1_select-button").is(":visible")){
            switch($("#l1_select option:selected").val()){
                case "na":
                    l_level=0;
                    break;
                default:
                    l_level=1
            }
        }
        reassignRatings(l_level);
    }
    reassignRatings = function(l_level){
        switch(l_level){
            case 0:
                $(".geoName").html($("#l0_select").val());
                $(".geoType").html("Country in");
                $(".year").html("2012");
                $("#subGeoReported").html("8 Provinces Reported");
                $("#qualityCommunes").html("36 out of 397 Communes Reported");
                $(".noCommune").show();
                $("#l1_breadcrumb, #l2_breadcrumb, #l3_breadcrumb, #l4_breadcrumb, #l5_breadcrumb").hide();
                $("#l0_breadcrumb").html(" &raquo; " + $("#l0_select").val()).show();
                $(".communeOnly").fadeOut(200);
                $("#iconsKey input").hide();
                $(".indicatorRange").show();
                $(".infoWindow").removeClass("activeWindow").fadeOut(300);
                $(".provinceWindow").addClass("activeWindow");
                if(!drawerOpen){
                    $(".activeWindow").fadeIn(300);
                }
                break;
            case 1:
                $(".geoName").html($("#l1_select").val());
                $(".geoType").html("Province in");
                $(".year").html("2012");
                $("#l2_breadcrumb, #l3_breadcrumb, #l4_breadcrumb, #l5_breadcrumb").hide();
                $("#l0_breadcrumb").html(" &raquo; <a href='javascript:reassignRatings(0); refreshDropdowns(\"l0_select\");'>" + $("#l0_select").val() + "</a>").show();
                $("#l1_breadcrumb").html(" &raquo; " + $("#l1_select").val()).show();
                $("#subGeoReported").html("3 Districts Reported");
                $("#qualityCommunes").html("36 out of 397 Communes Reported");
                $(".noCommune").show();
                $(".communeOnly").fadeOut(200);
                $("#iconsKey input").hide();
                $(".indicatorRange").show();
                $(".infoWindow").removeClass("activeWindow").fadeOut(300);
                $(".districtWindow").addClass("activeWindow");
                if(!drawerOpen){
                    $(".activeWindow").fadeIn(300);
                }
                break;
            case 2:
                $(".geoName").html($("#l2_select").val());
                $(".geoType").html("District in");
                $(".year").html("2012");
                $("#l3_breadcrumb, #l4_breadcrumb, #l5_breadcrumb").hide();
                $("#l0_breadcrumb").html(" &raquo; <a href='javascript:reassignRatings(0); refreshDropdowns(\"l0_select\");'>" + $("#l0_select").val() + "</a>").show();
                $("#l1_breadcrumb").html(" &raquo; <a href='javascript:reassignRatings(1); refreshDropdowns(\"l1_select\");'>" + $("#l1_select").val() + "</a>").show();
                $("#l2_breadcrumb").html(" &raquo; " + $("#l2_select").val()).show();
                $("#subGeoReported").html("8 Communes Reported");
                $("#qualityCommunes").html("36 out of 397 Communes Reported");
                $(".noCommune").show();
                $(".communeOnly").fadeOut(200);
                $("#iconsBlocker").hide();
                $("#iconsKey input").show();
                $("#mapKey #iconsKey label").css("color", "#565656");
                $(".indicatorRange").show();
                $(".infoWindow").removeClass("activeWindow").fadeOut(300);
                $(".communeWindow").addClass("activeWindow");
                if(!drawerOpen){
                    $(".activeWindow").fadeIn(300);
                }
                break;
            case 3:
                $(".geoName").html($("#l3_select").val());
                $(".geoType").html("Commune in");
                $(".year").html("2012");
                $(".communeOnly").show();
                $(".noCommune").hide();
                $("#qualityCommunes").html("Last Data Collected on 7/3/2011 by Tina Pham");                
                $("#l4_breadcrumb, #l5_breadcrumb").hide();
                $("#l0_breadcrumb").html(" &raquo; <a href='javascript:reassignRatings(0); refreshDropdowns(\"l0_select\");'>" + $("#l0_select").val() + "</a>").show();
                $("#l1_breadcrumb").html(" &raquo; <a href='javascript:reassignRatings(1); refreshDropdowns(\"l1_select\");'>" + $("#l1_select").val() + "</a>").show();
                $("#l2_breadcrumb").html(" &raquo; <a href='javascript:reassignRatings(2); refreshDropdowns(\"l2_select\");'>" + $("#l2_select").val() + "</a>").show();
                $("#l3_breadcrumb").html(" &raquo; " + $("#l3_select").val()).show();
                $("#iconsBlocker").hide();
                $("#iconsKey input").show();
                $("#mapKey #iconsKey label").css("color", "#565656");
                $(".indicatorRange").show();
                $(".infoWindow").removeClass("activeWindow");
                break;
            case 4:
                break;
            case 5:
                break;
        }
        updateChart(l_level, true);
        updateChartDropdown(l_level);
    }
    
    updateChart = function(l_level, ratingBlocksBoolean){        
        var medianTotal=0;
        ratingsObject = [
            [Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5)],
            [Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5)],
            [Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5)],
            [Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5)],
            [Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5)],
            [Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5)],
            [Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5)],
            [Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5)],
            [Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5)],
            [Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5), Math.ceil(Math.random()*5)]
        ];
        // for loop to add css properties to chart in drawer
        for(var i=0; i<ratingsObject.length; i++){
            $("#visRange" + i + " .rightBox, #visRange" + i + " .leftBox").show();

            ratingsObject[i].sort();
            //set left margin
            $("#visRange" + i).css("left", (58*(ratingsObject[i][0]-1)) + "px");
            //set width of the range
            $("#visRange" + i).css("width", (58*(ratingsObject[i][ratingsObject[i].length-1] - ratingsObject[i][0])) + "px")
        
            //set median values
            var medianIndex = ratingsObject[i].length/2.0;
            switch(medianIndex%1){
                case 0:
                    median = ((ratingsObject[i][medianIndex] + ratingsObject[i][medianIndex-1])/2.0);
                    break;
                default:
                    median = (ratingsObject[i][Math.floor(medianIndex)]);
                    break;
            }
        
            // set difference variable so that we'll be able to specify the dot's position
            var medianDifference = median - ratingsObject[i][0];
        
            // position the median dot/circle
            $("#visRange" + i + " .medianDot").css("left", (medianDifference*58) + "px");
            if(median == ratingsObject[i][0]){
                $("#visRange" + i + " .leftBox").hide();
            }
            if(median == ratingsObject[i][ratingsObject[i].length - 1]){
                $("#visRange" + i + " .rightBox").hide();
            }
            medianTotal+=median;
        }
        var bgcolor;
        var ddThumb;
        // median = Math.round(medianTotal/ratingsObject.length); // We will ultimately be doing something like this, but since rounding a bunch of randomly generated numbers almost always ends up with a median value of 3, I'm using the following:
        median = Math.ceil(median);
        if(ratingBlocksBoolean){
            updateRatingBlocks(l_level, median);
        }
    }
    var updateRatingBlocks = function(l_level, median){
        switch(median){
            case 1:
                bgcolor = "#ff5121";
                ddThumb = "one";
                break;
            case 2:
                bgcolor = "#f4961c";
                ddThumb = "two";
                break;
            case 3:
                bgcolor = "#d6b317";
                ddThumb = "three";
                break;
            case 4:
                bgcolor = "#77b82e";
                ddThumb = "four";
                break;
            case 5:
                bgcolor = "#059346";
                ddThumb = "five";
                break;
            default:
                bgcolor = "#999";
        }
        $("#mainRating, #indicator").css("background-color", bgcolor);
        $("#mainRating, #indicator").text(median);
        $("#mainRating, #indicator").show();
        $("#l" + l_level + "_level option:selected").each(function(){ $(this).removeClass("one two three four five"); });
        $("#l" + l_level + "_level option:selected").addClass(ddThumb);        
    }
    var updateChartDropdown = function(l_level){
        var optionsText;
        
        for(var i=l_level; i>=0; i--){
            switch(i){
                case l_level:
                    optionsText += '<option value="' + i + '" selected="selected">Current Location</option>';
                    break;
                default:
                    optionsText += '<option value="' + i + '">' + $("#l" + i + "_select option:selected").html() + '</option>';
            }
        }
        
		$("#chartSwitcher").html(optionsText);
		$("#chartSwitcher").selectmenu("destroy").selectmenu({
    	    style: "popup",
    	    maxHeight:280,
    	    width:125,
    	    menuWidth:125
    	});
    }
    
    
    //function to open/close the drawer
    var drawerSlide = function(){
        switch(drawerOpen){
            case true:
                $(".hidden").hide('slow');
                $("#show-hide").html("<span class='arrow'>&uarr;</span> SHOW MORE");
                $("#risingTab").css("background-image","url('" + S3.Ap + "/static/img/stats/openTabPng8.png')");
                // $("#drawer").css("height", "50px", "slow");
                $(".activeWindow").fadeIn(300);
                drawerOpen = false;
                if(subGeoShowing){ showSubGeo(); }
                break;
            case false:
                $("#drawerInside").show('slow');
                $("#drawerInside").data("fade", setTimeout(function(){ 
                    $("#resilienceSummary, #drawerQuickActions, #indicatorRatingChart, #browseOtherRegions, #dataBreakdown").fadeIn(500);
                    $(".communeOnly").hide(); 
                }, 500));
                $("#show-hide").html("<span class='arrow'>&darr;</span> SHOW LESS");
                $("#risingTab").css("background-image","url('" + S3.Ap + "/static/img/stats/closeTabPng8.png')");
                // $("#drawer").css("height", "330px", "slow");
                $(".activeWindow").fadeOut(300);
                drawerOpen = true;
                break;
        }
    };    
    reassignRatings();
});

// function to open/close sub-geography popup
var showSubGeo = function(popup,fadeSpeed){
    if(typeof activeWindow !== 'undefined'){
        clearTimeout(activeWindow.data('timeout'));
        activeWindow.fadeOut(fadeSpeed);
    }
    popup.fadeIn(fadeSpeed);
    activeWindow = popup;
    subGeoShowing = true;
};

var hideSubGeo = function(popup, fadeSpeed){
    popup.fadeOut(fadeSpeed);
    subGeoShowing = false;
}
var toggleIconLayer = function(){
    if($("#l2_breadcrumb").is(":visible")){
        switch(markersOn){
            case false:
                $("#mapSection").css("background", 'url("' + S3.Ap.concat("/img/stats/mapIconOnPng8.png") + '") no-repeat center top transparent');
                $("#volunteerSection").css("background", 'url("' + S3.Ap.concat("/img/stats/volunteerIconOnPng8.png") + '") no-repeat center top transparent');
                $(".iconSection").css("color", "#565656");
                markersOn=true;
                break;
            case true:
                $("#mapSection").css("background", 'url("' + S3.Ap.concat("/img/stats/mapIconOffPng8.png") + '") no-repeat center top transparent');
                $("#volunteerSection").css("background", 'url("' + S3.Ap.concat("/img/stats/volunteerIconOffPng8.png") + '") no-repeat center top transparent');
                $(".iconSection").css("color", "#ccc")
                markersOn=false;
                break;
        }
    }
}
var globalView = function(){
    $("#l0_breadcrumb, #l1_breadcrumb, #l2_breadcrumb, #l3_breadcrumb, #l4_breadcrumb, #l5_breadcrumb, #show-hide, #divider, #analysisLink, #indicator, #risingTab").hide();
    $(".hidden").hide("slow");
    $(".geoType").html("");
    $(".geoName").html("&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Select a country");
    $(".activeWindow").fadeOut(300);
    $(".activeWindow").removeClass("activeWindow");
    $(".countryWindow").addClass("activeWindow");
    $(".activeWindow").fadeIn(300);
    $(".year").html("");
    refreshDropdowns("kitten");
}