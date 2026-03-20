from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Hybrid Neuro Companion API"
    app_env: str = "local"
    database_url: str = "sqlite+pysqlite:///:memory:"
    demo_data_dir: str = "/data/demo"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
