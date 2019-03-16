var app = angular.module("myModuleHomeDb", []);
app.controller("myControllerHomeDb", function($scope) {
    $scope.records = [
        "uploads/AB03.png",
        //"uploads/ABW01.png",
        "uploads/AB03.png",
        "uploads/AB04.png",
        "uploads/AB05.png",
        "uploads/AB03.png",
        "uploads/AB04.png",
        "uploads/AB05.png",
        "uploads/AB03.png",
        "uploads/AB04.png",
        "uploads/AB04.png",
        "uploads/AB05.png",
        "uploads/AB03.png",
        "uploads/AB03.png",
    ];

    $scope.recordsWomen = [
        "uploads/ABW01.png",
        "uploads/ABW02.png",
        "uploads/ABW03.png",
        "uploads/ABW04.png",
        "uploads/ABW05.png",
        "uploads/ABW01.png",
        "uploads/ABW02.png",
        "uploads/ABW03.png",
        "uploads/ABW04.png",
        "uploads/ABW05.png",
        "uploads/ABW01.png",
        "uploads/ABW02.png",
        "uploads/ABW03.png",
        
    ];

    $(document).ready(function(){
        $('.showProductInDetail').click(function(e) { 
            alert("goog");
        });
    });
        
});






