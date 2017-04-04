class GameManager
{
    constructor()
    {
        this.users = [];
        this.screenmanager = new ScreenManager();
    }

    draw()
    {
        this.screenmanager.draw();
    }

    addUser(user)
    {
        this.users.push(user);
    }

    removeUser(id)
    {
        for(var i in this.users)
        {
            if(this.users[i] == id || this.users[i].id == id || this.users[i].username == id)
            {
                this.users.splice(i, 1);
                break;
            }
        }
    }

    getUser()
    {
        return this.users[this.users.length - 1];
    }
}


class ScreenManager
{
    constructor()
    {
        this._rootScreen = null;
        this._topScreen = null;
        this._settings = null;
    }

    set root(r)
    {
        this._rootScreen = r;
        this._topScreen = r;
    }

    get root()
    {
        return this._rootScreen;
    }

    get topScreen()
    {
        return this._topScreen;
    }

    set topScreen(r)
    {
        if(this._topScreen != null)
            r.parent = this._topScreen;
        this._topScreen.pause();
        this._topScreen = r;
        r.start();
    }

    closeAll()
    {
        while(this._topScreen != this._rootScreen)
            this.close();
    }

    close()
    {
        if(this._topScreen != null)
        {
            this._topScreen.close();
            this._topScreen = this._topScreen.parent;
            if(this._topScreen != null)
                this._topScreen.restart();
        }
    }

    backUpTo(cls)
    {
        while(this._topScreen != null && !(this._topScreen.parent instanceof cls))
        {
            this._topScreen.close();
            this._topScreen = this._topScreen.parent;
        }
        this.close();
    }

    draw()
    {
        this._topScreen.draw();
    }
}

// NOTE: this class should be subclassed
class ScreenContainer
{
    constructor(name = null)
    {
        this._parent = null
        this._name = name;
    }

    set parent(p)
    {
        this._parent = p;
    }
    get parent()
    {
        return this._parent;
    }

    set name(n)
    {
        this._name = n;
    }

    get name()
    {
        return this._name;
    }

    back()
    {
        return true;
    }

    // events
    // NOTE: these need to be implemented in subclasses
    close() {}
    start() {}
    restart() {
        this.start();
    }
    pause() {}
    draw() {}
}

class User
{
    constructor()
    {
        this.username = null;
        this.id = null;
    }
}
