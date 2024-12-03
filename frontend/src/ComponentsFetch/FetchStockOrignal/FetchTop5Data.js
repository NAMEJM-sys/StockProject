import { useEffect } from "react";

function FetchTop5Data({ onTopFetch }) {
    useEffect(() => {
        fetch('http://127.0.0.1:8000/api/top_5_scores/')
            .then(response => response.json())
            .then(data => {if (onTopFetch) onTopFetch(data)
            console.log(data)})
            .catch(error => console.error('Error Stock Data:', error));
    }, []);

    return null;
}

export default FetchTop5Data;