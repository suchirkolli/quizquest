
// reusing some of the assets from App.css
function login() {
    return (
        <form>
            <div className="welcome-page-wrapper">
            <div className="welcome-panel">
            <h1> Login </h1>
            <input type="text" name = "username" id="username" placeholder = "username"/>
            <p>                                </p>
            <input type="text" name = "password" id="password" placeholder = "password"/>
            </div>
            </div>
        </form>
        

    );
}
export default login;
