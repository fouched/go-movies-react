import {useState} from "react";
import Input from "./form/Input.jsx";
import {useNavigate, useOutletContext} from "react-router-dom";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { setJwtToken } = useOutletContext();
    const { setAlertClassName } = useOutletContext();
    const { setAlertMessage } = useOutletContext();

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();

        // build request payload
        let payload = {
            email: email,
            password: password,
        }

        const requestOptions = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: 'include',
            body: JSON.stringify(payload)
        }

        fetch(`/authenticate`, requestOptions)
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    setAlertClassName("alert-danger");
                    setAlertMessage(data.message);
                } else {
                    setJwtToken(data.token);
                    setAlertClassName("d-none");
                    setAlertMessage("");
                    navigate("/");
                }
            })
            .catch(error => {
                setAlertClassName("alert-danger");
                // setAlertMessage(error);
                setAlertMessage(error.message);
            });
    }

    return(
        <>
            <div className="col-md-6 offset-md-3">
                <h2>Login</h2>
                <hr/>

                <form onSubmit={handleSubmit}>
                    <Input
                        title="Email"
                        type="email"
                        className="form-control"
                        name="email"
                        autoComplete="email-new"
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <Input
                        title="Password"
                        type="password"
                        className="form-control"
                        name="password"
                        autoComplete="password-new"
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    <hr />

                    <input
                        type="submit"
                        className="btn btn-primary"
                        value="Log in"
                    />
                </form>
            </div>
        </>
    )
}

export default Login