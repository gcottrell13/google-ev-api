

class WelcomeScreen extends ScreenContainer
{
    start()
    {
        printpage("center-align",
            wblock(
                wtitle("GeV")
            ),
            wblock(
                wbutton("Login", 'changePage(LoginScreen)')
            )
        );
    }
}
class LoginScreen extends ScreenContainer
{
    back(){return false;}

    start()
    {
        printpage("center-align",
            wblock(
                wtitle('Login')
            ),
            wblock(
                winput('text', 'Username', {'name' : 'username', 'data-clear' : true})
            ),
            wblock(
                winput('text', 'Password', {'name' : 'password', 'data-clear' : true})
            ),
            wblock(
                wbutton("Submit", 'GM.screenmanager.topScreen.Login()', 'submit')
            )
        );
        input_events();
    }

    Login()
    {
        var username = $("input[name='username']");
        var password = $("input[name='password']");
        //log("logging in", username.val(), password.val());

        username.prop("disabled", true);
        password.prop("disabled", true);

        $("#submit").prepend('<i class="fa fa-spin fa-spinner" id="spinner"></i>');

        ajaxPOST('backend.php', {action: "login", username: username.val(), password: password.val()}, function(r){
            log("RESULT:", r);
            var result = JSON.parse(r);
            if(result.success == 1)
            {
                var newUser = new User();
                newUser.username = result.username;
                newUser.id = result.id;
                newUser.level = result.level;
                newUser.expires = result.expires;

                GM.addUser(newUser);

                changePage(UserMenu);
            }
            else
            {
                $("#spinner").remove();
                username.prop("disabled", false);
                password.prop("disabled", false);
            }
        });
    }
}

class UserMenu extends ScreenContainer
{
    back(){return false;}

    start()
    {
        printpage("center-align",
            wblock(
                wtitle('GeV')
            ),
            wblock(
                wbutton("Start A Query", 'changePage(CoordPoint, \'selectpoints\')') // QuerySelectorMenu
            ),
            wblock(
                wbutton("See Past Queries", 'changePage(SeePastQueriesPage)')
            ),
            // wblock(
            //     wbutton("Settings", 'changePage(SettingsMenu)')
            // ),
            GM.getUser().level == 1 ?
                wblock(
                    wbutton("Create Temporary User", "changePage(TempUserCreatePage)")
                ): "",
            wblock(
                wbutton("Logout", 'GM.screenmanager.topScreen.Logout()')
            )
        );
    }

    Logout()
    {
        console.log("logged out");
        GM.removeUser(GM.getUser());
        GM.screenmanager.closeAll();
    }
}

class QuerySelectorMenu extends ScreenContainer
{
    constructor()
    {
        super("QuerySelectorMenu");
    }
    start()
    {
        printpage("",
            wblock(
                wtitle('GeV')
            ),
            wblock(
                wbutton("Map Select Coordinates", 'changePage(CoordPoint, \'selectpoints\')')
            )//,
            // wblock(
            //     wbutton("Import Coordinates", 'changePage(CoordImport)')
            // )
        );
    }
}

class SettingsMenu extends ScreenContainer
{
    start()
    {
        printpage("",
            wblock(
                wtitle("Settings")
            ),

            GM.getUser().level == 1 ?
                wblock(
                    wbutton("Create Temporary User", "changePage(TempUserCreatePage)")
                )
            : "",
            wblock()
        );

    }
}

class TempUserCreatePage extends ScreenContainer
{
    start()
    {
        printpage("",
            wblock(
                wtitle("Create Temporary User")
            ),
            wblock(
                winput('text', 'Username', {'name' : 'username', 'data-clear' : true})
            ),
            wblock(
                winput('text', 'Password', {'name' : 'password', 'data-clear' : true})
            ),
            wblock(
                winput('text', 'Number of Days', {'name' : 'expires', 'data-clear' : true})
            ),
            wblock(
                wbutton("Submit", "GM.screenmanager.topScreen.submit()")
            )
        );
        input_events();
    }

    submit()
    {
        var username = $("input[name=username]");
        var password = $("input[name=password]");
        var expires = $("input[name=expires]");

        var expiration = parseInt(expires.val());

        if(isNaN(expiration))
        {
            // must be an integer!
            return;
        }

        username.prop("disabled", true);
        password.prop("disabled", true);
        expires.prop("disabled", true);

        $("#submit").prepend('<i class="fa fa-spin fa-spinner" id="spinner"></i>');

        ajaxPOST('backend.php', {action: "createtemp", username: username.val(), password: password.val(), expires: expiration}, function(r){
            log("RESULT:", r);
            var result = JSON.parse(r);
            if(result.success == 1)
            {
                changePage(ConfirmCreateTempUser, {
                    username: username.val(),
                    password: password.val()
                });
            }
            else
            {
                $("#spinner").remove();
                username.prop("disabled", false);
                password.prop("disabled", false);
                expires.prop("disabled", false);
            }
        });
    }
}

class ConfirmCreateTempUser extends ScreenContainer
{
    back(){return false;}
    constructor(args)
    {
        super("ConfirmCreateTempUser");
        this.info = args;
    }
    start()
    {
        printpage("",
            wblock(
                "Successful creation of temporary user"
            ),
            wblock(
                wtitle("Username: " + this.info.username)
            ),
            wblock(
                wtitle("Password: " + this.info.password)
            ),
            wblock(
                "Make sure you write this down, as you won't be able to view it again!"
            ),
            wblock(
                wbutton("Back", "GM.screenmanager.backUpTo(SettingsMenu)")
            )
        );
    }
}


class SeePastQueriesPage extends ScreenContainer
{
    start()
    {
        printpage("",
            wblock(
                wtitle("Past Queries")
            )
        );

        get_queries();
    }
}


function changePage(pageClass, name = null) {
	// If navigating back
	if (pageClass === "back") {
		GM.screenmanager.close();
	}
	else {
		GM.screenmanager.topScreen = new pageClass(name);
	}
}

function input_events()
{
    // Add event listeners to all inputs
    [].slice.call(document.querySelectorAll('[data-clear]')).forEach((input) => {
    	let value = input.value;
    	input.onfocus = (e) => {
    		if (e.target.value == value) e.target.value = "";
    	}
    	input.onblur = (e) => {
    		if (!e.target.value) e.target.value = value;
    	}
    });
}
