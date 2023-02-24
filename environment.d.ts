// Make environment variables strongly typed
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGO_URI: string;
      NODE_ENV: "development" | "production";
      PORT?: number;
      SECRET_ACCESS_KEY: string;
      ACCESS_KEY: string;
      BUCKET_NAME: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
