var app = angular.module('demo', ['ngWaterfall']);

app.controller('WaterfallCtrl', function ($scope, $q, ngWaterfallParams) {


    $scope.waterfallParams = new ngWaterfallParams({
        name: "我是一个瀑布流组件",
        contentTemplate: "assets/template.html",
        // containerId: "ng-waterfall1",
        // extendOutboxClass: "outbox1",
        // extendBoxClass: "box1",
        cols: 5,
        colsWidth: 200
    },{
        scope: $scope,
        getData: function(){
            var defer = $q.defer();

            $scope.datas = [];

            for(var i = 10; i--; ){
                $scope.datas.push({
                    'src': 'assets/images/pic(' + random() + ').jpg',
                    'title': 'My number is ' + random(),
                    'alt': 'ng-waterfall'
                });
            }

            defer.resolve($scope.datas);

            return defer.promise;
        }
    });

    var random = $scope.random = function(){
        return Math.floor(Math.random()*16);
    };

});
