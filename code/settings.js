/// <reference path="main.js" />

var headers;

/**
 * Store options, both locally and on server
 * @param {Node} section Section containing the options.
 */
function storeOptions(element) {
	var section, 
		checkedOptions = [];
	if (element.classList.contains("languages"))
		section = optionSections.languages;
	else if (element.classList.contains("regions"))
		section = optionSections.regions;
	element.querySelectorAll("input:checked").forEach(function(elm) {
		checkedOptions.push(elm.id.substring(elm.id.indexOf("-")+1));
	});
	localStorage.setItem("biocaching:" + section.name, checkedOptions.join());
	if (authenticated) {
		// TODO: store settings on server
		var data = new FormData();
		data.append("settings[" + section.setting + "]", checkedOptions.join());
		sendRequest(requestMethod.put, "/settings/", function(){}, data);
	}
}

/**
 * Event handler for changing order of options.
 * @param {boolean} goUp Option should move up.
 */
function changeOrder(elm, goUp) {
	// TODO: ignore template row, or remove it
	elm = elm.parentNode.parentNode.parentNode; // get the active row
	if (goUp) {
		if (elm.previousElementSibling)
			elm.parentNode.insertBefore(elm, elm.previousElementSibling);
	}
	else {
		if (elm.nextElementSibling)
			elm.parentNode.insertBefore(elm, elm.nextElementSibling.nextElementSibling);
		else
			elm.parentNode.appendChild(elm);
	}
	storeOptions(elm.parentNode.parentNode);
}

/**
 * Make an interactive option item if it doesn't already exist, returns the associated input.
 * Note: two asynchronous requests can create these items:
 * - /languages/ and /regions/, these return all available options
 * - /settings/, this returns choosen options.
 * It's not known which request will return first, so results will have to be merged.
 * Note also, that /settings/ may return options which should not be available!
 * @param {string} section Either "languages" or "regions".
 * @param {object} option Option element.
 */
function getOptionItem(section, option) {
	var templateItem = document.querySelector("." + section.class + " .template"),
		input = document.querySelector("#" + section.name + "-" + option.slug),
		main = templateItem.parentNode,
		item;

	if (!input) {
		item = templateItem.cloneNode(true);
		item.classList.remove("template");
		input = item.querySelector("input");
		input.id = section.name + "-" + option.slug;
		input.addEventListener("change", function() { storeOptions(main.parentElement); })
		item.querySelectorAll("label").forEach(function(elm) {
			elm.setAttribute("for", section.name + "-" + option.slug);
		});
		item.querySelector("label.text").textContent = option.name || option.slug;
		item.querySelector(".up").addEventListener("click", function() { changeOrder(this,true); })
		item.querySelector(".down").addEventListener("click", function() { changeOrder(this,false); })
		main.appendChild(item);
	} else {
		// always set name if it is known, to overwrite possible use of slug
		if (option.name)
			input.parentNode.querySelector("label.text").textContent = option.name;
	}

	return input;
}

/**
 * Display the locally stored settings for a section in the option lists.
 */
function displayLocalSettings(section) {
	var settings = localStorage.getItem("biocaching:" + section.name).split(",");
	settings.reverse().forEach(function(setting){
		setting = setting.trim();
		var
			input = getOptionItem(section, { slug: setting }),
			main = input.parentNode.parentNode;
		main.insertBefore(input.parentNode, main.firstChild); // move item to first position, to reflect order
		input.checked = true;
	});
}

/**
 * Event handler for closing and opening option sections.
 */
function toggleSection() {
	// close all other sections
	for (i = 0; i < headers.length; i++) {
		if (this !== headers[i]) {
			headers[i].parentNode.classList.remove("active");
		}
	}
	// toggle current section
	this.parentNode.classList.toggle("active");
}

/**
 * Sign the current user out.
 */
function signOut() {
	localStorage.removeItem("biocaching:token");
	localStorage.removeItem("biocaching:user");
	location.reload();
}

/**
 * Display data retrieved from web service on page.
 * @param {object} data Data retrieved from web service.
 */
function displayData(data) {
	if (data.pictures && data.pictures.medium)
		document.querySelector(".profile img").src = api_root + data.user.pictures.medium;
	if (data.user) {
		document.querySelector(".profile").classList.remove("template");
		if (data.user.email)
			document.querySelector(".username").textContent = (data.user.displayname && data.user.displayname != "") 
				? data.user.displayname 
				: data.user.email;
		if (data.user.firstname || data.user.lastname)
			document.querySelector(".name dd").textContent = data.user.firstname + " " + data.user.lastname;
		if (data.user.email)
			document.querySelector(".email dd").textContent = data.user.email;
	}
	if (data.game_title)
		document.querySelector(".badge dd").textContent = data.game_title;
}

(function() {
	// add event handler to expand sections
	headers = document.querySelectorAll("header");
	headers.forEach(function(header) {
		header.addEventListener("click", toggleSection);
	});

	// create option lists for each option section (async)
	// note use of closure to keep the looping variable with the asynchronous call
	for (var n in optionSections) {(function(n){
		sendRequest(requestMethod.get, "/" + optionSections[n].apipath + "/", function(options) { 

			// create interactive list items
			options.forEach(function(option){
				getOptionItem(optionSections[n],option);
			});

			// show locally stored settings (authenticated user settings are displayed in seperate thread)
			if (!authenticated)
				displayLocalSettings(optionSections[n]);
		});
	})(n)}

	// fill user profile (async)
	if (authenticated) {
		sendRequest(requestMethod.get, usersRoot + localStorage.getItem("biocaching:user"), displayData);
		sendRequest(requestMethod.get, "/settings/", function(data) {
			getServerSettings(data);
			for (var n in optionSections) {
				displayLocalSettings(optionSections[n]);
			}
		});
	}

	// display version number from external file (async)
	// not using sendRequest, since this doesn't go to the API server
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "version.txt", true);
	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && xhr.status == 200) {
			console.log(xhr.responseText);
			document.querySelector(".about div").innerText += xhr.responseText;
		}
	}
	xhr.send();

	// sign out handler
	document.getElementById("sign-out").addEventListener("click", signOut);
})();
