import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    // @ts-ignore - Ignora o erro de tipagem caso o TS não reconheça a chave, mas o Next vai ler
    allowedDevOrigins: ['192.168.1.197', 'localhost:3000'],

    /* outras opções se houver */
};

export default nextConfig;