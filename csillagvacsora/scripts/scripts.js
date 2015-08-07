window.addEventListener("load", init, false);

var data;

function init() {
	$("#fullpage").fullpage({
		anchors:["overview", "day1main", "day1food3", "day2main", "day2food1", "day3main", "day3food1"]
	});
	
	
	var imageCounts = [
		[3, 0, 0],
		[0, 2, 0],
		[0, 0, 3]
	];
	
	var options = {duration: 3000, hu: "images/", controller: false, captions: false, thumbnails: false};
	
	data = [];
	
	for (var i = 0; i < imageCounts.length; i++) {
		data[i] = {};
		
		for (var j = 0; j < imageCounts[i].length; j++) {
			for (var k = 0; k < imageCounts[i][j]; k++) {
				data[i]["day" + (i + 1) + "/food" + (j + 1) + "/" + (k + 1) + ".jpg"] = {};
			}
		}
		
		new Slideshow.KenBurns("day" + (i + 1) + "SlideShow", data[i], options);
		new Slideshow.KenBurns("day" + (i + 1) + "MainSlideShow", data[i], options);
	}
	
	// var options = {duration: 3000, hu: "images/day1/", controller: false, captions: false};
	// new Slideshow.KenBurns("day1SlideShow", data, options);
	
	// var data = { "1.jpg": {}, "2.jpg": {}};
	// var options = {duration: 3000, hu: "images/day2/", controller: false, captions: false};
	// new Slideshow.KenBurns("day2SlideShow", data, options);
	
	// var data = { "1.jpg": {}, "2.jpg": {}, "3.jpg":{}};
	// var options = {duration: 3000, hu: "images/day3/", controller: false, captions: false};
	// new Slideshow.KenBurns("day3SlideShow", data, options);
}