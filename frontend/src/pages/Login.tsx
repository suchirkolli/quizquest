
// reusing some of the assets from App.css
function login() {
    return (
        <form>
            <div className="welcome-page-wrapper">
            <div className="welcome-panel">
            <h1> Login </h1>
            <label>Username: </label>
            <input type="text" name = "username" placeholder = "username"/>
            <p>                                </p>
            <label>Password: </label>
            <input type="text" name = "password" placeholder = "password"/>
            <p> </p> 
            <label> error message here if login is incorrect in some way, shape, or form</label>
            </div>
            </div>
        </form>
        

    );
}
export default login;
