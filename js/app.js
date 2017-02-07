//VARIABLES PARA EL TAMAÑO DEL SVG
//****************************************Responsive design**********************************************
var margin={top:10, left:0, right:0, bottom:10}
	,width = parseInt(d3.select('#map').style('width'))
	,width=width-margin.left-margin.right
	,mapRatio= .75
	,height = width*mapRatio;

//TimeSlider
var inputValue="a"+document.getElementById("range").innerHTML;
var years=["2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015"];

d3.select("#timeslide")
	.on("change", function(){
		update(+this.value);
	});

function update(value){
	document.getElementById("range").innerHTML=years[value];
	inputValue="a"+years[value];
	
	//coropletas
	d3.selectAll(".choropleth")
		.transition()
		.duration(500)
		.attr("fill", function(d){
			return color(d.properties[inputValue])
		});
	
	//nHouses
	d3.selectAll("#symbol_nHouses")
		.transition()
		.duration(500)
		.attr("d", d3.svg.arc().innerRadius(function(d){
			if (((Math.sqrt((2*d.properties[inputValue])/(5*Math.PI)))*(width/900)) < 40){
				this.parentNode.appendChild(this);
			}
			return a=((Math.sqrt((2*d.properties[inputValue])/(5*Math.PI)))*(width/900))
		}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180));

	//fMarket
	d3.selectAll("#symbol_fMarket")
		.transition()
		.duration(500)
		.attr("y", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[1]-(((1.5/(200*1.5))*d.properties[inputValue])*(width/120));
		})
		.attr("height", function(d) {
			return h=((1.5/(200*1.5))*d.properties[inputValue])*(width/120);
		});
	
	d3.selectAll("#symbol_fMarket_can")
		.transition()
		.duration(500)
		.attr("y", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((height2/1.8)-(((1.5/(200*1.5))*d.properties[inputValue])*(width/120))-(height/95));
				} else {
					return 1000;
			}
		})
		.attr("height", function(d) {
			return h=((1.5/(200*1.5))*d.properties[inputValue])*(width/120);
		});

	//gdp
	d3.selectAll("#symbol_gdp")
		.transition()
		.duration(500)
		.attr("y", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[1]-((1.5/(2000*1.5))*d.properties[inputValue])*(width/130);
		})
		.attr("height", function(d) {
			return h=((1.5/(2000*1.5))*d.properties[inputValue])*(width/130);
		});

	d3.selectAll("#symbol_gdp_can")
		.transition()
		.duration(500)
		.attr("y", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((height2/1.8)-(((1.5/(2000*1.5))*d.properties[inputValue])*(width/130))-(height/95));
				} else {
					return 1000;
			}
		})
		.attr("height", function(d) {
			return h=((1.5/(2000*1.5))*d.properties[inputValue])*(width/130);
		});
}

var myTimer;
d3.select("#start")
	.on("click", function(){
		clearInterval(myTimer);
		myTimer=setInterval(function(){
			var b=d3.select("#timeslide");
			var t=(+b.property("value")+1)%(+b.property("max")+1);
			if (t==0){
				t=+b.property("min");
			}
			b.property("value", t);
			update (t);
		}, 1000);
	});

d3.select("#stop")
	.on("click", function(){
		clearInterval(myTimer);
	});

var clicked=false;
//coropleth color scale 
/********Unemploment %***********/
var color=d3.scaleThreshold()
	.domain([4.59, 7, 10, 13, 17, 23, 29, 34])
	.range(["#969696", "#FDD8DC", "#E2A8AF", "#C77E87", "#AC5A65", "#913C48", "#762430", "#5B121D", "#40050F"]);

// *********************PENINSULA*****************************************************
//creacion del svg
var svg_peninsula = d3.selectAll( "#map" )
	.append( "svg" )
	.attr( "width", width )
	.attr( "height", height );
//elemento g que contendrá todos los elementos de la peninsula con los datos de desempleo
var peninsula = svg_peninsula.append( "g" ).attr("id", "peninsula");
//proyección
var geoAzimutalEqualArea = d3.geoAzimuthalEqualArea()
	.scale( width/0.23 )
	.rotate( [2.5,0] )
	.center( [0, 39.5] )
	.translate( [width/2,height/2] );
//geopath que aplica la proyección a todos los elementos
var geoPath = d3.geoPath()
	.projection( geoAzimutalEqualArea );
//crear elementos path(como un div, un g...) que contienen cada poligono
peninsula.selectAll( "path" )
	.data( peninsula_json.features )
	.enter()
	.append( "path" )
	.attr("class", "choropleth")
	.attr( "fill", function(d) {
		return color(d.properties[inputValue])
		})
	.attr("stroke", "#000")
	.attr("stroke-width", "1px")
	.on("mouseover", function(d){
		if(d.properties[inputValue]>=0){
			d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
		}
		if(clicked==false){
			ccaa_data=d.properties.CCAA;
			fMarket_bar=getData(ccaa_data, freemarket_json);
			activate_fMarket();

			ccaa_data=d.properties.CCAA;
			gdp_bar=getData(ccaa_data, gdp_json);
			activate_gdp();

			ccaa_data=d.properties.CCAA;
			hBuilt_bar=getData(ccaa_data, housesbuilt_json);
			activate_hBuilt();

			ccaa_data=d.properties.CCAA;
			unemp_bar=getData(ccaa_data, peninsula_json);
			activate_unemp();
		}
		if(ccaa_data!="-1"){
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
		}
		else{
			document.getElementById("section_stats_title").innerHTML="Statistics";
		}
	})
	.on("mouseout", function(d){
		if(d.properties[inputValue]>=0){
			d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
		}
		if (clicked==false){
			fMarket_svg
				.selectAll("rect")
				.remove();

			gdp_svg
				.selectAll("rect")
				.remove();

			hBuilt_svg
				.selectAll("rect")
				.remove();

			unemp_svg
				.selectAll("rect")
				.remove();

			unemp_svg
				.selectAll(".xAxis")
				.remove();
			unemp_svg
				.selectAll(".yAxis")
				.remove();
			fMarket_svg
				.selectAll(".xAxis")
				.remove();
			fMarket_svg
				.selectAll(".yAxis")
				.remove();
			gdp_svg
				.selectAll(".xAxis")
				.remove();
			gdp_svg
				.selectAll(".yAxis")
				.remove();
			hBuilt_svg
				.selectAll(".xAxis")
				.remove();
			hBuilt_svg
				.selectAll(".yAxis")
				.remove();
		}
	})
	.on("click", function(d) {
		document.getElementById("section_stats_title").innerHTML=ccaa_data;
		if(clicked==false) {
			clicked=true;
		}
		else {
			clicked=false;
			fMarket_svg
				.selectAll("rect")
				.remove();

			gdp_svg
				.selectAll("rect")
				.remove();

			hBuilt_svg
				.selectAll("rect")
				.remove();

			unemp_svg
				.selectAll("rect")
				.remove();
			unemp_svg
				.selectAll(".xAxis")
				.remove();
			unemp_svg
				.selectAll(".yAxis")
				.remove();
			fMarket_svg
				.selectAll(".xAxis")
				.remove();
			fMarket_svg
				.selectAll(".yAxis")
				.remove();
			gdp_svg
				.selectAll(".xAxis")
				.remove();
			gdp_svg
				.selectAll(".yAxis")
				.remove();
			hBuilt_svg
				.selectAll(".xAxis")
				.remove();
			hBuilt_svg
				.selectAll(".yAxis")
				.remove();
		}
		ccaa_data=d.properties.CCAA;
		fMarket_bar=getData(ccaa_data, freemarket_json);
		activate_fMarket();

		ccaa_data=d.properties.CCAA;
		gdp_bar=getData(ccaa_data, gdp_json);
		activate_gdp();

		ccaa_data=d.properties.CCAA;
		hBuilt_bar=getData(ccaa_data, housesbuilt_json);
		activate_hBuilt();

		ccaa_data=d.properties.CCAA;
		unemp_bar=getData(ccaa_data, peninsula_json);
		activate_unemp();
	})
	.attr( "d", geoPath );

// *********************CANARIAS*********************************************
var margin2={top:0, left:0, right:0, bottom:0}
	,width2 = parseInt(d3.select('#canarias_container').style('width'))
	,width2=width2-margin2.left-margin2.right
	,mapRatio2= .18
	,height2 = width*mapRatio2;

var svg_canarias = d3.selectAll( "#canarias_container" )
	.append( "svg" )
	.attr( "width", width2 )
	.attr( "height", height2 )
	.attr("class", "svg_canarias");

var canarias = svg_canarias.append( "g" ).attr("id", "canarias");

var geoAzimutalEqualArea2 = d3.geoAzimuthalEqualArea()
	.scale( width/0.2 )
	.rotate( [11.5,0] )
	.center( [-0.65, 25] )
	.translate( [width/2,height/2] );

var geoPath = d3.geoPath()
	.projection( geoAzimutalEqualArea2 );
//crear elementos path(como un div, un g...) que contienen cada poligono
canarias.selectAll( "path" )
	.data( canarias_json.features )
	.enter()
	.append( "path" )
	.attr("class", "choropleth")
	.attr( "fill", function(d) {
		return color(d.properties[inputValue])
		})
	.attr("stroke", "#000")
	.attr("stroke-width", "1px")
	.on("mouseover", function(d){
		if(d.properties[inputValue]>=0){
			d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
		}
		if(clicked==false){
			ccaa_data=d.properties.CCAA;
			fMarket_bar=getData(ccaa_data, freemarket_json);
			activate_fMarket();

			ccaa_data=d.properties.CCAA;
			gdp_bar=getData(ccaa_data, gdp_json);
			activate_gdp();

			ccaa_data=d.properties.CCAA;
			hBuilt_bar=getData(ccaa_data, housesbuilt_json);
			activate_hBuilt();

			ccaa_data=d.properties.CCAA;
			unemp_bar=getData(ccaa_data, canarias_json);
			activate_unemp();
		}
		document.getElementById("section_stats_title").innerHTML=ccaa_data;
	})
	.on("mouseout", function(d){
		if(d.properties[inputValue]>=0){
			d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
		}
		if(clicked==false){
			fMarket_svg
				.selectAll("rect")
				.remove();

			gdp_svg
				.selectAll("rect")
				.remove();

			hBuilt_svg
				.selectAll("rect")
				.remove();

			unemp_svg
				.selectAll("rect")
				.remove();
			unemp_svg
				.selectAll(".xAxis")
				.remove();
			unemp_svg
				.selectAll(".yAxis")
				.remove();
			fMarket_svg
				.selectAll(".xAxis")
				.remove();
			fMarket_svg
				.selectAll(".yAxis")
				.remove();
			gdp_svg
				.selectAll(".xAxis")
				.remove();
			gdp_svg
				.selectAll(".yAxis")
				.remove();
			hBuilt_svg
				.selectAll(".xAxis")
				.remove();
			hBuilt_svg
				.selectAll(".yAxis")
				.remove();
		}
	})
	.on("click", function(d) {
		document.getElementById("section_stats_title").innerHTML=ccaa_data;
		if(clicked==false){
			clicked=true;
		}
		else {
			clicked=false;
			fMarket_svg
				.selectAll("rect")
				.remove();

			gdp_svg
				.selectAll("rect")
				.remove();

			hBuilt_svg
				.selectAll("rect")
				.remove();

			unemp_svg
				.selectAll("rect")
				.remove();
			unemp_svg
				.selectAll(".xAxis")
				.remove();
			unemp_svg
				.selectAll(".yAxis")
				.remove();
			fMarket_svg
				.selectAll(".xAxis")
				.remove();
			fMarket_svg
				.selectAll(".yAxis")
				.remove();
			gdp_svg
				.selectAll(".xAxis")
				.remove();
			gdp_svg
				.selectAll(".yAxis")
				.remove();
			hBuilt_svg
				.selectAll(".xAxis")
				.remove();
			hBuilt_svg
				.selectAll(".yAxis")
				.remove();
		}
		ccaa_data=d.properties.CCAA;
		fMarket_bar=getData(ccaa_data, freemarket_json);
		activate_fMarket();

		ccaa_data=d.properties.CCAA;
		gdp_bar=getData(ccaa_data, gdp_json);
		activate_gdp();

		ccaa_data=d.properties.CCAA;
		hBuilt_bar=getData(ccaa_data, housesbuilt_json);
		activate_hBuilt();

		ccaa_data=d.properties.CCAA;
		unemp_bar=getData(ccaa_data, canarias_json);
		activate_unemp();
	})
	.attr( "d", geoPath );

	/**********************************SYMBOLS***********************************************/
	/**********PENINSULA SYMBOL**********/
	/*Num. houses built*/
	var nHouses = svg_peninsula.append("g").attr("id","nHouses");

	nHouses.selectAll("path")
		.data( housesbuilt_json.features)
		.enter()
		.append("path")
		.attr("id","symbol_nHouses")
		.attr("class","arc")
		.attr("d", d3.svg.arc().innerRadius(function(d){
			if (((Math.sqrt((2*d.properties[inputValue])/(5*Math.PI)))*(width/900)) < 40){
				this.parentNode.appendChild(this);
			}
			return a=((Math.sqrt((2*d.properties[inputValue])/(5*Math.PI)))*(width/900))
		}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180))
		.attr("transform", function(d){
			return "translate("+geoAzimutalEqualArea(d.geometry.coordinates)[0]+", "+(geoAzimutalEqualArea(d.geometry.coordinates)[1]+5)+")"
		})
		.attr("fill","#22CD66")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
			if(clicked==false){
				ccaa_data=d.properties.CCAA;
				fMarket_bar=getData(ccaa_data, freemarket_json);
				activate_fMarket();

				ccaa_data=d.properties.CCAA;
				gdp_bar=getData(ccaa_data, gdp_json);
				activate_gdp();

				ccaa_data=d.properties.CCAA;
				hBuilt_bar=getData(ccaa_data, housesbuilt_json);
				activate_hBuilt();

				ccaa_data=d.properties.CCAA;
				unemp_bar=getData(ccaa_data, peninsula_json);
				activate_unemp();
			}
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
			if(clicked==false) {
				fMarket_svg
					.selectAll("rect")
					.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
			}
		})
		.on("click", function(d) {
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
			if(clicked==false) {
				clicked=true
			}
			else {
				clicked=false;
				fMarket_svg
					.selectAll("rect")
					.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
			}
			ccaa_data=d.properties.CCAA;
			fMarket_bar=getData(ccaa_data, freemarket_json);
			activate_fMarket();

			ccaa_data=d.properties.CCAA;
			gdp_bar=getData(ccaa_data, gdp_json);
			activate_gdp();

			ccaa_data=d.properties.CCAA;
			hBuilt_bar=getData(ccaa_data, housesbuilt_json);
			activate_hBuilt();

			ccaa_data=d.properties.CCAA;
			unemp_bar=getData(ccaa_data, peninsula_json);
			activate_unemp();
		});

	/*Free-market house*/
	var fMarket = svg_peninsula.append("g").attr("id","fMarket");

	fMarket.selectAll("rect")
		.data(freemarket_json.features)
		.enter()
		.append("rect")
		.attr("id", "symbol_fMarket")
		.attr("class", "rect")
		.attr("x", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[0]-(width/100)-(width/210);
		})
		.attr("y", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[1]-(((1.5/(200*1.5))*d.properties[inputValue])*(width/120));
		})
		.attr("width", (width/90))
		.attr("height", function(d) {
			return h=((1.5/(200*1.5))*d.properties[inputValue])*(width/120);
		})
		.attr("fill","#4FA0EC")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
			if(clicked==false){
				ccaa_data=d.properties.CCAA;
				fMarket_bar=getData(ccaa_data, freemarket_json);
				activate_fMarket();

				ccaa_data=d.properties.CCAA;
				gdp_bar=getData(ccaa_data, gdp_json);
				activate_gdp();

				ccaa_data=d.properties.CCAA;
				hBuilt_bar=getData(ccaa_data, housesbuilt_json);
				activate_hBuilt();

				ccaa_data=d.properties.CCAA;
				unemp_bar=getData(ccaa_data, peninsula_json);
				activate_unemp();
			}
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
			if(clicked==false){
				fMarket_svg
					.selectAll("rect")
					.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
				}
		})
		.on("click", function(d){
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
			if(clicked==false){
				clicked=true;
			}
			else{
				clicked=false;
				fMarket_svg
					.selectAll("rect")
					.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
				}
				ccaa_data=d.properties.CCAA;
				fMarket_bar=getData(ccaa_data, freemarket_json);
				activate_fMarket();

				ccaa_data=d.properties.CCAA;
				gdp_bar=getData(ccaa_data, gdp_json);
				activate_gdp();

				ccaa_data=d.properties.CCAA;
				hBuilt_bar=getData(ccaa_data, housesbuilt_json);
				activate_hBuilt();

				ccaa_data=d.properties.CCAA;
				unemp_bar=getData(ccaa_data, peninsula_json);
				activate_unemp();
			});

	/*GDP*/
	var gdp = svg_peninsula.append("g").attr("id","gdp");

	gdp.selectAll("rect")
		.data(gdp_json.features)
		.enter()
		.append("rect")
		.attr("id", "symbol_gdp")
		.attr("class", "rect")
		.attr("x", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[0]-(width/100)+(width/70);
		})
		.attr("y", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[1]-((1.5/(2000*1.5))*d.properties[inputValue])*(width/130);
		})
		.attr("width", (width/90))
		.attr("height", function(d) {
			return h=((1.5/(2000*1.5))*d.properties[inputValue])*(width/130);
		})
		.attr("fill","orange")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
			if(clicked==false) {
				ccaa_data=d.properties.CCAA;
				fMarket_bar=getData(ccaa_data, freemarket_json);
				activate_fMarket();

				ccaa_data=d.properties.CCAA;
				gdp_bar=getData(ccaa_data, gdp_json);
				activate_gdp();

				ccaa_data=d.properties.CCAA;
				hBuilt_bar=getData(ccaa_data, housesbuilt_json);
				activate_hBuilt();

				ccaa_data=d.properties.CCAA;
				unemp_bar=getData(ccaa_data, peninsula_json);
				activate_unemp();
			}
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
			if (clicked==false){
				fMarket_svg
				.selectAll("rect")
				.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
			}	
		})
		.on("click", function(d){
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
			if(clicked==false){
				clicked=true;
			}
			else{
				clicked=false;
				fMarket_svg
				.selectAll("rect")
				.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
			}
			ccaa_data=d.properties.CCAA;
				fMarket_bar=getData(ccaa_data, freemarket_json);
				activate_fMarket();

				ccaa_data=d.properties.CCAA;
				gdp_bar=getData(ccaa_data, gdp_json);
				activate_gdp();

				ccaa_data=d.properties.CCAA;
				hBuilt_bar=getData(ccaa_data, housesbuilt_json);
				activate_hBuilt();

				ccaa_data=d.properties.CCAA;
				unemp_bar=getData(ccaa_data, peninsula_json);
				activate_unemp();
		});
		

	/**********CANARIAS SYMBOL**********/
	/*Num. houses built*/
	var nHouses1 = svg_canarias.append("g").attr("id","nHouses");

	nHouses1.selectAll("path")
		.data( housesbuilt_json.features)
		.enter()
		.append("path")
		.attr("id","symbol_nHouses")
		.attr("class","arc")
		.attr("d", d3.svg.arc().innerRadius(function(d){
			if(d.properties.CCAA=="Canarias"){
				a=((Math.sqrt((2*d.properties[inputValue])/(5*Math.PI)))*(width2/900));
			}
			return a;
		}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180))
		.attr("transform", function(d){
			if(d.properties.CCAA=="Canarias"){
				return "translate("+(width2/1.48)+", "+(height2/1.7)+")";
			}
			else{
				return "translate(1000, 1000)";
			}
		})
		.attr("fill","#22CD66")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
			if(clicked==false){
				ccaa_data=d.properties.CCAA;
				fMarket_bar=getData(ccaa_data, freemarket_json);
				activate_fMarket();

				ccaa_data=d.properties.CCAA;
				gdp_bar=getData(ccaa_data, gdp_json);
				activate_gdp();

				ccaa_data=d.properties.CCAA;
				hBuilt_bar=getData(ccaa_data, housesbuilt_json);
				activate_hBuilt();

				ccaa_data=d.properties.CCAA;
				unemp_bar=getData(ccaa_data, canarias_json);
				activate_unemp();
			}
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
			if(clicked==false) {
				fMarket_svg
					.selectAll("rect")
					.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
			}
		})
		.on("click", function(d){
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
			if(clicked==false){
				clicked=true;
			}
			else{
				clicked=false;
				fMarket_svg
					.selectAll("rect")
					.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
			}
			ccaa_data=d.properties.CCAA;
			fMarket_bar=getData(ccaa_data, freemarket_json);
			activate_fMarket();

			ccaa_data=d.properties.CCAA;
			gdp_bar=getData(ccaa_data, gdp_json);
			activate_gdp();

			ccaa_data=d.properties.CCAA;
			hBuilt_bar=getData(ccaa_data, housesbuilt_json);
			activate_hBuilt();

			ccaa_data=d.properties.CCAA;
			unemp_bar=getData(ccaa_data, canarias_json);
			activate_unemp();
		});

	/*Free-market house*/
	var fMarket1 = svg_canarias.append("g").attr("id","fMarket");

	fMarket1.selectAll("rect")
		.data(freemarket_json.features)
		.enter()
		.append("rect")
		.attr("id", "symbol_fMarket_can")
		.attr("class", "rect")
		.attr("x", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((width2/1.48)-(width2/100)-(width/80));
			} else {
				return 1000;
			}
		})
		.attr("y", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((height2/1.8)-(((1.5/(200*1.5))*d.properties[inputValue])*(width/120))-(height/95));
				} else {
					return 1000;
			}
		})
		.attr("width", (width/90))
		.attr("height", function(d) {
			return h=((1.5/(200*1.5))*d.properties[inputValue])*(width/120);
		})
		.attr("fill","#4FA0EC")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
			if(clicked==false){
				ccaa_data=d.properties.CCAA;
				fMarket_bar=getData(ccaa_data, freemarket_json);
				activate_fMarket();

				ccaa_data=d.properties.CCAA;
				gdp_bar=getData(ccaa_data, gdp_json);
				activate_gdp();

				ccaa_data=d.properties.CCAA;
				hBuilt_bar=getData(ccaa_data, housesbuilt_json);
				activate_hBuilt();

				ccaa_data=d.properties.CCAA;
				unemp_bar=getData(ccaa_data, canarias_json);
				activate_unemp();
			}
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
			if(clicked==false){
				fMarket_svg
					.selectAll("rect")
					.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
			}
		})
		.on("click", function(d){
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
			if(clicked==false){
				clicked=true;
			}
			else{
				clicked=false;
				fMarket_svg
					.selectAll("rect")
					.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
			}
			ccaa_data=d.properties.CCAA;
			fMarket_bar=getData(ccaa_data, freemarket_json);
			activate_fMarket();

			ccaa_data=d.properties.CCAA;
			gdp_bar=getData(ccaa_data, gdp_json);
			activate_gdp();

			ccaa_data=d.properties.CCAA;
			hBuilt_bar=getData(ccaa_data, housesbuilt_json);
			activate_hBuilt();

			ccaa_data=d.properties.CCAA;
			unemp_bar=getData(ccaa_data, canarias_json);
			activate_unemp();
		});

	/*GDP*/
	var gdp1 = svg_canarias.append("g").attr("id","gdp");

	gdp1.selectAll("rect")
		.data(gdp_json.features)
		.enter()
		.append("rect")
		.attr("id", "symbol_gdp_can")
		.attr("class", "rect")
		.attr("x", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((width2/1.48)-(width2/100)+(width2/60));
			} else {
				return 1000;
			}
		})
		.attr("y", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((height2/1.8)-(((1.5/(2000*1.5))*d.properties[inputValue])*(width/130))-(height/95));
				} else {
					return 1000;
			}
		})
		.attr("width", (width/90))
		.attr("height", function(d) {
			return h=((1.5/(2000*1.5))*d.properties[inputValue])*(width/130);
		})
		.attr("fill","orange")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
			if(clicked==false){
				ccaa_data=d.properties.CCAA;
				fMarket_bar=getData(ccaa_data, freemarket_json);
				activate_fMarket();

				ccaa_data=d.properties.CCAA;
				gdp_bar=getData(ccaa_data, gdp_json);
				activate_gdp();

				ccaa_data=d.properties.CCAA;
				hBuilt_bar=getData(ccaa_data, housesbuilt_json);
				activate_hBuilt();

				ccaa_data=d.properties.CCAA;
				unemp_bar=getData(ccaa_data, canarias_json);
				activate_unemp();
			}
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
			if(clicked==false){
				fMarket_svg
					.selectAll("rect")
					.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
			}
		})
		.on("click", function(d){
			document.getElementById("section_stats_title").innerHTML=ccaa_data;
			if(clicked==false){
				clicked=true;
			}
			else{
				clicked=false;
				fMarket_svg
					.selectAll("rect")
					.remove();

				gdp_svg
					.selectAll("rect")
					.remove();

				hBuilt_svg
					.selectAll("rect")
					.remove();

				unemp_svg
					.selectAll("rect")
					.remove();
				unemp_svg
				.selectAll(".xAxis")
				.remove();
				unemp_svg
					.selectAll(".yAxis")
					.remove();
				fMarket_svg
					.selectAll(".xAxis")
					.remove();
				fMarket_svg
					.selectAll(".yAxis")
					.remove();
				gdp_svg
					.selectAll(".xAxis")
					.remove();
				gdp_svg
					.selectAll(".yAxis")
					.remove();
				hBuilt_svg
					.selectAll(".xAxis")
					.remove();
				hBuilt_svg
					.selectAll(".yAxis")
					.remove();
			}
			ccaa_data=d.properties.CCAA;
			fMarket_bar=getData(ccaa_data, freemarket_json);
			activate_fMarket();

			ccaa_data=d.properties.CCAA;
			gdp_bar=getData(ccaa_data, gdp_json);
			activate_gdp();

			ccaa_data=d.properties.CCAA;
			hBuilt_bar=getData(ccaa_data, housesbuilt_json);
			activate_hBuilt();

			ccaa_data=d.properties.CCAA;
			unemp_bar=getData(ccaa_data, canarias_json);
			activate_unemp();
		});


/********************************GRAPHICS*****************************************************************************************/
/********************Function get data************************************/
function getData(findCCAA, inputData){
	var dataset =[];
	for(i=0; i<Object.keys(inputData.features).length; i++){
		check_CCAA = inputData.features[i].properties.CCAA;
		if (findCCAA==check_CCAA){
			for(var propName in inputData.features[i].properties){
				if(inputData.features[i].properties.hasOwnProperty(propName)){
					if(propName.charAt(0)=="a"){
						dataset.push(inputData.features[i].properties[propName]);
					}
				}
			};
		}
	};
	return dataset;
};

//****************************************Responsive design**********************************************
var margin={top:10, left:10, right:10, bottom:20}
var w1 = parseInt(d3.select('#fMarket_bar').style('width'))
var w_stat=w1-margin.left-margin.right
var mapRatio= .6
var h_stat = w_stat*mapRatio;

var barPadding=1;




/*****************Free-market Graphic**************************************/
var fMarket_svg=d3.select("#fMarket_bar")
	.append("svg")
	.attr("width", w_stat+margin.left*2)
	.attr("height", h_stat+margin.top*2)
	.attr("class", "stats");

function activate_fMarket() {
	//*******************X AXIS**********************//
	x = d3.scaleBand()
	.rangeRound([0, (w_stat-margin.left-(margin.right*2.2))])
	.padding(0.1)
	.domain(year);
	xAxis = d3.axisBottom()
    .scale(x);

	fMarket_svg.append("g")
	.attr("class", "xAxis")
	.attr("transform", "translate("+(margin.left*5)+"," + (h_stat-margin.bottom) + ")")
	.call(xAxis);

	fMarket_svg.selectAll(".xAxis text")
		.attr("transform", function(d){
			return "translate (-15,10) rotate(-45)";
		});

	//*******************Y AXIS**********************//
	y = d3.scaleLinear()
	.range([(h_stat-margin.top-margin.bottom/2), 0])
	.domain([0, d3.max(fMarket_bar)]);
	yAxis = d3.axisLeft()
	.scale(y)
	.tickFormat(formatNumber);

	fMarket_svg.append("g")
	.attr("class", "yAxis")
	.attr("transform", "translate("+(margin.left*5)+", 0)")
	.call(yAxis);

	max=Math.max.apply(Math, fMarket_bar);

	fMarket_svg
	.selectAll("rect")
	.data(fMarket_bar)
	.enter()
	.append("rect")
	.on("mouseover", function(d) {
		d3.select(this).attr("stroke", "#fff");
		d3.select("#fMarket_value")
			.style("display", "block");
		document.getElementById("fMarket_value").innerHTML="Value: "+d.toPrecision(6)+" €/m²";
	})
	.on("mouseout", function(d) {
		d3.select(this).attr("stroke", "#000");
		d3.select("#fMarket_value")
			.style("display", "none");
	})
	.attr("class", "rect_fm")
	.attr("transform", "translate ("+(margin.left*5)+",-10)")
	.attr("x", function(d, i) {
	    return i*((w_stat-(w_stat/7))/fMarket_bar.length); //Ancho de barras de 20 mas 1 espacio
	})
	.attr("y", function(d) {
		return (h_stat-10)-(d*(h_stat-margin.bottom)/max);
	})
	.attr("width", ((w_stat-(w_stat/7))/fMarket_bar.length)-barPadding)
	.attr("height", function(d) {
		return d*(h_stat-margin.bottom)/max;
	})
	.attr("stroke","#000")
	.attr("fill", function(d) {
		return "#4FA0EC";
	});
};

/*****************GDP Graphic**************************************/
var gdp_svg=d3.select("#gdp_bar")
	.append("svg")
	.attr("width", w_stat+margin.left*2)
	.attr("height", h_stat+margin.top*2)
	.attr("class", "stats");

function activate_gdp() {
	//*******************X AXIS**********************//
	x = d3.scaleBand()
	.rangeRound([0, (w_stat-margin.left-(margin.right*2.2))])
	.padding(0.1)
	.domain(year);
	xAxis = d3.axisBottom()
    .scale(x);

	gdp_svg.append("g")
	.attr("class", "xAxis")
	.attr("transform", "translate("+(margin.left*5)+"," + (h_stat-margin.bottom) + ")")
	.call(xAxis);

	gdp_svg.selectAll(".xAxis text")
		.attr("transform", function(d){
			return "translate (-15,10) rotate(-45)";
		});

	//*******************Y AXIS**********************//
	y = d3.scaleLinear()
	.range([(h_stat-margin.top-margin.bottom/2), 0])
	.domain([0, d3.max(gdp_bar)]);
	yAxis = d3.axisLeft()
	.scale(y)
	.tickFormat(formatNumber);

	gdp_svg.append("g")
	.attr("class", "yAxis")
	.attr("transform", "translate("+(margin.left*5)+", 0)")
	.call(yAxis);

	max=Math.max.apply(Math, gdp_bar);

	gdp_svg
	.selectAll("rect")
	.data(gdp_bar)
	.enter()
	.append("rect")
	.on("mouseover", function(d) {
		d3.select(this).attr("stroke", "#fff");
		d3.select("#gdp_value")
			.style("display", "block");
		document.getElementById("gdp_value").innerHTML="Value: "+d.toPrecision(6)+" € per Capita";
	})
	.on("mouseout", function(d) {
		d3.select(this).attr("stroke", "#000");
		d3.select("#gdp_value")
			.style("display", "none");
		})
	.attr("class", "rect_gdp")
	.attr("transform", "translate ("+(margin.left*5)+",-10)")
	.attr("x", function(d, i) {
	    return i*((w_stat-(w_stat/7))/gdp_bar.length); //Ancho de barras de 20 mas 1 espacio
	})
	.attr("y", function(d) {
		return (h_stat-10)-(d*(h_stat-margin.bottom)/max);
	})
	.attr("width", ((w_stat-(w_stat/7))/gdp_bar.length)-barPadding)
	.attr("height", function(d) {
		return d*(h_stat-margin.bottom)/max;
	})
	.attr("stroke","#000")
	.attr("fill", function(d) {
		return "orange";
	});
};

/*****************Houses Built Graphic**************************************/
var hBuilt_svg=d3.select("#hBuilt_bar")
	.append("svg")
	.attr("width", w_stat+margin.left*2)
	.attr("height", h_stat+margin.top*2)
	.attr("class", "stats");

function activate_hBuilt() {
	//*******************X AXIS**********************//
	x = d3.scaleBand()
	.rangeRound([0, (w_stat-margin.left-(margin.right*2.2))])
	.padding(0.1)
	.domain(year);
	xAxis = d3.axisBottom()
    .scale(x);

	hBuilt_svg.append("g")
	.attr("class", "xAxis")
	.attr("transform", "translate("+(margin.left*5)+"," + (h_stat-margin.bottom) + ")")
	.call(xAxis);

	hBuilt_svg.selectAll(".xAxis text")
		.attr("transform", function(d){
			return "translate (-15,10) rotate(-45)";
		});
	//*******************Y AXIS**********************//
	y = d3.scaleLinear()
	.range([(h_stat-margin.top-margin.bottom/2), 0])
	.domain([0, d3.max(hBuilt_bar)]);
	yAxis = d3.axisLeft()
	.scale(y)
	.tickFormat(formatNumber);

	hBuilt_svg.append("g")
	.attr("class", "yAxis")
	.attr("transform", "translate("+(margin.left*5)+", 0)")
	.call(yAxis);

	max=Math.max.apply(Math, hBuilt_bar);

	hBuilt_svg
	.selectAll("rect")
	.data(hBuilt_bar)
	.enter()
	.append("rect")
	.on("mouseover", function(d) {
		d3.select(this).attr("stroke", "#fff");
		d3.select("#nHouses_value")
			.style("display", "block");
		document.getElementById("nHouses_value").innerHTML="Value: "+d+" houses";
	})
	.on("mouseout", function(d) {
		d3.select(this).attr("stroke", "#000");
		d3.select("#nHouses_value")
			.style("display", "none");
		})
	.attr("class", "rect_hBuilt")
	.attr("transform", "translate ("+(margin.left*5)+",-10)")
	.attr("x", function(d, i) {
	    return i*((w_stat-(w_stat/7))/hBuilt_bar.length); //Ancho de barras de 20 mas 1 espacio
	})
	.attr("y", function(d) {
		return (h_stat-10)-(d*(h_stat-margin.bottom)/max);
	})
	.attr("width", ((w_stat-(w_stat/7))/hBuilt_bar.length)-barPadding)
	.attr("height", function(d) {
		return d*(h_stat-margin.bottom)/max;
	})
	.attr("stroke","#000")
	.attr("fill", function(d) {
		return "#22CD66";
	});
};

/*****************Unemployment Graph_static**************************************/
var unemp_svg=d3.select("#unemp_bar")
	.append("svg")
	.attr("width", w_stat+margin.left*2)
	.attr("height", h_stat+margin.top*2)
	.attr("class", "stats");

function activate_unemp() {

	//*******************X AXIS**********************//
	x = d3.scaleBand()
	.rangeRound([0, (w_stat-(margin.left*3.5))])
	.padding(0.1)
	.domain(year);
	xAxis = d3.axisBottom()
    .scale(x);

	unemp_svg.append("g")
	.attr("class", "xAxis")
	.attr("transform", "translate("+(margin.left*5)+"," + (h_stat-margin.bottom) + ")")
	.call(xAxis);

	unemp_svg.selectAll(".xAxis text")
		.attr("transform", function(d){
			return "translate (-15,10) rotate(-45)";
		});

	//*******************Y AXIS**********************//
	y = d3.scaleLinear()
	.range([(h_stat-margin.top-margin.bottom/2), 0])
	.domain([0, d3.max(unemp_bar)/100]);
	yAxis = d3.axisLeft()
	.scale(y)
	.tickFormat(formatPercent);

	unemp_svg.append("g")
	.attr("class", "yAxis")
	.attr("transform", "translate("+(margin.left*5)+", 0)")
	.call(yAxis);
	max=Math.max.apply(Math, unemp_bar);

	unemp_svg
	.selectAll("rect")
	.data(unemp_bar)
	.enter()
	.append("rect")
	.on("mouseover", function(d) {
		d3.select(this).attr("stroke", "#fff");
		d3.select("#unemp_value")
			.style("display", "block");
		document.getElementById("unemp_value").innerHTML="Value: "+d+"%";
	})
	.on("mouseout", function(d) {
		d3.select(this).attr("stroke", "#000");
		d3.select("#unemp_value")
			.style("display", "none");
		})
	.attr("class", "rect_unemp")
	.attr("transform", "translate ("+(margin.left*5)+",-10)")
	.attr("x", function(d, i) {
	    return i*((w_stat-(w_stat/7))/unemp_bar.length); //Ancho de barras de 20 mas 1 espacio
	})
	.attr("y", function(d) {
		return (h_stat-10)-(d*(h_stat-margin.bottom)/max);
	})
	.attr("width", ((w_stat-(w_stat/7))/unemp_bar.length)-barPadding)
	.attr("height", function(d) {
		return d*(h_stat-margin.bottom)/max;
	})
	.attr("stroke","#000")
	.attr("fill", function(d) {
		return color(d)
	});
};

/***************************************************AXIS***************************************************************/
var year=["2002","2003","2004","2005","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015"];
var formatPercent = d3.format(".0%");
var formatNumber = d3.format(".6");


/************************************************** LEGEND ************************************************************/
	//Fullscreen
var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement;
var fullscreenEnabled = document.fullscreenEnabled || document.mozFullScreenEnabled || document.webkitFullscreenEnabled;
function launchIntoFullscreen(element) {
  if(element.requestFullscreen) {
    element.requestFullscreen();
  } else if(element.mozRequestFullScreen) {
    element.mozRequestFullScreen();
  } else if(element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen();
  } else if(element.msRequestFullscreen) {
    element.msRequestFullscreen();
  }
}

	//Open Legend Button
var legend_window;

function activate_legend() {
    $( function() {
	    $( "#dialog" ).dialog({width: "41%",height:"auto", dialogClass:"legend_special",});
	  } );   
}

	//Choropleth legend
var corop_legend = d3.select('#corop_legend')
  	.append('ul')
    .attr('class', 'list-inline');

var keys = corop_legend.selectAll('li')
    .data(color.range());

var corop = ["ND", "4.28%", " 7%", " 10%", " 13%", " 17%", " 23%", " 29%", " 34%"];

keys.enter()
	.append('li')
    .attr('class', 'key')
    .style('border-top-color', String)
    .text(function(d, i){
    	return corop[i];
    });


    //Nº Houses built Legend
var max_nhouses=146581;
var min_nhouses=232;

var svg_nHouses_legend = d3.selectAll( "#nHouses_legend" )
	.append( "svg" )
	.attr( "width", w_stat*1.3 )
	.attr( "height", h_stat );
	
	//semi-circulos
svg_nHouses_legend
	.append("path")
	.attr("class","arc")
	.attr("d", d3.svg.arc().innerRadius(function(d){
		return a=((Math.sqrt((2*146581)/(5*Math.PI)))*(width/900))
	}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180))
	.attr("transform", "translate("+(w_stat/1.7+((w_stat/10000000)*max_nhouses))+","+(h_stat/3+((w_stat/10000000)*max_nhouses))+")")
	.attr("fill","#22CD66")
	.attr("opacity","0.8")
	.attr("stroke","#000");

	//text
svg_nHouses_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/15+((w_stat/10000000)*max_nhouses);
		})
	.attr("y", function(d) {
			return h_stat/1.9+((w_stat/10000000)*max_nhouses);
		})
	.text(max_nhouses)
	.attr("transform", "rotate(-40)");

	
svg_nHouses_legend
	.append("path")
	.attr("class","arc")
	.attr("d", d3.svg.arc().innerRadius(function(d){
		return a=((Math.sqrt((2*100000)/(5*Math.PI)))*(width/900))
	}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180))
	.attr("transform", "translate("+(w_stat/1.54+((w_stat/10000000)*100000))+","+(h_stat/2.93+((w_stat/10000000)*100000))+")")
	.attr("fill","#22CD66")
	.attr("opacity","0.8")
	.attr("stroke","#000");

svg_nHouses_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/6.5+((w_stat/10000000)*max_nhouses);
		})
	.attr("y", function(d) {
			return h_stat/1.55+((w_stat/10000000)*max_nhouses);
		})
	.text(100000)
	.attr("transform", "rotate(-40)");

svg_nHouses_legend
	.append("path")
	.attr("class","arc")
	.attr("d", d3.svg.arc().innerRadius(function(d){
		return a=((Math.sqrt((2*50000)/(5*Math.PI)))*(width/900))
	}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180))
	.attr("transform", "translate("+(w_stat/1.37+((w_stat/10000000)*50000))+","+(h_stat/2.85+((w_stat/10000000)*50000))+")")
	.attr("fill","#22CD66")
	.attr("opacity","0.8")
	.attr("stroke","#000");

svg_nHouses_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/3.6+((w_stat/10000000)*max_nhouses);
		})
	.attr("y", function(d) {
			return h_stat/1.22+((w_stat/10000000)*max_nhouses);
		})
	.text(50000)
	.attr("transform", "rotate(-40)")

svg_nHouses_legend
	.append("path")
	.attr("class","arc")
	.attr("d", d3.svg.arc().innerRadius(function(d){
		return a=((Math.sqrt((2*10000)/(5*Math.PI)))*(width/900))
	}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180))
	.attr("transform", "translate("+(w_stat/1.2+((w_stat/10000000)*10000))+","+(h_stat/2.789+((w_stat/10000000)*10000))+")")
	.attr("fill","#22CD66")
	.attr("opacity","0.8")
	.attr("stroke","#000");

svg_nHouses_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/2.35+((w_stat/10000000)*max_nhouses);
		})
	.attr("y", function(d) {
			return h_stat/0.97+((w_stat/10000000)*max_nhouses);
		})
	.text(10000)
	.attr("transform", "rotate(-40)")

svg_nHouses_legend
	.append("path")
	.attr("class","arc")
	.attr("d", d3.svg.arc().innerRadius(function(d){
		return a=((Math.sqrt((2*232)/(5*Math.PI)))*(width/900))
	}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180))
	.attr("transform", "translate("+(w_stat/1.11+((w_stat/10000000)*min_nhouses))+","+(h_stat/2.763+((w_stat/10000000)*min_nhouses))+")")
	.attr("fill","#22CD66")
	.attr("opacity","0.8")
	.attr("stroke","#000");

svg_nHouses_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/1.85+((w_stat/10000000)*max_nhouses);
		})
	.attr("y", function(d) {
			return h_stat/0.85+((w_stat/10000000)*max_nhouses);
		})
	.text(232)
	.attr("transform", "rotate(-40)");




//********************Free Market Legend**********************
var max_fMarket=3007.4;
var min_fMarket=611.3;

var svg_fMarket_legend = d3.selectAll( "#fMarket_legend" )
	.append( "svg" )
	.attr( "width", w_stat )
	.attr( "height", h_stat/1.6 );

svg_fMarket_legend
	.append("rect")
	.attr("class", "rect")
	.attr("x", function(d){
		return w_stat/3+((w_stat/10000000)*max_fMarket);
	})
	.attr("y", function(d){
		return h_stat/15+((w_stat/10000000)*max_fMarket);
	})
	.attr("width", (width/90))
	.attr("height", function(d) {
		return h=((1.5/(200*1.5))*max_fMarket)*(width/120);
	})
	.attr("fill","#4FA0EC")
	.attr("opacity","0.8")
	.attr("stroke","#000")

svg_fMarket_legend
	.append("line")
	.attr("x1", function(d) {
			return w_stat/3+((w_stat/10000000)*max_fMarket);
		})
	.attr("y1", function(d) {
			return h_stat/15+((w_stat/10000000)*max_fMarket);
		})
	.attr("x2", function(d) {
			return w_stat/3+((w_stat/10000000)*max_fMarket)+w_stat/20;
		})
	.attr("y2", function(d) {
			return h_stat/15+((w_stat/10000000)*max_fMarket);
		})
	.style("stroke", "#000");

svg_fMarket_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/2.8+((w_stat/10000000)*max_fMarket)+w_stat/20;
		})
	.attr("y", function(d) {
			return h_stat/15+((w_stat/10000000)*max_fMarket);
		})
	.text(max_fMarket.toPrecision(6)+" €/m²");

svg_fMarket_legend
	.append("rect")
	.attr("class", "rect")
	.attr("x", function(d){
		return w_stat/3+((w_stat/10000000)*max_fMarket);
	})
	.attr("y", function(d){
		return h_stat/15+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*2000)*(width/120);
	})
	.attr("width", (width/90))
	.attr("height", function(d) {
		return h=((1.5/(200*1.5))*2000)*(width/120);
	})
	.attr("fill","#4FA0EC")
	.attr("opacity","0.8")
	.attr("stroke","#000")

svg_fMarket_legend
	.append("line")
	.attr("x1", function(d) {
			return w_stat/3+((w_stat/10000000)*max_fMarket);
		})
	.attr("y1", function(d) {
			return h_stat/15+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*2000)*(width/120);
		})
	.attr("x2", function(d) {
			return w_stat/3+((w_stat/10000000)*max_fMarket)+w_stat/20;
		})
	.attr("y2", function(d) {
			return h_stat/15+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*2000)*(width/120);
		})
	.style("stroke", "#000");

svg_fMarket_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/2.8+((w_stat/10000000)*max_fMarket)+w_stat/20;
		})
	.attr("y", function(d) {
			return h_stat/15+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*2000)*(width/120);
		})
	.text("2000.00 €/m²");

svg_fMarket_legend
	.append("rect")
	.attr("class", "rect")
	.attr("x", function(d){
		return w_stat/3+((w_stat/10000000)*max_fMarket);
	})
	.attr("y", function(d){
		return h_stat/15+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*min_fMarket)*(width/120);
	})
	.attr("width", (width/90))
	.attr("height", function(d) {
		return h=((1.5/(200*1.5))*min_fMarket)*(width/120);
	})
	.attr("fill","#4FA0EC")
	.attr("opacity","0.8")
	.attr("stroke","#000")

svg_fMarket_legend
	.append("line")
	.attr("x1", function(d) {
			return w_stat/3+((w_stat/10000000)*max_fMarket);
		})
	.attr("y1", function(d) {
			return h_stat/15+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*min_fMarket)*(width/120);
		})
	.attr("x2", function(d) {
			return w_stat/3+((w_stat/10000000)*max_fMarket)+w_stat/20;
		})
	.attr("y2", function(d) {
			return h_stat/15+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*min_fMarket)*(width/120);
		})
	.style("stroke", "#000");

svg_fMarket_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/2.8+((w_stat/10000000)*max_fMarket)+w_stat/20;
		})
	.attr("y", function(d) {
			return h_stat/15+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*min_fMarket)*(width/120);
		})
	.text(min_fMarket.toPrecision(6)+" €/m²");

svg_fMarket_legend
	.append("line")
	.attr("x1", function(d) {
			return w_stat/3+((w_stat/10000000)*max_fMarket);
		})
	.attr("y1", function(d) {
			return h_stat/6.7+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*min_fMarket)*(width/120);
		})
	.attr("x2", function(d) {
			return w_stat/3+((w_stat/10000000)*max_fMarket)+w_stat/20;
		})
	.attr("y2", function(d) {
			return h_stat/6.7+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*min_fMarket)*(width/120);
		})
	.style("stroke", "#000");

svg_fMarket_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/2.8+((w_stat/10000000)*max_fMarket)+w_stat/20;
		})
	.attr("y", function(d) {
			return h_stat/6+((w_stat/10000000)*max_fMarket)+(((1.5/(200*1.5))*max_fMarket)*(width/120))-((1.5/(200*1.5))*min_fMarket)*(width/120);
		})
	.text("0 €/m²");



//********************GDP Legend**********************
var max_gdp=32152;
var min_gdp=11567;

var svg_gdp_legend = d3.selectAll( "#gdp_legend" )
	.append( "svg" )
	.attr( "width", w_stat )
	.attr( "height", h_stat/1.6 );

svg_gdp_legend
	.append("rect")
	.attr("class", "rect")
	.attr("x", function(d){
		return w_stat/3+((w_stat/10000000)*max_gdp);
	})
	.attr("y", function(d){
		return h_stat/15+((w_stat/10000000)*max_gdp);
	})
	.attr("width", (width/90))
	.attr("height", function(d) {
		return h=((1.5/(2000*1.5))*max_gdp)*(width/130);
	})
	.attr("fill","orange")
	.attr("opacity","0.8")
	.attr("stroke","#000")

svg_gdp_legend
	.append("line")
	.attr("x1", function(d) {
			return w_stat/3+((w_stat/10000000)*max_gdp);
		})
	.attr("y1", function(d) {
			return h_stat/15+((w_stat/10000000)*max_gdp);
		})
	.attr("x2", function(d) {
			return w_stat/3+((w_stat/10000000)*max_gdp)+w_stat/20;
		})
	.attr("y2", function(d) {
			return h_stat/15+((w_stat/10000000)*max_gdp);
		})
	.style("stroke", "#000");

svg_gdp_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/2.8+((w_stat/10000000)*max_gdp)+w_stat/20;
		})
	.attr("y", function(d) {
			return h_stat/15+((w_stat/10000000)*max_gdp);
		})
	.text(max_fMarket.toPrecision(6)+" € per Capita");

svg_gdp_legend
	.append("rect")
	.attr("class", "rect")
	.attr("x", function(d){
		return w_stat/3+((w_stat/10000000)*max_gdp);
	})
	.attr("y", function(d){
		return h_stat/15+((w_stat/10000000)*20000)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*20000)*(width/130);
	})
	.attr("width", (width/90))
	.attr("height", function(d) {
		return h=((1.5/(2000*1.5))*20000)*(width/130);
	})
	.attr("fill","orange")
	.attr("opacity","0.8")
	.attr("stroke","#000")

svg_gdp_legend
	.append("line")
	.attr("x1", function(d) {
			return w_stat/3+((w_stat/10000000)*max_gdp);
		})
	.attr("y1", function(d) {
			return h_stat/15+((w_stat/10000000)*20000)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*20000)*(width/130);
		})
	.attr("x2", function(d) {
			return w_stat/3+((w_stat/10000000)*max_gdp)+w_stat/20;
		})
	.attr("y2", function(d) {
			return h_stat/15+((w_stat/10000000)*20000)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*20000)*(width/130);
		})
	.style("stroke", "#000");

svg_gdp_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/2.8+((w_stat/10000000)*max_gdp)+w_stat/20;
		})
	.attr("y", function(d) {
			return h_stat/15+((w_stat/10000000)*20000)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*20000)*(width/130);
		})
	.text("2000.00 € per Capita");

svg_gdp_legend
	.append("rect")
	.attr("class", "rect")
	.attr("x", function(d){
		return w_stat/3+((w_stat/10000000)*max_gdp);
	})
	.attr("y", function(d){
		return h_stat/15+((w_stat/10000000)*min_gdp)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*min_gdp)*(width/130);
	})
	.attr("width", (width/90))
	.attr("height", function(d) {
		return h=((1.5/(2000*1.5))*min_gdp)*(width/130);
	})
	.attr("fill","orange")
	.attr("opacity","0.8")
	.attr("stroke","#000")

svg_gdp_legend
	.append("line")
	.attr("x1", function(d) {
			return w_stat/3+((w_stat/10000000)*max_gdp);
		})
	.attr("y1", function(d) {
			return h_stat/15+((w_stat/10000000)*min_gdp)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*min_gdp)*(width/130);
		})
	.attr("x2", function(d) {
			return w_stat/3+((w_stat/10000000)*max_gdp)+w_stat/20;
		})
	.attr("y2", function(d) {
			return h_stat/15+((w_stat/10000000)*min_gdp)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*min_gdp)*(width/130);
		})
	.style("stroke", "#000");

svg_gdp_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/2.8+((w_stat/10000000)*max_gdp)+w_stat/20;
		})
	.attr("y", function(d) {
			return h_stat/15+((w_stat/10000000)*min_gdp)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*min_gdp)*(width/130);
		})
	.text(min_fMarket.toPrecision(6)+" € per Capita");

svg_gdp_legend
	.append("line")
	.attr("x1", function(d) {
			return w_stat/3+((w_stat/10000000)*max_gdp);
		})
	.attr("y1", function(d) {
			return h_stat/4.7+((w_stat/10000000)*min_gdp)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*min_gdp)*(width/130);
		})
	.attr("x2", function(d) {
			return w_stat/3+((w_stat/10000000)*max_gdp)+w_stat/20;
		})
	.attr("y2", function(d) {
			return h_stat/4.7+((w_stat/10000000)*min_gdp)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*min_gdp)*(width/130);
		})
	.style("stroke", "#000");

svg_gdp_legend
	.append("text")
	.attr("class", "nHouses_legend") 
	.attr("x", function(d) {
			return w_stat/2.8+((w_stat/10000000)*max_gdp)+w_stat/20;
		})
	.attr("y", function(d) {
			return h_stat/4.5+((w_stat/10000000)*min_gdp)+((1.5/(2000*1.5))*max_gdp)*(width/130)-((1.5/(2000*1.5))*min_gdp)*(width/130);
		})
	.text("0 € per Capita");


//**********************************CHANGE RIGHT SECTION**************************//
drag=false;
d3.select("#radio_button").on("change",update_right_section);
			update_right_section();
			
function update_right_section(){
	if(d3.select('input[name="choose"]:checked').node().value=="Legend"){
		d3.selectAll("#section_legend").style("display", "block");
		d3.selectAll("#section_stats").style("display", "none");
		d3.selectAll("#section_compare").style("display", "none");
	}
	else if (d3.select('input[name="choose"]:checked').node().value=="Statistics"){
		d3.selectAll("#section_legend").style("display", "none");
		d3.selectAll("#section_stats").style("display", "block");
		d3.selectAll("#section_compare").style("display", "none");
		alert('Click on the map for locking the Statistics and hover the bars to see the exact value. Click again on the map for unlocking them.')
	}
	else {
		d3.selectAll("#section_legend").style("display", "none");
		d3.selectAll("#section_stats").style("display", "none");
		d3.selectAll("#section_compare").style("display", "block");
	}
}


//************************************************GRAPHIC SCALE*************************************************************************//
var svg_scale=d3.select( "#scale" )
				.append( "svg" )
				.attr( "width", w_stat )
				.attr( "height", h_stat )
				.attr("class", "map");

var scale_svg = svg_scale.append( "g" ).attr("id", "scale");

scale_svg
	.append("rect")
	.attr("class", "rect_elect")
	.attr("transform", "translate("+(margin.left)+","+(-margin.bottom-margin.top)+")")
	.attr("x", w_stat/100)
	.attr("y", h_stat/2)
	.transition().duration(500)
	.attr("width", geoAzimutalEqualArea([0,0])[1]-geoAzimutalEqualArea([0, 3.703703703703704])[1])
	.attr("height", h_stat/25)
	.attr("fill", "#FFF")
	.attr("stroke", "#000");

scale_svg
	.append("text")
	.attr("class", "scale_txt")
	.attr("transform", "translate("+(margin.left)+","+(-margin.bottom-margin.top*2)+")")
	.transition().duration(500)
	.attr("x", w_stat/100+(geoAzimutalEqualArea([0,0])[1]-geoAzimutalEqualArea([0, 3.703703703703704])[1])-margin.right)
	.attr("y", h_stat/2)
	.text("400")
	.attr("font-size", "1vw")
	.style("fill", "#000");

scale_svg
	.append("text")
	.attr("class", "scale_txt")
	.attr("transform", "translate("+(margin.left)+","+(-margin.top)+")")
	.transition().duration(500)
	.attr("x", w_stat/100+(geoAzimutalEqualArea([0,0])[1]-geoAzimutalEqualArea([0, 3.703703703703704])[1])+margin.right)
	.attr("y", h_stat/2.2)
	.text("Km")
	.attr("font-size", "1vw")
	.style("fill", "#000");

scale_svg
	.append("rect")
	.attr("class", "rect_elect")
	.attr("transform", "translate("+(margin.left)+","+(-margin.bottom-margin.top)+")")
	.attr("x", w_stat/100)
	.attr("y", h_stat/2)
	.transition().duration(500)
	.attr("width", geoAzimutalEqualArea([0,0])[1]-geoAzimutalEqualArea([0, 2.777777777777778])[1])
	.attr("height", h_stat/25)
	.attr("fill", "#000")
	.attr("stroke", "#000");

scale_svg
	.append("text")
	.attr("class", "scale_txt")
	.attr("transform", "translate("+(margin.left)+","+(-margin.bottom-margin.top*2)+")")
	.transition().duration(500)
	.attr("x", w_stat/100+(geoAzimutalEqualArea([0,0])[1]-geoAzimutalEqualArea([0, 2.777777777777778])[1])-margin.right)
	.attr("y", h_stat/2)
	.text("300")
	.attr("font-size", "1vw")
	.style("fill", "#000");

scale_svg
	.append("rect")
	.attr("class", "rect_elect")
	.attr("transform", "translate("+(margin.left)+","+(-margin.bottom-margin.top)+")")
	.attr("x", w_stat/100)
	.attr("y", h_stat/2)
	.transition().duration(500)
	.attr("width", geoAzimutalEqualArea([0,0])[1]-geoAzimutalEqualArea([0, 1.851851851851852])[1])
	.attr("height", h_stat/25)
	.attr("fill", "#FFF")
	.attr("stroke", "#000");

scale_svg
	.append("text")
	.attr("class", "scale_txt")
	.attr("transform", "translate("+(margin.left)+","+(-margin.bottom-margin.top*2)+")")
	.transition().duration(500)
	.attr("x", w_stat/100+(geoAzimutalEqualArea([0,0])[1]-geoAzimutalEqualArea([0, 1.851851851851852])[1])-margin.right)
	.attr("y", h_stat/2)
	.text("200")
	.attr("font-size", "1vw")
	.style("fill", "#000");

scale_svg
	.append("rect")
	.attr("class", "rect_elect")
	.attr("transform", "translate("+(margin.left)+","+(-margin.bottom-margin.top)+")")
	.attr("x", w_stat/100)
	.attr("y", h_stat/2)
	.transition().duration(500)
	.attr("width", geoAzimutalEqualArea([0,0])[1]-geoAzimutalEqualArea([0, 0.9259259259259259])[1])
	.attr("height", h_stat/25)
	.attr("fill", "#000")
	.attr("stroke", "#000");

scale_svg
	.append("text")
	.attr("class", "scale_txt")
	.attr("transform", "translate("+(margin.left)+","+(-margin.bottom-margin.top*2)+")")
	.transition().duration(500)
	.attr("x", w_stat/100+(geoAzimutalEqualArea([0,0])[1]-geoAzimutalEqualArea([0, 0.9259259259259259])[1])-margin.right)
	.attr("y", h_stat/2)
	.text("100")
	.attr("font-size", "1vw")
	.style("fill", "#000");

scale_svg
	.append("rect")
	.attr("class", "rect_elect")
	.attr("transform", "translate("+(margin.left)+","+(-margin.bottom-margin.top)+")")
	.attr("x", w_stat/100)
	.attr("y", h_stat/2)
	.transition().duration(500)
	.attr("width", geoAzimutalEqualArea([0,0])[1]-geoAzimutalEqualArea([0, 0.462962962962963])[1])
	.attr("height", h_stat/25)
	.attr("fill", "#FFF")
	.attr("stroke", "#000");

scale_svg
	.append("text")
	.attr("class", "scale_txt")
	.attr("transform", "translate("+(margin.left)+","+(-margin.bottom-margin.top*2)+")")
	.transition().duration(500)
	.attr("x", w_stat/100-margin.right/2)
	.attr("y", h_stat/2)
	.text("0")
	.attr("font-size", "1vw")
	.style("fill", "#000");




////********************************* COMPARISSON MAP ***************************////
//TimeSlider
var inputValue2="a"+document.getElementById("range").innerHTML;
var years2=["2002","2003","2004","2005","2006","2007","2008","2009","2010","2011","2012","2013","2014","2015"];

d3.select("#timeslide2")
	.on("change", function(){
		update2(+this.value);
	});

function update2(value){
	document.getElementById("range2").innerHTML=years2[value];
	inputValue2="a"+years2[value];
	
	//coropletas
	d3.selectAll(".choropleth2")
		.transition()
		.duration(500)
		.attr("fill", function(d){
			return color(d.properties[inputValue2])
		});
	
	//nHouses
	d3.selectAll("#symbol_nHouses2")
		.transition()
		.duration(500)
		.attr("d", d3.svg.arc().innerRadius(function(d){
			if (((Math.sqrt((2*d.properties[inputValue2])/(5*Math.PI)))*(width/900)) < 40){
				this.parentNode.appendChild(this);
			}
			return a=((Math.sqrt((2*d.properties[inputValue2])/(5*Math.PI)))*(width/900))
		}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180));

	//fMarket
	d3.selectAll("#symbol_fMarket2")
		.transition()
		.duration(500)
		.attr("y", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[1]-(((1.5/(200*1.5))*d.properties[inputValue2])*(width/120));
		})
		.attr("height", function(d) {
			return h=((1.5/(200*1.5))*d.properties[inputValue2])*(width/120);
		});
	
	d3.selectAll("#symbol_fMarket_can2")
		.transition()
		.duration(500)
		.attr("y", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((height2/1.8)-(((1.5/(200*1.5))*d.properties[inputValue2])*(width/120))-(height/95));
				} else {
					return 1000;
			}
		})
		.attr("height", function(d) {
			return h=((1.5/(200*1.5))*d.properties[inputValue2])*(width/120);
		});

	//gdp
	d3.selectAll("#symbol_gdp2")
		.transition()
		.duration(500)
		.attr("y", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[1]-((1.5/(2000*1.5))*d.properties[inputValue2])*(width/130);
		})
		.attr("height", function(d) {
			return h=((1.5/(2000*1.5))*d.properties[inputValue2])*(width/130);
		});

	d3.selectAll("#symbol_gdp_can2")
		.transition()
		.duration(500)
		.attr("y", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((height2/1.8)-(((1.5/(2000*1.5))*d.properties[inputValue2])*(width/130))-(height/95));
				} else {
					return 1000;
			}
		})
		.attr("height", function(d) {
			return h=((1.5/(2000*1.5))*d.properties[inputValue2])*(width/130);
		});
}



// *********************PENINSULA*****************************************************
//creacion del svg
var svg_peninsula = d3.selectAll( "#map_comparisson" )
	.append( "svg" )
	.attr( "width", width )
	.attr( "height", height );
//elemento g que contendrá todos los elementos de la peninsula con los datos de desempleo
var peninsula = svg_peninsula.append( "g" ).attr("id", "peninsula");
//proyección
var geoAzimutalEqualArea = d3.geoAzimuthalEqualArea()
	.scale( width/0.23 )
	.rotate( [2.5,0] )
	.center( [0, 39.5] )
	.translate( [width/2,height/2] );
//geopath que aplica la proyección a todos los elementos
var geoPath = d3.geoPath()
	.projection( geoAzimutalEqualArea );
//crear elementos path(como un div, un g...) que contienen cada poligono
peninsula.selectAll( "path" )
	.data( peninsula_json.features )
	.enter()
	.append( "path" )
	.attr("class", "choropleth2")
	.attr( "fill", function(d) {
		return color(d.properties[inputValue2])
		})
	.attr("stroke", "#000")
	.attr("stroke-width", "1px")
	.on("mouseover", function(d){
		if(d.properties[inputValue2]>=0){
			d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
		}
	})
	.on("mouseout", function(d){
		if(d.properties[inputValue2]>=0){
			d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
		}
	})
	.attr( "d", geoPath );

// *********************CANARIAS*********************************************
var margin2={top:0, left:0, right:0, bottom:0}
	,width2 = parseInt(d3.select('#canarias_container').style('width'))
	,width2=width2-margin2.left-margin2.right
	,mapRatio2= .18
	,height2 = width*mapRatio2;

var svg_canarias = d3.selectAll( "#canarias_container_comparisson" )
	.append( "svg" )
	.attr( "width", width2 )
	.attr( "height", height2 )
	.attr("class", "svg_canarias");

var canarias = svg_canarias.append( "g" ).attr("id", "canarias");

var geoAzimutalEqualArea2 = d3.geoAzimuthalEqualArea()
	.scale( width/0.2 )
	.rotate( [11.5,0] )
	.center( [-0.65, 25] )
	.translate( [width/2,height/2] );

var geoPath = d3.geoPath()
	.projection( geoAzimutalEqualArea2 );
//crear elementos path(como un div, un g...) que contienen cada poligono
canarias.selectAll( "path" )
	.data( canarias_json.features )
	.enter()
	.append( "path" )
	.attr("class", "choropleth2")
	.attr( "fill", function(d) {
		return color(d.properties[inputValue2])
		})
	.attr("stroke", "#000")
	.attr("stroke-width", "1px")
	.on("mouseover", function(d){
		if(d.properties[inputValue2]>=0){
			d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
		}
	})
	.on("mouseout", function(d){
		if(d.properties[inputValue2]>=0){
			d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
		}
	})
	.attr( "d", geoPath );

	/**********************************SYMBOLS***********************************************/
	/**********PENINSULA SYMBOL**********/
	/*Num. houses built*/
	var nHouses = svg_peninsula.append("g").attr("id","nHouses");

	nHouses.selectAll("path")
		.data( housesbuilt_json.features)
		.enter()
		.append("path")
		.attr("id","symbol_nHouses2")
		.attr("class","arc")
		.attr("d", d3.svg.arc().innerRadius(function(d){
			if (((Math.sqrt((2*d.properties[inputValue2])/(5*Math.PI)))*(width/900)) < 40){
				this.parentNode.appendChild(this);
			}
			return a=((Math.sqrt((2*d.properties[inputValue2])/(5*Math.PI)))*(width/900))
		}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180))
		.attr("transform", function(d){
			return "translate("+geoAzimutalEqualArea(d.geometry.coordinates)[0]+", "+(geoAzimutalEqualArea(d.geometry.coordinates)[1]+5)+")"
		})
		.attr("fill","#22CD66")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
		});

	/*Free-market house*/
	var fMarket = svg_peninsula.append("g").attr("id","fMarket");

	fMarket.selectAll("rect")
		.data(freemarket_json.features)
		.enter()
		.append("rect")
		.attr("id", "symbol_fMarket2")
		.attr("class", "rect")
		.attr("x", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[0]-(width/100)-(width/210);
		})
		.attr("y", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[1]-(((1.5/(200*1.5))*d.properties[inputValue2])*(width/120));
		})
		.attr("width", (width/90))
		.attr("height", function(d) {
			return h=((1.5/(200*1.5))*d.properties[inputValue2])*(width/120);
		})
		.attr("fill","#4FA0EC")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
		});

	/*GDP*/
	var gdp = svg_peninsula.append("g").attr("id","gdp");

	gdp.selectAll("rect")
		.data(gdp_json.features)
		.enter()
		.append("rect")
		.attr("id", "symbol_gdp2")
		.attr("class", "rect")
		.attr("x", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[0]-(width/100)+(width/70);
		})
		.attr("y", function(d){
			return geoAzimutalEqualArea(d.geometry.coordinates)[1]-((1.5/(2000*1.5))*d.properties[inputValue2])*(width/130);
		})
		.attr("width", (width/90))
		.attr("height", function(d) {
			return h=((1.5/(2000*1.5))*d.properties[inputValue2])*(width/130);
		})
		.attr("fill","orange")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}	
		});
		

	/**********CANARIAS SYMBOL**********/
	/*Num. houses built*/
	var nHouses1 = svg_canarias.append("g").attr("id","nHouses");

	nHouses1.selectAll("path")
		.data( housesbuilt_json.features)
		.enter()
		.append("path")
		.attr("id","symbol_nHouses2")
		.attr("class","arc")
		.attr("d", d3.svg.arc().innerRadius(function(d){
			if(d.properties.CCAA=="Canarias"){
				a=((Math.sqrt((2*d.properties[inputValue2])/(5*Math.PI)))*(width2/900));
			}
			return a;
		}).outerRadius(0).startAngle(90*(Math.PI/180)).endAngle(270*Math.PI/180))
		.attr("transform", function(d){
			if(d.properties.CCAA=="Canarias"){
				return "translate("+(width2/1.48)+", "+(height2/1.7)+")";
			}
			else{
				return "translate(1000, 1000)";
			}
		})
		.attr("fill","#22CD66")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
		});

	/*Free-market house*/
	var fMarket1 = svg_canarias.append("g").attr("id","fMarket");

	fMarket1.selectAll("rect")
		.data(freemarket_json.features)
		.enter()
		.append("rect")
		.attr("id", "symbol_fMarket_can2")
		.attr("class", "rect")
		.attr("x", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((width2/1.48)-(width2/100)-(width/80));
			} else {
				return 1000;
			}
		})
		.attr("y", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((height2/1.8)-(((1.5/(200*1.5))*d.properties[inputValue2])*(width/120))-(height/95));
				} else {
					return 1000;
			}
		})
		.attr("width", (width/90))
		.attr("height", function(d) {
			return h=((1.5/(200*1.5))*d.properties[inputValue2])*(width/120);
		})
		.attr("fill","#4FA0EC")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
		});

	/*GDP*/
	var gdp1 = svg_canarias.append("g").attr("id","gdp");

	gdp1.selectAll("rect")
		.data(gdp_json.features)
		.enter()
		.append("rect")
		.attr("id", "symbol_gdp_can2")
		.attr("class", "rect")
		.attr("x", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((width2/1.48)-(width2/100)+(width2/60));
			} else {
				return 1000;
			}
		})
		.attr("y", function(d){
			if(d.properties.CCAA=="Canarias"){
				return ((height2/1.8)-(((1.5/(2000*1.5))*d.properties[inputValue2])*(width/130))-(height/95));
				} else {
					return 1000;
			}
		})
		.attr("width", (width/90))
		.attr("height", function(d) {
			return h=((1.5/(2000*1.5))*d.properties[inputValue2])*(width/130);
		})
		.attr("fill","orange")
		.attr("opacity","0.8")
		.attr("stroke","#000")
		.on("mouseover", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this.parentNode.appendChild(this)).attr("stroke","#fff").attr("stroke-width","2px");
			}
		})
		.on("mouseout", function(d){
			if(d.properties[inputValue2]>=0){
				d3.select(this).attr("stroke","#000").attr("stroke-width", "1px");
			}
		});

