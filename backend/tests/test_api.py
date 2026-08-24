"""
Tests for API endpoints.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.models import init_db

# Initialize database before tests
init_db()

client = TestClient(app)


class TestHealthEndpoint:
    """Test health check endpoint."""
    
    def test_health_check(self):
        """Test health endpoint returns healthy status."""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data or "version" in data
    
    def test_root_endpoint(self):
        """Test root endpoint."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert data["status"] == "running"


class TestCallsAPI:
    """Test calls API endpoints."""
    
    def test_start_call(self):
        """Test starting a new call."""
        response = client.post(
            "/api/calls/start",
            json={
                "phoneNumber": "+919876543210",
                "customerName": "Test Customer"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "callId" in data
    
    def test_get_call(self):
        """Test getting call details."""
        # First create a call
        start_response = client.post(
            "/api/calls/start",
            json={"phoneNumber": "+919876543211"}
        )
        call_id = start_response.json()["callId"]
        
        # Then get the call
        response = client.get(f"/api/calls/{call_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == call_id
        assert data["phoneNumber"] == "+919876543211"
    
    def test_get_calls_history(self):
        """Test getting call history."""
        response = client.get("/api/calls")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_nonexistent_call(self):
        """Test getting a non-existent call."""
        response = client.get("/api/calls/nonexistent_call_id")
        assert response.status_code == 404
    
    def test_schedule_callback(self):
        """Test scheduling a callback."""
        # First create a call
        start_response = client.post(
            "/api/calls/start",
            json={"phoneNumber": "+919876543212"}
        )
        call_id = start_response.json()["callId"]
        
        # Schedule callback
        response = client.post(
            f"/api/calls/{call_id}/callback",
            json={
                "requestedTime": "tomorrow at 2 pm",
                "notes": "Follow up after demo"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["requested"] is True
    
    def test_end_call(self):
        """Test ending a call."""
        # First create a call
        start_response = client.post(
            "/api/calls/start",
            json={"phoneNumber": "+919876543213"}
        )
        call_id = start_response.json()["callId"]
        
        # End the call
        response = client.post(f"/api/calls/{call_id}/end")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
