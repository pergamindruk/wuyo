/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    // Ochrona przed Clickjackingiem
                    {
                        key: "X-Frame-Options",
                        value: "SAMEORIGIN",
                    },
                    // Zapobiega sniffowaniu typów MIME
                    {
                        key: "X-Content-Type-Options",
                        value: "nosniff",
                    },
                    // Polityka Referrer – nie ujawnia pełnego URL-a do zewnętrznych serwisów
                    {
                        key: "Referrer-Policy",
                        value: "strict-origin-when-cross-origin",
                    },
                    // Permisions Policy – wyłącza zbędne API przeglądarki
                    {
                        key: "Permissions-Policy",
                        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
                    },
                    // HSTS dla HTTPS (aktywny po przejściu na produkcję z SSL)
                    {
                        key: "Strict-Transport-Security",
                        value: "max-age=63072000; includeSubDomains; preload",
                    },
                    // Content Security Policy – zezwala na Google Fonts, blokuje nieznane skrypty
                    {
                        key: "Content-Security-Policy",
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com",
                            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
                            "font-src 'self' https://fonts.gstatic.com",
                            "img-src 'self' data: blob: https:",
                            "connect-src 'self' https://www.google-analytics.com",
                            "frame-src 'self' https://www.google.com",
                        ].join("; "),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
