/*global WildRydes _config AmazonCognitoIdentity AWSCognito*/

var auth = window.auth || {};

var config = window._config || {};

(function scopeWrapper() {
    var signinUrl = '/login.html';

    var config = window._config;
    var poolData = {
        UserPoolId: config.cognito.userPoolId,
        ClientId: config.cognito.userPoolClientId
    };

    var userPool;

    if (!(config.cognito.userPoolId &&
            config.cognito.userPoolClientId &&
            config.cognito.region)) {
        console.error('User pool is not configured');
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    var currentUser;

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = config.cognito.region;
    }

    auth.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
        window.location.href = '../login.html';
    };

    auth.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });

    auth.username = function username() {
        return userPool.getCurrentUser().username;
    };

    /*
     * Cognito User Pool functions
     */

    function register(email, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);

        userPool.signUp(emailToUsername(email), password, [attributeEmail], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(username, password, onSuccess, onFailure) {
        console.log("u: " + username + "p: " + password);
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: username,
            Password: password
        });

        var cognitoUser = createCognitoUser(username);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure,
            newPasswordRequired: function (userAttributes, requiredAttributes) {
                console.log('New password required');
                // console.log(userAttributes.stringify());
                // console.log(requiredAttributes.stringify());
                document.getElementById('signinForm').style.display = "none";
                document.getElementById('usernameChangePassword').value = username;
                let changepasswordForm = document.getElementById('changepasswordForm');
                changepasswordForm.onsubmit = getChangePasswordHandler(cognitoUser, requiredAttributes)
                changepasswordForm.style.display = "block";
            }
        });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }

    function changePassword(cognitoUser, newPassword, requiredAttributes, onSuccess, onFailure) {
        if(!currentUser) {
            onFailure("Current user is not defined")
        }
        cognitoUser.completeNewPasswordChallenge(newPassword, {},
            {
                onSuccess: onSuccess,
                onFailure: onFailure
            }
       /*     function confirmCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
        }*/);
    }

    function createCognitoUser(username) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: username,
            Pool: userPool
        });
    }

    function emailToUsername(email) {
        return email.replace('@', '-at-');
    }

    /*
     *  Event Handlers
     */

    function onDocReady() {
        let signinForm = document.getElementById('signinForm');
        if (signinForm) {
            signinForm.onsubmit =  handleSignin
        }
        // document.getElementById('registrationForm').onsubmit =  handleRegister;
        // document.getElementById('verifyForm').onsubmit =  handleVerify;
    }
    document.addEventListener("DOMContentLoaded", onDocReady);

    function handleSignin(event) {
        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        event.preventDefault();
        signin(username, password,
            function signinSuccess() {
                console.log('Successfully Logged In');
                window.location.href = '../index.html';
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function getChangePasswordHandler(cognitoUser, requiredAttributes) {
        return function handleChangePassword(event) {
            var user = document.getElementById('usernameChangePassword').value;
            var password = document.getElementById('passwordInputChange').value;
            var password2 = document.getElementById('password2InputChange').value;

            var onSuccess = function changeSuccess(result) {
                console.log('Successfully password changed');
                window.location.href = '../index.html';


                // signin(user, password,
                //     function signinSuccess() {
                //         console.log('Successfully Logged In');
                //         window.location.href = 'index.html';
                //     },
                //     function signinError(err) {
                //         alert(err);
                //     }
                // )
            };
            var onFailure = function changeFailure(err) {
                alert(err);
            };
            event.preventDefault();

            if (password === password2) {
                changePassword(cognitoUser, password, requiredAttributes, onSuccess, onFailure);
            } else {
                alert('Passwords do not match');
            }
        };
    }

    function handleRegister(event) {
        var user = document.getElementById('username').value;
        var password = document.getElementById('passwordInputRegister').value;
        var password2 = document.getElementById('password2InputRegister').value;

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            console.log('user name is ' + cognitoUser.getUsername());
            var confirmation = ('Registration successful. Please check your user inbox or spam folder for your verification code.');
            if (confirmation) {
                window.location.href = 'verify.html';
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(user, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var user = document.getElementById('emailInputVerify').value;
        var code = document.getElementById('codeInputVerify').value;
        event.preventDefault();
        verify(user, code,
            function verifySuccess(result) {
                console.log('call result: ' + result);
                console.log('Successfully verified');
                alert('Verification successful. You will now be redirected to the login page.');
                window.location.href = signinUrl;
            },
            function verifyError(err) {
                alert(err);
            }
        );
    }


}());