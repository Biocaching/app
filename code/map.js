(function() {
	if (document.querySelector(".personal-section"))
		document.title = "My map - Biocaching";

	var mymap = L.map('map').setView([69.3, 17.1], 8);
	L.tileLayer(/*'http://korona.geog.uni-heidelberg.de:8001/tms_r.ashx?x={x}&y={y}&z={z}'*/'http://tile.openstreetmap.org/{z}/{x}/{y}.png', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
	    maxZoom: 18
	}).addTo(mymap);
	L.marker([69.4, 17.1]).addTo(mymap)
		.bindPopup("<div class='spacer'></div><img src='content/observation-3.jpg'/><h2>Norsk navn</h2><h3>Latinsk navn</h3><time datetime='2016-11-05'>11.05.2016</time>").openPopup();
	L.marker([69.5, 17.9]).addTo(mymap);
	L.marker([69.0, 17.7]).addTo(mymap);

})();
