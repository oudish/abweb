$(function () {
	$('.toggle-menu').click(function(){
		$('.exo-menu').toggleClass('display');

	});

});

$(document).ready(function() {
  $("#videoWorkout").on("mouseover", function(event) {
    this.play();

  }).on('mouseout', function(event) {
    this.pause();

  });
});

/*
	$scope.detectmob = function() { 
		 if( navigator.userAgent.match(/Android/i)
		 || navigator.userAgent.match(/webOS/i)
		 || navigator.userAgent.match(/iPhone/i)
		 || navigator.userAgent.match(/iPad/i)
		 || navigator.userAgent.match(/iPod/i)
		 || navigator.userAgent.match(/BlackBerry/i)
		 || navigator.userAgent.match(/Windows Phone/i)
		 ){
	 		$scope.message1 = "Angularwweeee";
	 		$scope.styleMobile = "max-height: 100%;max-width: 100%";
	 		$scope.classRow = "row";
	 		$scope.overflowX="overflow-x: hidden";
	  	}
	 else {
	 	//$("#test").append(imagee);		
	 	$scope.message1 = "Angularwweeeexxxx";
	 	//$scope.styleMobile = "";
	 	
	  }
	}*/