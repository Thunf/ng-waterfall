!(function(angular, factory){
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['angular'], function(angular) {
            return factory(angular);
        });
    } else {
        return factory(angular);
    }
})(angular || null, function(angular){
    'use strict';
    var app = angular.module('ngWaterfall',[]);

    app.factory('$safeApply', function(){
        return function(scope, fn){
            var phase = scope.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && ( typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                scope.$apply(fn);
            }
        };
    });

    app.factory('NgWaterfallParams', ['$q',function($q){
        var ngWaterfallParams = function(newParams, newSettings){
            this.data = [];
            this.setParams = function(newParams){
                if(angular.isDefined(newParams)){
                    params = angular.extend(params, newParams);
                    return this;
                }
                return params;
            };

            this.setSettings = function(newSettings){
                if(angular.isDefined(newSettings)){
                    settings = angular.extend(settings, newSettings);
                    return this;
                }
                return settings;
            };

            this.getData = function(defer, params){
                if(angular.isArray(this.data) && angular.isObject(params)){
                    defer.resolve(this.data);
                }else{
                    defer.resolve([]);
                }
                return defer.promise;
            };

            this.loadNewData = function() {

                var defer = $q.defer(), 
                    self = this, 
                    newData = null;

                if (!settings.scope) return;
                settings.loading = true;

                newData = settings.getData(defer, this);
                if (!newData) newData = defer.promise;

                return newData.then(function(data) {
                    settings.loading = false;
                    self.data = data;
                    if (settings.scope) settings.scope.$data = data;
                    return data;
                });
            };

            var params = this.$params = {
                name: "waterfall",
                containerId: 'ng-waterfall',
                extendOutboxClass: 'outbox',
                extendBoxClass: 'box',
                contentTemplate: undefined,
                cols: undefined,
                colsWidth: 200

            },  settings = {
                scope: null,
                loading: false
            };

            this.setSettings(newSettings);
            this.setParams(newParams);
            return this;
        };
        return ngWaterfallParams;

    }]);

    app.factory('ngWaterfallParams', ['NgWaterfallParams', function(NgWaterfallParams) {
        return NgWaterfallParams;
    }]);

    app.controller('ngWaterfallController', ['$scope','ngWaterfallParams','$window','$document','$element','$attrs','$compile','$safeApply',
    function($scope, NgWaterfallParams, $window , $document, $element, $attrs, $compile, $safeApply){

        var isFirstTimeLoad = true;

        if(!$scope.hasOwnProperty("params")){
            $scope.params = new NgWaterfallParams();
            $scope.params.isNullInstance = true;
            $scope.ngData = {};
            $scope.total = 0;
        }

        $scope.params.setSettings().scope = $scope;

        $scope.$watch('params.$params', function(newParams, oldParams){

            if(newParams === oldParams) return;


            $scope.params.setSettings().scope = $scope;

            $scope.params.loadNewData().then(function(data){
                compileEachBox(data);
            });

            if(!$scope.params.isNullInstance) {
                isFirstTimeLoad = false;
            }   

        }, true);

        angular.element($window).bind("scroll",function(){
            if($document[0].activeElement.scrollHeight - $window.scrollY - $window.innerHeight < 200){

                if($scope.params.setSettings().loading){
                    return;
                }

                $scope.params.loadNewData().then(function(data){
                    compileEachBox(data);
                });
                    
            }
        });

        $scope.imgLoad = function(item, index){
            $scope.total++;
            toWaterfall($scope.params.$params.containerId, $scope.params.$params.cols);
        };

        var toWaterfall = this.toWaterfall = function(containId, cols){

            var container = angular.element('#'+containId);

            var outboxs = container.find('.outbox');

            var num = null;
            if(angular.isDefined(cols) && angular.isNumber(cols)){
                num = cols;
            }else{
                num = Math.floor(container[0].offsetWidth/outboxs[0].offsetWidth);
            }

            container.css({
                'position':'relative',
                'left': '50%',
                'width': num*outboxs[0].offsetWidth,
                'margin-left': -(num*outboxs[0].offsetWidth>>>1),
                'background': 'transparent'
            });

                
            if(( $scope.Harr && $scope.Harr.length || []) < $scope.params.$params.cols){

                var Harr = $scope.Harr = [];

                for(var j=0; j<num && outboxs[j]; j++){
                    Harr.push(outboxs[j].offsetHeight);
                }

                var minkey = $scope.minkey = 0, 
                    minH = $scope.minH = Harr[0];

            }

            if($scope.total > num){

                var n = $scope.total - 1;
                if( n < outboxs.length ){

                    angular.forEach($scope.Harr, function(H, index){
                        if($scope.minH > H){
                            $scope.minH = H;
                            $scope.minkey = index;
                        }
                    });
                    
                    angular.element(outboxs[n]).css({
                        'position': 'absolute',
                        'top': $scope.Harr[$scope.minkey],
                        'left': outboxs[$scope.minkey].offsetLeft
                    });

                    $scope.minH += outboxs[n].offsetHeight; 
                    $scope.Harr[$scope.minkey] += outboxs[n].offsetHeight; 
                }
            }
        };

        var compileNewBox = this.compileNewBox = function(datas){

            if($element.attr("ng-waterfall")){

                $element.addClass("ng-waterfall clearfix") .attr({"id": $scope.params.$params.containerId});

            }
        };

        var compileEachBox = this.compileEachBox = function(datas){

            if($element.attr("ng-waterfall")){

                $element.addClass("ng-waterfall clearfix").attr("id", $scope.params.$params.containerId);
                $scope.templates = {
                    content: ($scope.params.$params.contentTemplate ? $scope.params.$params.contentTemplate : 'ng-waterfall/box/content.html')
                };

                angular.forEach(datas,function(box){

                    var imgTemp = angular.element(document.createElement('img'))
                        .attr({
                            'src': box.src || '',
                            'alt': box.alt || '',
                            'title': box.title || ''
                        });

                    imgTemp.on('load',function(){
                        $scope.total++;
                        toWaterfall($scope.params.$params.containerId, $scope.params.$params.cols);

                    });

                    var contentTemp = angular.element(document.createElement('div'))
                        .addClass('content')
                        .attr({'ng-include':'templates.content'});

                    var boxTemp = angular.element(document.createElement('div')).addClass('box ' + $scope.params.$params.extendBoxClass.toString());
                    boxTemp.append(imgTemp, contentTemp);

                    var outboxTemp = angular.element(document.createElement('div'))
                        .css({'width': $scope.params.$params.colsWidth})
                        .addClass('outbox ' + $scope.params.$params.extendOutboxClass.toString());
                    outboxTemp.append(boxTemp);

                    $element.append(outboxTemp);

                    $safeApply($scope, function(){
                        $compile(outboxTemp)($scope);
                    });
                });
            }
        };
    }]);

    app.directive('ngWaterfall',function(){
        return {
            restrict: 'A',
            scope: false,
            controller: 'ngWaterfallController',
            compile: function($element, $controller){

                // wait to do something
                
                return {
                    pre: function preLink($scope, $element, $attrs, $controller){

                        // wait to do something

                    },
                    post: function postLink($scope, $element, $attrs, $controller){

                        $scope.$watch($attrs.ngWaterfall,function(params){
                            $scope.params = params;
                        },false);
                        
                    }
                };
            }
        };
    });

    app.run(['$templateCache',function($templateCache){
        $templateCache.put('ng-waterfall/box/content.html','<p>我就是自由的示例</p><p>1</p>');
    }]);

    return app;

});