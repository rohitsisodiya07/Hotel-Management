import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";

const useSearch = (url, search, params = {}, delay = 500) => {
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fix 3: useMemo ke sath params stringify taaki infinite loop na bane
    const paramsString = useMemo(() => {
        return JSON.stringify(params);
    }, [params]);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(url, {
                params: {
                    search,
                    ...JSON.parse(paramsString),
                },
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    }, [url, search, paramsString]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, delay);

        return () => clearTimeout(timer);
    }, [fetchData, delay]);

    return {
        data,
        loading,
        error,
        fetchData, // Fix 2: fetchData return kiya taaki component me direct call ho sake
        refetch: fetchData,
    };
};

export default useSearch;