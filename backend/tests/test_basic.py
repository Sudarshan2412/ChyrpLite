from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root():
    r = client.get('/')
    assert r.status_code == 200
    assert 'Welcome' in r.json()['message']

def test_register_and_login():
    import random, string
    uname = 'u' + ''.join(random.choices(string.ascii_lowercase, k=6))
    email = f"{uname}@example.com"
    pw = "pass1234"
    r = client.post('/auth/register', json={"username": uname, "email": email, "password": pw})
    assert r.status_code == 200
    r = client.post('/auth/login', json={"username": uname, "password": pw})
    assert r.status_code == 200
    assert r.json().get('access_token')