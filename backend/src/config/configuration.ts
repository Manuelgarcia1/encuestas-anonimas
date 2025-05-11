export default () => ({
  PORT: parseInt(process.env.PORT || '3000'),
  PREFIX: process.env.GLOBAL_PREFIX || 'api',
  DATABASE: {
    HOST: process.env.DB_HOST || 'localhost',
    PORT: parseInt(process.env.DB_PORT || '5432'),
    USERNAME: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    NAME: process.env.DB_NAME,
    SYNCHRONIZE: process.env.DB_SYNCHRONIZE === 'true',
    LOGGING: process.env.DB_LOGGING === 'true',
    LOGGER: process.env.DB_LOGGER,
  },
});
