import React from "react";
import { useState } from "react";
import SearchBar from "./SearchBar";
const Jamming = (props) => {
    const [token, setToken] = useState("");
    setToken(props.accessToken);
    return (
        <div>
            <SearchBar token={token}/>        
        </div>
    );
};

export default Jamming;