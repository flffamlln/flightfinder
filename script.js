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
	let allQuotes;
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
						quotesURL = "https://skyscanner-skyscanner-flight-search-v1.p.rapidapi.com/apiservices/browsequotes/v1.0/" + outcountry + "/" + currency + "/en-US/" + outlocationID + "/" + inlocationID + "/" + outdate + "?inboundpartialdate=" + indate;
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
							/*If no quotes, alert user*/
							if(data.Quotes.length == 0){
								window.alert("There are no results for this search at this time!");
								return;
							}
							/* For each quote, make HTML card */
							console.log(data);
							data.Quotes.forEach(function (quote){
								/* Assign needed info to variables */
								let minPrice = quote.MinPrice;
								let carrierId = quote.OutboundLeg.CarrierIds;
								let departureDate = quote.OutboundLeg.DepartureDate;
								let currency = data.Currencies[0].Symbol;

								/* Make card */
								const card = document.createElement("div");
								card.setAttribute("class", "cards");

								/* Show price */
								const price = document.createElement("h3");
								price.setAttribute("card", "minprice");
								price.innerHTML = symbol + minPrice;
								card.appendChild(price);

								document.body.appendChild(card);
							});
						})
						.catch(err => {
							console.error(err);
						});
				})
		);


	

	

}



