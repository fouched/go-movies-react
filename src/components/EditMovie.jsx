import {useNavigate, useOutletContext, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import Input from "./form/Input.jsx";
import Select from "./form/Select.jsx";
import TextArea from "./form/TextArea.jsx";

const EditMovie = () => {

    const navigate = useNavigate();
    const {jwtToken} = useOutletContext();

    const[error, setError] = useState(null);
    const[errors, setErrors] = useState([]);

    const hasError = (key) => {
        return errors.indexOf(key) !== -1;
    }

    const mpaaOptions = [
        {id: 'G', value:'G'},
        {id: 'PG', value:'PG'},
        {id: 'PG13', value:'PG13'},
        {id: 'R', value:'R'},
        {id: '18', value:'18'},
    ]

    const [movie, setMovie] = useState({
        id: 0,
        title: "",
        release_date: "",
        runtime: "",
        mpaa_rating: "",
        description: "",
    });

    // get id from URL
    let {id} = useParams();

    useEffect(() => {
        if (jwtToken === "") {
            navigate("/login");
            return;
        }
    }, [jwtToken, navigate])

    const handleSubmit = (event) => {
        event.preventDefault();
    }

    const handleChange = () => (event) => {
        let value = event.target.value;
        let name = event.target.name;
        setMovie({
            ...movie,
            [name]: value,
        })
    }

    return(
        <>
            <div>
                <h2>Add/Edit Movie</h2>
                <hr/>
                <pre>{JSON.stringify(movie, null, 3)}</pre>
                <form onSubmit={handleSubmit}>
                    <input type="hidden" id="id" name="id" value={movie.id}/>
                    <Input
                        title={"Title"}
                        className={"form-control"}
                        type={"text"}
                        name={"title"}
                        value={movie.title}
                        onChange={handleChange("title")}
                        errorDiv={hasError("title") ? "text-danger" : "d-none"}
                        errorMsg={"Please enter a title"}
                    />
                    <Input
                        title={"Release Date"}
                        className={"form-control"}
                        type={"date"}
                        name={"release_date"}
                        value={movie.release_date}
                        onChange={handleChange("release_date")}
                        errorDiv={hasError("release_date") ? "text-danger" : "d-none"}
                        errorMsg={"Please enter a release date"}
                    />
                    <Input
                        title={"Runtime"}
                        className={"form-control"}
                        type={"text"}
                        name={"runtime"}
                        value={movie.runtime}
                        onChange={handleChange("runtime")}
                        errorDiv={hasError("runtime") ? "text-danger" : "d-none"}
                        errorMsg={"Please enter a runtime"}
                    />
                    <Select
                        title={"MPAA Rating"}
                        name={"mpaa_rating"}
                        options={mpaaOptions}
                        onChange={handleChange("mpaa_rating")}
                        placeholder={"Choose..."}
                        errorDiv={hasError("mpaa_rating") ? "text-danger" : "d-none"}
                        errorMsg={"Please choose"}
                    />

                    <TextArea
                        title={"Description"}
                        name={"description"}
                        value={movie.description}
                        rows={"3"}
                        onChange={handleChange("description")}
                        errorDiv={hasError("description") ? "text-danger" : "d-none"}
                        errorMsg={"Please enter a description"}
                    />

                </form>
            </div>
        </>
    )
}

export default EditMovie