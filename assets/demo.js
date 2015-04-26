var app = angular.module('demo', ['ngWaterfall']);

app.controller('WaterfallCtrl', function ($scope, $q, ngWaterfallParams) {

    var picDatas = [
        [600,399],[300,385],[300,421],[1280,850], [381,586],
        [300,420],[300,243],[300,420],[300,357],[300,224]
    ];


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

            for(var i = 0; i < 10; i++ ){
                $scope.datas.push({
                    'src': 'assets/images/demopic(' + i + ').jpg',
                    'title': 'My number is ' + i,
                    'alt': 'ng-waterfall',
                    'scale': picDatas[i][1]/picDatas[i][0]
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
