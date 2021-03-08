/* Change to one-way form */
let isRoundTrip = true;
function changeOneWay(){
	/* Change switch button colors */
	document.getElementById("round-trip").style.backgroundColor = "white";
	document.getElementById("round-trip").style.color = "#083b75";
	document.getElementById("one-way").style.backgroundColor = "#5D8FCA";
	document.getElementById("one-way").style.color = "white";
	/* Hide return date */
	document.getElementById("returnheader").style.display = "none";
	/* Change arrow symbol to one way */
	document.getElementById("arrow").innerHTML = "⇒";
	/* Set boolean false */
	isRoundTrip = false;
}

/* Change to round-trip form */
function changeRoundTrip(){
	/* Change switch button colors */
	document.getElementById("round-trip").style.backgroundColor = "#5D8FCA";
	document.getElementById("round-trip").style.color = "white";
	document.getElementById("one-way").style.backgroundColor = "white";
	document.getElementById("one-way").style.color = "#083b75";
	/* Show return date selector */
	document.getElementById("inbound-date").style.display = "block";
	document.getElementById("returnheader").style.display = "block";
	/* Set arrow symbol to two way */
	document.getElementById("arrow").innerHTML = "⇔";
	/* Set boolean true */
	isRoundTrip = true;
}

let allQuotes = [];
let currencySymbol;

/* When search button clicked */
function search(){
	/* Set users input to variables */
	let outcity = document.getElementById("outbound-city").value;
	let outcountry = document.getElementById("outbound-country").value;
	let outdate = document.getElementById("outbound-date").value;
	let incity = document.getElementById("inbound-city").value;
	let	incountry = document.getElementById("inbound-country").value;
	let currency = document.getElementById("currency").value;
	let indate = document.getElementById("inbound-date").value;
	/* Create alert if required fields not filled */
	let warnings = [];

	if(!document.getElementById('outbound-city').validity.valid){
		warnings.push("origin city");
	} 
	if(!document.getElementById('outbound-country').validity.valid){
		warnings.push("origin country");
	} 
	if(!document.getElementById('outbound-date').validity.valid){
		warnings.push("depart date");
	} 
	if(!document.getElementById('inbound-city').validity.valid){
		warnings.push("destination city");
	} 
	if(!document.getElementById('inbound-country').validity.valid){
		warnings.push("destination country");
	}
	/* Only add return date to warnings if user also chose round trip */
	if(!document.getElementById('inbound-date').validity.valid && isRoundTrip){
		warnings.push("return date");
	}
	if(!document.getElementById('currency').validity.valid){
		warnings.push("currency");
	} 
	/* Construct warning string and alert if applicable */
	let lastwarning = warnings.pop();
	if(warnings.length == 0 && lastwarning != null){
		window.alert("Choose your " + lastwarning + ".");
		return;
	} else if (warnings.length != 0 && lastwarning != null){
		let warnmsg = warnings.join(", ");
		window.alert("Choose your " + warnmsg + " and " + lastwarning + ".");
		return;
	}

	/* Set API key and host variables*/
	let apikey = "bcb79525d1msh080d6b14d82b124p10ca07jsn6d3083515a7f";
	let apihost = "skyscanner-skyscanner-flight-search-v1.p.rapidapi.com";

	/* Find outbound location ID*/
	let outlocationIDurl = "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/" + outcountry + "/" + currency + "/en-US/?query=" + outcity;
	let inlocationIDurl = "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/autosuggest/v1.0/" + incountry + "/" + currency + "/en-US/?query=" + incity;

	/* Declare important variables ahead of time */
	let outlocationID;	
	let inlocationID;
	let quotesURL;

	/* Call to API to find origin location's ID */
	fetch(outlocationIDurl, {
		"method": "GET",
		"headers": {
			"x-rapidapi-key": apikey,
			"x-rapidapi-host": apihost
		}
		})
		.then(response => response.json())
		.then(data => outlocationID = data.Places[0].PlaceId)
		.then(() => 
				/* Call to API to find destination location's ID */
				fetch(inlocationIDurl, {
					"method": "GET",
					"headers": {
					"x-rapidapi-key": apikey,
					"x-rapidapi-host": apihost
					}
				})
				.then(response => response.json())
				.then(data => inlocationID = data.Places[0].PlaceId)
				.then(() => {
					/* Call to API to get quotes */
					if(!isRoundTrip){
						quotesURL = "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/" + outcountry + "/" + currency + "/en-US/" + outlocationID + "/" + inlocationID + "/" + outdate;
					} else{
						quotesURL = "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/" + outcountry + "/" + currency + "/en-US/" + outlocationID + "/" + inlocationID + "/" + outdate + "/" + indate;
					}
					fetch(quotesURL, {
						"method": "GET",
						"headers": {
							"x-rapidapi-key": apikey,
							"x-rapidapi-host": apihost
						}
						})
						.then(response => response.json())
						.then(data => {
							/* Clear previous search results */
							document.getElementById("allCards").innerHTML = "";
							allQuotes = [];

							/*If no quotes, alert user*/
							if(data.Quotes.length == 0){
								/* Hide sort by price selector and footer*/
								document.getElementById("sort").style.display = "none";
								document.getElementById("footer").style.display = "none";

								if(!isRoundTrip){
									window.alert("There are no one way deals for this search at this time!");
								} else{
									window.alert("There are no round trip deals for this search at this time!");
								}
								return;
							}

							/* Console log data */
							console.log(data);

							/* Save currency symbol, carrier list and places list from API*/
							currencySymbol = data.Currencies[0].Symbol;
							let carriers = data.Carriers;
							let places = data.Places;

							/* Find what is the cheapest quote value from quote list */
							let cheapestQuote = data.Quotes[0].MinPrice;
							console.log(cheapestQuote);
							data.Quotes.forEach(function (quote){
								if(cheapestQuote > quote.MinPrice){
									cheapestQuote = quote.MinPrice;
								}
							});
				
							/* Make HTML card */
							data.Quotes.forEach(function (quote){
								/* Blank dictionary that will hold all info of a quote*/
								let quoteInfo = {};

								/* Assign needed info to variables */
								let minPrice = quote.MinPrice;
								let carrierId = quote.OutboundLeg.CarrierIds;
								let destinationId = quote.OutboundLeg.DestinationId;
								let originId = quote.OutboundLeg.OriginId;

								/* Make card */
								const card = document.createElement("div");
								card.setAttribute("class", "cards");

								/* Show departure carrier */
								let carrierName;
								carriers.forEach(function(c){
									if(carrierId == c.CarrierId){
										carrierName = c.Name;
										/* Add carrierName to dictionary */
										quoteInfo["carrierName"] = carrierName;
									}
								});
								const carrier = document.createElement("h2");
								carrier.setAttribute("class", "carrier");
								carrier.innerHTML = carrierName;
								card.appendChild(carrier);

								/* Show currency symbol + price*/
								const price = document.createElement("h3");
								price.setAttribute("class", "price");
								price.innerHTML = currencySymbol + minPrice;
								/* Add min price to dictionary */
								quoteInfo["minPrice"] = minPrice;

								/* If cheapest one, set it to cheapest */
								if(cheapestQuote == minPrice){
									price.setAttribute("id", "cheapest");
								}
								card.appendChild(price);

								/* Match originId from places */
								let origincity;
								let origincountry;
								let originairport;
								places.forEach(function(p){
									if(originId == p.PlaceId){
										origincity = p.CityName;
										origincountry = p.CountryName;
										originairport = p.Name;
										/* Add origin info to dictionary */
										quoteInfo["origincity"] = origincity;
										quoteInfo["origincountry"] = origincountry;
										quoteInfo["originairport"] = originairport;
									}
								});

								/* Match destinationId from places */
								let destcity;
								let destcountry;
								let destairport;
								places.forEach(function(p){
									if(destinationId == p.PlaceId){
										destcity = p.CityName;
										destcountry = p.CountryName;
										destairport = p.Name;
										/* Add destination info to dictionary */
										quoteInfo["destcity"] = destcity;
										quoteInfo["destcountry"] = destcountry;
										quoteInfo["destairport"] = destairport;
									}
								});

								/* Add depart trip airports */
								const departAirports = document.createElement("h3");
								departAirports.setAttribute("class", "airports");
								departAirports.innerHTML = originairport + " ⇒ " + destairport;
								card.appendChild(departAirports);

								/* Add depart trip city and countries */
								const departLocations = document.createElement("h5");
								departLocations.setAttribute("class", "locations");
								departLocations.innerHTML = origincity + ", " + origincountry + "\t\t\t\t\t" + destcity + ", " + destcountry;
								card.appendChild(departLocations);

								/* If round trip, also find same information now for inbound */
								if(isRoundTrip){
									let rcarrierId = quote.InboundLeg.CarrierIds;
									let rdestinationId = quote.InboundLeg.DestinationId;
									let roriginId = quote.InboundLeg.OriginId;

									/* Show return carrier */
									let rcarrierName;
									carriers.forEach(function(c){
										if(rcarrierId == c.CarrierId){
											rcarrierName = c.Name;
											/* Add return carrier to dictionary */
											quoteInfo["rcarrierName"] = rcarrierName;
										}
									});
									const rcarrier = document.createElement("h2");
									rcarrier.setAttribute("class", "return-carrier");
									rcarrier.innerHTML = rcarrierName;
									card.appendChild(rcarrier);


									/* Match return originId from places */
									let rorigincity;
									let rorigincountry;
									let roriginairport;
									places.forEach(function(p){
										if(roriginId == p.PlaceId){
											rorigincity = p.CityName;
											rorigincountry = p.CountryName;
											roriginairport = p.Name;
											/* Add return origin to dictionary */
											quoteInfo["rorigincity"] = rorigincity;
											quoteInfo["rorigincountry"] = rorigincountry;
											quoteInfo["roriginairport"] = roriginairport;
										}
									});

									/* Match return destinationId from places */
									let rdestcity;
									let rdestcountry;
									let rdestairport;
									places.forEach(function(p){
										if(rdestinationId == p.PlaceId){
											rdestcity = p.CityName;
											rdestcountry = p.CountryName;
											rdestairport = p.Name;
											/* Add return destination info to dictionary */
											quoteInfo["rdestcity"] = rdestcity;
											quoteInfo["rdestcountry"] = rdestcountry;
											quoteInfo["rdestairport"] = rdestairport;
										}
									});

									/* Add depart trip airports */
									const returnAirports = document.createElement("h3");
									returnAirports.setAttribute("class", "airports");
									returnAirports.innerHTML = roriginairport + " ⇒ " + rdestairport;
									card.appendChild(returnAirports);

									/* Add return trip city and countries */
									const returnLocations = document.createElement("h5");
									returnLocations.setAttribute("class", "locations");
									returnLocations.innerHTML = rorigincity + ", " + rorigincountry + "\t\t\t" + rdestcity + ", " + rdestcountry;
									card.appendChild(returnLocations);
								}

								/* Append card to list of cards in HTML*/
								allCards.appendChild(card);
								allQuotes.push(quoteInfo);
							});
							
							/* Sort allQuotes list low to high price with insertion sort*/
							let i, key, keyDict, j, jDict;
							for(i = 1; i < allQuotes.length; i++){
								key = allQuotes[i].minPrice;
								keyDict = JSON.parse(JSON.stringify(allQuotes[i]));
								j = i - 1;
								while( j >= 0 && allQuotes[j].minPrice > key){
									jDict = JSON.parse(JSON.stringify(allQuotes[j]));
									allQuotes[j+1] = jDict;
									j -= 1;
								}
								allQuotes[j+1] = keyDict;
							}

							/* Show sort by price selector */
							document.getElementById("sort").style.display = "block";
							document.getElementById("sort").value = "default";

							/* Show footer */
							document.getElementById("footer").style.display = "block";

						})
						.catch(err => {
							console.error(err);
						});
				})
		);
}


/* When sort by price changes */
function sortCards(){
	let sortBy = document.getElementById("sort").value;

	if(sortBy == "lowhigh"){
		document.getElementById("allCards").innerHTML = "";
		for(let i = 0; i < allQuotes.length; i++){
			/* Make card */
			const card = document.createElement("div");
			card.setAttribute("class", "cards");

			const carrier = document.createElement("h2");
			carrier.setAttribute("class", "carrier");
			carrier.innerHTML = allQuotes[i]["carrierName"];
			card.appendChild(carrier);

			/* Show currency symbol + price*/
			const price = document.createElement("h3");
			price.setAttribute("class", "price");
			price.innerHTML = currencySymbol + allQuotes[i]["minPrice"];

			/* If cheapest one, set it to cheapest */
			if(i == 0){
				price.setAttribute("id", "cheapest");
			}
			card.appendChild(price);

			/* Add depart trip airports */
			const departAirports = document.createElement("h3");
			departAirports.setAttribute("class", "airports");
			departAirports.innerHTML = allQuotes[i]["originairport"] + " ⇒ " + allQuotes[i]["destairport"];
			card.appendChild(departAirports);

			/* Add depart trip city and countries */
			const departLocations = document.createElement("h5");
			departLocations.setAttribute("class", "locations");
			departLocations.innerHTML = allQuotes[i]["origincity"] + ", " + allQuotes[i]["origincountry"] + "\t\t\t\t\t" + allQuotes[i]["destcity"] + ", " + allQuotes[i]["destcountry"];
			card.appendChild(departLocations);

			/* If round trip, also find same information now for inbound */
			if(isRoundTrip){
				const rcarrier = document.createElement("h2");
				rcarrier.setAttribute("class", "return-carrier");
				rcarrier.innerHTML = allQuotes[i]["rcarrierName"];
				card.appendChild(rcarrier);

				/* Add depart trip airports */
				const returnAirports = document.createElement("h3");
				returnAirports.setAttribute("class", "airports");
				returnAirports.innerHTML = allQuotes[i]["roriginairport"] + " ⇒ " + allQuotes[i]["rdestairport"];
				card.appendChild(returnAirports);

				/* Add return trip city and countries */
				const returnLocations = document.createElement("h5");
				returnLocations.setAttribute("class", "locations");
				returnLocations.innerHTML = allQuotes[i]["rorigincity"] + ", " + allQuotes[i]["rorigincountry"] + "\t\t\t" + allQuotes[i]["rdestcity"] + ", " + allQuotes[i]["rdestcountry"];
				card.appendChild(returnLocations);
			}

			/* Append card to list of cards in HTML*/
			allCards.appendChild(card);
		}
	} 
	else if(sortBy == "highlow"){
		document.getElementById("allCards").innerHTML = "";
		for(let i = allQuotes.length - 1; i >= 0; i--){
			/* Make card */
			const card = document.createElement("div");
			card.setAttribute("class", "cards");

			
			const carrier = document.createElement("h2");
			carrier.setAttribute("class", "carrier");
			carrier.innerHTML = allQuotes[i]["carrierName"];
			card.appendChild(carrier);

			/* Show currency symbol + price*/
			const price = document.createElement("h3");
			price.setAttribute("class", "price");
			price.innerHTML = currencySymbol + allQuotes[i]["minPrice"];

			/* If cheapest one, set it to cheapest */
			if(i == 0){
				price.setAttribute("id", "cheapest");
			}
			card.appendChild(price);

			/* Add depart trip airports */
			const departAirports = document.createElement("h3");
			departAirports.setAttribute("class", "airports");
			departAirports.innerHTML = allQuotes[i]["originairport"] + " ⇒ " + allQuotes[i]["destairport"];
			card.appendChild(departAirports);

			/* Add depart trip city and countries */
			const departLocations = document.createElement("h5");
			departLocations.setAttribute("class", "locations");
			departLocations.innerHTML = allQuotes[i]["origincity"] + ", " + allQuotes[i]["origincountry"] + "\t\t\t\t\t" + allQuotes[i]["destcity"] + ", " + allQuotes[i]["destcountry"];
			card.appendChild(departLocations);

			/* If round trip, also find same information now for inbound */
			if(isRoundTrip){
				const rcarrier = document.createElement("h2");
				rcarrier.setAttribute("class", "return-carrier");
				rcarrier.innerHTML = allQuotes[i]["rcarrierName"];
				card.appendChild(rcarrier);

				/* Add depart trip airports */
				const returnAirports = document.createElement("h3");
				returnAirports.setAttribute("class", "airports");
				returnAirports.innerHTML = allQuotes[i]["roriginairport"] + " ⇒ " + allQuotes[i]["rdestairport"];
				card.appendChild(returnAirports);

				/* Add return trip city and countries */
				const returnLocations = document.createElement("h5");
				returnLocations.setAttribute("class", "locations");
				returnLocations.innerHTML = allQuotes[i]["rorigincity"] + ", " + allQuotes[i]["rorigincountry"] + "\t\t\t" + allQuotes[i]["rdestcity"] + ", " + allQuotes[i]["rdestcountry"];
				card.appendChild(returnLocations);
			}

			/* Append card to list of cards in HTML*/
			allCards.appendChild(card);
		}
	}
}
