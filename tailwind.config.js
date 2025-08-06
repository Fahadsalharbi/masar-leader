export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#006c4e",
        secondary: "#c5a880",
      },
      fontFamily: {
        // إضافة الخط كخيار افتراضي
        sans: ['Tajawal', 'sans-serif'],
      },
    },
  },
  darkMode: "class",
  plugins: [],
}