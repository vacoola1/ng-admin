// declare a new module called 'myApp', and make it require the `ng-admin` module as a dependency
var myApp = angular.module('myApp', ['ng-admin']);

var auth = window.auth || {};
var config = window._config || {};

myApp.config(['NgAdminConfigurationProvider', function (nga) {

    // Auth
    auth.authToken.then(function setAuthToken(token) {
        if (!token) {
            window.location.href = 'login.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = 'login.html';
    });

    // create an admin application
    var admin = nga.application('My First Admin')
        .baseApiUrl(config.api.invokeUrl); // main API endpoint
    // create a user entity
    // the API endpoint for this entity will be 'http://jsonplaceholder.typicode.com/users/:id
    var member = nga.entity('member');
    // set the fields of the user entity list view
    member.listView().fields([
        nga.field('id'),
        nga.field('name'),
        nga.field('email')
    ]);
    // add the user entity to the admin application
    admin.addEntity(member);
    // attach the admin application to the DOM and execute it

    let username = auth.username();

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
        '            <li><a href="#" onclick="auth.signOut()"><i class="fa fa-sign-out fa-fw"></i> Logout</a></li>\n' +
        '        </ul>\n' +
        '    </li>\n' +
        '</ul>';

    admin.header(customHeader);

    nga.configure(admin);

}]);


myApp.config(['$httpProvider', function($httpProvider) {
    auth.authToken.then(function (token) {
        $httpProvider.defaults.headers.common['Authorization'] = 'Bearer ' + token;
    });
}]);

// custom controllers
myApp.controller('username', ['$scope', '$window', function($scope, $window) {
    $scope.username = auth.username();
}]);
