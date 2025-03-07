import React, { useEffect } from "react";
import { useState } from "react";
import LandingPage from "./LandingPage.js";
const SearchBar = (props) => {
    const [type, setType] = useState("");
    const [search, setSearch] = useState("");
    const [artist, setArtist] = useState("");
    const [album, setAlbum] = useState("");
    const [track, setTrack] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const getSearchResults = () => {
        // function body
    };

    const handleChange = (e) => {
        setSearch(e.target.value);
    }

    useEffect(() => {
        const fetchSearchResults = async () => {
            try {
                const response = await fetch(`https://api.spotify.com/v1/search?q=${search}&track=${track}&artist=${artist}&type=${type}&album=${album}&include_external=audio`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${props.token}`
                    }
                });
                const data = await response.json();
                console.log(data); // Debugging output
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
    
        if (search) fetchSearchResults();
    }, [search]);
    

    return (
        <div>
            <p>Search</p>
            <form>
                <input placeholder="Enter A Song, Album, or Artist" onChange={handleChange} value={search} type="text"/>
                <button onClick={() => setType("track")}>Track</button>
                <button onClick={() => setType("album")}>Album</button>
                <button onClick={() => setType("artist")}>Artist</button>   
            </form>
        </div>
    );
};

export default SearchBar;