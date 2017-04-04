
(function(){
    GM = new GameManager();

    var first_screen = new WelcomeScreen("welcome");

    GM.screenmanager.root = first_screen;

    GM.screenmanager.root.start();
})();
