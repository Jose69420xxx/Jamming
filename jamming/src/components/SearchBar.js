import React from "react";
import { useState } from "react";

const SearchBar = () => {
    const [search, setSearch] = useState("");
    const handleChange = (e) => {
        setSearch(e.target.value);
    }

    return (
        <div>
            <p>Search</p>
            <input placeholder="Enter A Song, Album, or Artist" onChange={handleChange} value={search} type="text"/>
        </div>
    );
};

export default SearchBar;