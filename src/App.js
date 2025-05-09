import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import './App.css';
import { SnackList } from './components/SnackList';
function App() {
    return (_jsxs("div", { className: "App", children: [_jsx("header", { children: _jsx("h1", { children: "Snack Menu" }) }), _jsx("main", { children: _jsx(SnackList, {}) })] }));
}
export default App;
