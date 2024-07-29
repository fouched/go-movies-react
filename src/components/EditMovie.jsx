import {useNavigate, useOutletContext, useParams} from "react-router-dom";
import {useEffect, useState} from "react";
import Input from "./form/Input.jsx";
import Select from "./form/Select.jsx";
import TextArea from "./form/TextArea.jsx";
import Checkbox from "./form/Checkbox.jsx";
import Swal from "sweetalert2";

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
        genres: [],
        genres_array: [Array(14).fill(false)]
    });

    // get id from URL
    let {id} = useParams();
    if (id === undefined) {
        id = 0;
    }

    useEffect(() => {
        if (jwtToken === "") {
            navigate("/login");
            return;
        }

        // are we adding or editing?
        if (id === 0) {
            // reset state of movie in case
            // user was in edit movie state
            setMovie({
                id: 0,
                title: "",
                release_date: "",
                runtime: "",
                mpaa_rating: "",
                description: "",
                genres: [],
                genres_array: [Array(13).fill(false)]
            });

            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            const requestOptions = {
                method: "GET",
                headers: headers,
            }

            fetch(`http://localhost:9080/genres`, requestOptions)
                .then((res) => res.json())
                .then((data) => {
                  const checks = [];
                  data.forEach(g => {
                      checks.push({id: g.id, checked: false, genre: g.genre});
                  })

                    // eslint-disable-next-line no-unused-vars
                  setMovie(m => ({
                      ...m,
                      genres: checks,
                      genres_array: [],
                  }))

                })
                .catch(err => console.log(err));
        } else {
            // editing an existing movie
            const headers = new Headers();
            headers.append("Content-Type", "application/json");
            headers.append("Authorization", "Bearer " + jwtToken);

            const requestOptions = {
                method: "GET",
                headers: headers
            }

            fetch(`http://localhost:9080/admin/movies/${id}`, requestOptions)
                .then((response) => {
                    if (response.status !== 200) {
                        setError("Invalid response code:" + response.status);
                    }
                    return response.json();
                })
                .then((data) => {
                    // fix release date
                    data.movie.release_date = new Date(data.movie.release_date).toISOString().split("T")[0];

                    const checks = [];
                    data.genres.forEach(g => {
                        if (data.movie.genres_array.indexOf(g.id) !== -1) {
                            checks.push({id: g.id, checked: true, genre: g.genre});
                        } else {
                            checks.push({id: g.id, checked: false, genre: g.genre});
                        }
                    })

                    setMovie({
                        ...data.movie,
                        genres: checks,
                    })
                })
                .catch(err => console.log(err));
        }

    }, [id, jwtToken, navigate])

    const handleSubmit = (event) => {
        event.preventDefault();

        let errors = [];
        let required = [
            { field: movie.title, name: "title"},
            { field: movie.release_date, name: "release_date"},
            { field: movie.runtime, name: "runtime"},
            { field: movie.description, name: "description"},
            { field: movie.mpaa_rating, name: "mpaa_rating"},
        ]

        required.forEach(function (obj) {
            if (obj.field === "") {
                errors.push(obj.name)
            }
        })

        if (movie.genres_array.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'You must choose at least one genre',
                icon: 'error',
                confirmButtonText: 'OK',
            })
            errors.push("genres");
        }

        setErrors(errors);

        if (errors.length > 0) {
            return false
        }

        // passed validation, save changes
        const headers = new Headers();
        headers.append("Content-Type", "application/json");
        headers.append("Authorization", "Bearer " + jwtToken);

        // assume adding a new movie
        let method = "PUT"

        if (movie.id > 0) {
            method = "PATCH";
        }

        const requestBody = movie;
        // we need to convert the values in JSON for
        // release date to date
        // runtime to int
        requestBody.release_date = new Date(movie.release_date);
        requestBody.runtime = parseInt(movie.runtime, 10);

        let requestOptions = {
            body: JSON.stringify(requestBody),
            method: method,
            headers: headers,
            credentials: 'include',
        }

        fetch(`http://localhost:9080/admin/movies/${movie.id}`, requestOptions)
            .then((response) => response.json())
            .then((data) => {
                if (data.error) {
                    console.log(data.error);
                } else {
                    navigate("/manage-catalogue")
                }
            })
            .catch(err => console.log(err));
    }

    const handleChange = () => (event) => {
        let value = event.target.value;
        let name = event.target.name;
        setMovie({
            ...movie,
            [name]: value,
        })
    }

    const handleCheck = (event, position) => {
        console.log("handleCheck called")
        console.log("value in handleCheck:", event.target.value);
        console.log("checked is", event.target.checked);
        console.log("position is", position);

        let tmpArr = movie.genres;
        tmpArr[position].checked = !tmpArr[position].checked;

        let tmpIDs = movie.genres_array;
        if (!event.target.checked) {
            tmpIDs.splice(tmpIDs.indexOf(event.target.value));
        } else {
            tmpIDs.push(parseInt(event.target.value, 10));
        }

        setMovie({
            ...movie,
            genres_array: tmpIDs,
        })

    }

    return(
        <>
            <div>
                <h2>Add/Edit Movie</h2>
                <hr/>
                {/*<pre>{JSON.stringify(movie, null, 3)}</pre>*/}
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
                        value={movie.mpaa_rating}
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

                    <hr />

                    <h3>Genres</h3>

                    {movie.genres && movie.genres.length > 1 &&
                        <>
                            {Array.from(movie.genres).map((g, index) =>
                                <Checkbox
                                    title={g.genre}
                                    name={"genre"}
                                    key={index}
                                    id={"genre-id" + index}
                                    onChange={(event) => handleCheck(event, index)}
                                    value={g.id}
                                    checked={movie.genres[index].checked}
                                />
                            )}
                        </>
                    }

                    <hr />

                    <button className="btn btn-primary">Save</button>

                </form>
            </div>
        </>
    )
}

export default EditMovie