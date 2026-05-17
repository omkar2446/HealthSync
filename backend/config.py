import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_KEY", "") 

if not url or not key:
    print("\n" + "="*50)
    print("CRITICAL WARNING: SUPABASE_URL or SUPABASE_KEY not set.")
    print("Please rename backend/.env.example to backend/.env and add your keys.")
    print("="*50 + "\n")
    # Provide a dummy client that raises clear errors to prevent NoneType crashes
    class DummyAuth:
        def sign_up(self, *args, **kwargs):
            raise Exception("Supabase is not configured! Please set SUPABASE_URL and SUPABASE_KEY in backend/.env")
        def sign_in_with_password(self, *args, **kwargs):
            raise Exception("Supabase is not configured! Please set SUPABASE_URL and SUPABASE_KEY in backend/.env")
        
    class DummyClient:
        auth = DummyAuth()
        def table(self, *args, **kwargs):
            raise Exception("Supabase is not configured! Please set SUPABASE_URL and SUPABASE_KEY in backend/.env")
            
    supabase = DummyClient()
else:
    supabase: Client = create_client(url, key)
