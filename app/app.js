(function(){
'use strict';

  angular
    .module('ltApp', ['ngMaterial', 'btford.socket-io'])
    .factory('ltSocket', function (socketFactory) {
      return socketFactory();
    })
    .factory('FilterService', function () {
      return {search: {}, highlight: {}};
    })
    .controller('MessageListCtrl', ['$scope', 'ltSocket', 'FilterService', MessageListCtrl ])
    .controller('BottomTabCtrl', ['$scope', 'FilterService', BottomTabCtrl ])
    .controller('AppCtrl', ['$scope', '$window', '$mdSidenav', '$mdBottomSheet', '$log', 'FilterService', AppController ])
  ;

  function MessageListCtrl($scope, ltSocket, FilterService) {
    $scope.items = [];

    $scope.search = FilterService.search;

    ltSocket.on('data', function (event, meta) {
      $scope.items.push({event: event, meta: meta, timestamp: new Date()});
    });
  }

  /**
   * Main Controller
   * @param $scope
   * @param $mdSidenav
   * @constructor
   */
  function AppController($scope, $window, $mdSidenav, $mdBottomSheet, $log, FilterService ) {
    $scope.views = [
      {
        name: 'Prototype',
        classname: 'tail'
      },
      {
        name: 'Classic View',
        classname: 'grep'
      }
    ];

    $scope.selected = $scope.views[0];

    $scope.search = FilterService.search;

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
     * Select the current views
     * @param menuId
     */
    $scope.viewClassic = function viewClassic( ) {
      $window.location.href = "/classic";
    }

    /**
     * Show the bottom sheet
     */
    $scope.showActions = function showActions($event) {
        $mdBottomSheet.show({
          parent: angular.element(document.getElementById('content')),
          templateUrl: 'bottom-sheet-template.html',
          controller: 'BottomTabCtrl',
          targetEvent: $event,
          disableParentScroll: false
        });
    }
  }

  function BottomTabCtrl($scope, FilterService) {
    $scope.data = {
      selectedIndex : 0
    };
    $scope.search = FilterService.search;
    $scope.next = function() {
      $scope.data.selectedIndex = Math.min($scope.data.selectedIndex + 1, 1) ;
    };
    $scope.previous = function() {
      $scope.data.selectedIndex = Math.max($scope.data.selectedIndex - 1, 0);
    };
  }
})();
