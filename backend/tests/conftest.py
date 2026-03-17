import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from unittest.mock import patch

from database import Base, get_db
from main import app
from services.llm_service import LLMService

# Mock Database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def db():
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db):
    from routes.auth_routes import get_current_user
    def override_get_db():
        try:
            yield db
        finally:
            pass
    def override_get_current_user():
        return {"email": "test@example.com", "name": "Test User"}
        
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = override_get_current_user
    yield TestClient(app)
    del app.dependency_overrides[get_db]
    del app.dependency_overrides[get_current_user]

@pytest.fixture
def mock_llm():
    with patch.object(LLMService, 'generate') as mocked_gen:
        yield mocked_gen
