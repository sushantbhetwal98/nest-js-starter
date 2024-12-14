export default () => {
  return {
    PORT: process.env.PORT,
    DATABASE: {
      HOST: process.env.DATABASE_HOST,
      PORT: parseInt(process.env.DATABASE_PORT),
      PASSWORD: process.env.DATABASE_PASSWORD,
      USERNAME: process.env.DATABASE_USERNAME,
      NAME: process.env.DATABASE_NAME,
      SYNCHRONIZE: process.env.DATABASE_SYNCHRONIZE === 'true',
    },
  };
};
