// declare a new module called 'myApp', and make it require the `ng-admin` module as a dependency
var myApp = angular.module('myApp', ['ng-admin']);

myApp.config(['NgAdminConfigurationProvider', function (nga) {
    // create an admin application
    var admin = nga.application('My First Admin')
        .baseApiUrl('https://474qkh1xp2.execute-api.eu-west-1.amazonaws.com/prod/lambda-microservice/'); // main API endpoint
    // create a user entity
    // the API endpoint for this entity will be 'http://jsonplaceholder.typicode.com/users/:id
    var user = nga.entity('users');
    // set the fields of the user entity list view
    user.listView().fields([
        nga.field('name'),
        nga.field('username'),
        nga.field('email')
    ]);
    // add the user entity to the admin application
    admin.addEntity(user);
    // attach the admin application to the DOM and execute it

    var customHeader =
        '<div class="navbar-header">\n' +
        '    <button type="button" class="navbar-toggle" ng-click="isCollapsed = !isCollapsed">\n' +
        '        <span class="icon-bar"></span>\n' +
        '        <span class="icon-bar"></span>\n' +
        '        <span class="icon-bar"></span>\n' +
        '    </button>\n' +
        '    <a class="navbar-brand" href="#" ng-click="appController.displayHome()">Всеукраїнська спілка учасників бойових дій <b>Побратими України</b></a>\n' +
        '</div>\n' +
        '<ul class="nav navbar-top-links navbar-right hidden-xs">\n' +
        '    <li uib-dropdown>\n' +
        '        <a uib-dropdown-toggle href="#" aria-expanded="true" ng-controller="username">\n' +
        '            <i class="fa fa-user fa-lg"></i>&nbsp;{{ username }}&nbsp;<i class="fa fa-caret-down"></i>\n' +
        '        </a>\n' +
        '        <ul class="dropdown-menu dropdown-user" role="menu">\n' +
        '            <li><a href="#" onclick="logout()"><i class="fa fa-sign-out fa-fw"></i> Logout</a></li>\n' +
        '        </ul>\n' +
        '    </li>\n' +
        '</ul>';

    admin.header(customHeader);

    nga.configure(admin);

}]);

// custom controllers
myApp.controller('username', ['$scope', '$window', function($scope, $window) {
    // $scope.username =  $window.localStorage.getItem('login');
    $scope.username =  window.Login.username();
}]);
