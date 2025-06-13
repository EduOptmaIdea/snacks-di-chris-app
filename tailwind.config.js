/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            zIndex: {
                '1000': '1000',
                '1001': '1001',
            },
        },
    },
    plugins: [],
    corePlugins: {
        preflight: true,
    }
}