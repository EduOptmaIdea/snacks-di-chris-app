import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react'; // Adicione React aqui
import { fetchSnacks } from '../services/api';
export const SnackList = () => {
    const [snacks, setSnacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        const loadSnacks = async () => {
            try {
                const data = await fetchSnacks();
                setSnacks(data);
            }
            catch (err) {
                setError('Failed to load snacks. Please try again later.');
                console.error(err);
            }
            finally {
                setLoading(false);
            }
        };
        loadSnacks();
    }, []);
    if (loading)
        return _jsx("div", { className: "loading", children: "Loading snacks..." });
    if (error)
        return _jsx("div", { className: "error", children: error });
    return (_jsx("div", { className: "snack-grid", children: snacks.map((snack) => (_jsxs("div", { className: "snack-card", children: [_jsx("img", { src: snack.image, alt: snack.name }), _jsx("h3", { children: snack.name }), _jsx("p", { children: snack.description }), _jsxs("span", { children: ["$", snack.price.toFixed(2)] })] }, snack.id))) }));
};
