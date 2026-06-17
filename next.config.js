const nextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_KEY
  },
  async rewrites() {
    return [
      { source: "/logout", destination: "/api/logout" },
      { source: "/labinfo", destination: "/api/labinfo" },
      { source: "/load-analisis", destination: "/api/load-analisis" },
      { source: "/send-table-change/cell", destination: "/api/send-table-change/cell" },
      { source: "/deleteanalisis", destination: "/api/deleteanalisis" },
      { source: "/files/get-analisis-filesdata", destination: "/api/files/get-analisis-filesdata" },
      { source: "/files/uploadfile", destination: "/api/files/uploadfile" },
      { source: "/files/removefile", destination: "/api/files/removefile" },
      { source: "/files/send-table-change/cell", destination: "/api/files/send-table-change/cell" },
      { source: "/laboratories", destination: "/api/laboratories" },
      { source: "/laboratories/create", destination: "/api/laboratories/create" },
      { source: "/laboratories/delete", destination: "/api/laboratories/delete" },
      { source: "/laboratories/send-table-change/cell", destination: "/api/laboratories/send-table-change/cell" },
      { source: "/createanalisis", destination: "/api/createanalisis" }
    ];
  }
};

export default nextConfig;


