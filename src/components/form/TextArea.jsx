const TextArea = (props) => {
    return (
        <div className="mb-3">
            <label htmlFor="{props.name}" className="form-label">
                {props.title}
            </label>
            <textarea
                id={props.name}
                name={props.name}
                className="form-control"
                value={props.value}
                onChange={props.onChange}
                rows={props.rows}
            />
            <div className={props.errorDiv}>{props.errorMsg}</div>
        </div>
    )
}

export default TextArea;