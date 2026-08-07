import { useEffect, useState, useCallback } from "react";
import axios from "axios";

const useSearch = (url, search, params = {}) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);

    const getData = useCallback(async () => {
        try {
            setLoading(true);

            const response = await axios.get(url, {
                params: {
                    search,
                    ...params
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`
                }
            });

            // Store the entire response data object (result, total, totalPages, etc.)
            setData(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [url, search, JSON.stringify(params)]);

    useEffect(() => {
        const timer = setTimeout(() => {
            getData();
        }, 500);

        return () => clearTimeout(timer);
    }, [getData]);

    return {
        data,
        loading,
        fetchData: getData
    };
};

export default useSearch;