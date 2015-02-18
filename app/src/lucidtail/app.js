(function(){
'use strict';

  angular
    .module('lucidTailApp', ['ngMaterial'])
    .controller('AppCtrl', ['$scope', '$mdSidenav', '$mdBottomSheet', '$log', AppController ])
    .controller('BottomTabCtrl', ['$scope', '$mdBottomSheet', BottomTabCtrl ])
  ;

  /**
   * Main Controller
   * @param $scope
   * @param $mdSidenav
   * @constructor
   */
  function AppController($scope, $mdSidenav, $mdBottomSheet, $log ) {
    $scope.views = [
      {
        name: 'Tail',
        classname: 'tail'
      },
      {
        name: 'Grep',
        classname: 'grep'
      }
    ];

    $scope.selected = $scope.views[0];

    /**
     * Hide or Show the sideNav area
     * @param menuId
     */
    $scope.toggleSidenav = function toggleSideNav( name ) {
      $mdSidenav(name).toggle();
    }

    /**
     * Select the current views
     * @param menuId
     */
    $scope.select = function select( view ) {
        $scope.selected = angular.isNumber(view) ? $scope.views[view] : view;
        $scope.toggleSidenav('left');
    }

    /**
     * Show the bottom sheet
     */
    $scope.showActions = function showActions($event) {
        $mdBottomSheet.show({
          templateUrl: 'bottom-sheet-template.html',
          controller: 'BottomTabCtrl',
          targetEvent: $event
        }).then(function(clickedItem) {
          $log.debug( clickedItem.name + ' clicked!');
        });
    }
  }

  function BottomTabCtrl($scope, $mdBottomSheet) {
    $scope.data = { selectedIndex : 0 };
    $scope.next = function() {
      $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 1) ;
    };
    $scope.previous = function() {
      $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    };
  }


})();
