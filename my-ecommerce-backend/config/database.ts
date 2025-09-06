export default ({ env }) => {
  const client = env("DATABASE_CLIENT", "sqlite");

  // Config SQLite (default)
  if (client === "sqlite") {
    return {
      connection: {
        client: "sqlite",
        connection: {
          filename: env("DATABASE_FILENAME", ".tmp/data.db"),
        },
        useNullAsDefault: true,
      },
    };
  }

  // Exemplo Postgres (se no futuro trocar variáveis)
  return {
    connection: {
      client,
      connection: {
        host: env("DATABASE_HOST", "127.0.0.1"),
        port: env.int("DATABASE_PORT", 5432),
        database: env("DATABASE_NAME", "strapi"),
        user: env("DATABASE_USERNAME", "strapi"),
        password: env("DATABASE_PASSWORD", "strapi"),
        ssl: env.bool("DATABASE_SSL", false),
      },
    },
  };
};
