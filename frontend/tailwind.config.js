/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./public/index.html"],
    theme: {
        extend: {
            fontFamily: {
                heading: ["Outfit", "ui-sans-serif", "system-ui"],
                body: ["Figtree", "ui-sans-serif", "system-ui"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            colors: {
                qc: {
                    yellow: "#FFD500",
                    yellowHover: "#E6C000",
                    blue: "#38B6FF",
                    blueHover: "#2DA0E5",
                    red: "#FF5757",
                    green: "#00D084",
                    cream: "#FFFDF9",
                    ink: "#111111",
                    inkSoft: "#4A4A4A",
                },
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
            },
            boxShadow: {
                brutal: "4px 4px 0px 0px rgba(17,17,17,1)",
                brutalLg: "6px 6px 0px 0px rgba(17,17,17,1)",
                brutalSm: "2px 2px 0px 0px rgba(17,17,17,1)",
                brutalXl: "8px 8px 0px 0px rgba(17,17,17,1)",
            },
            keyframes: {
                "accordion-down": { from: { height: "0" }, to: { height: "var(--radix-accordion-content-height)" } },
                "accordion-up": { from: { height: "var(--radix-accordion-content-height)" }, to: { height: "0" } },
                "bounce-soft": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-6px)" } },
                "fade-up": { "0%": { opacity: "0", transform: "translateY(12px)" }, "100%": { opacity: "1", transform: "translateY(0)" } },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "bounce-soft": "bounce-soft 2.5s ease-in-out infinite",
                "fade-up": "fade-up 0.5s ease-out both",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
