import streamlit as st
from supabase import create_client

import logging
logger = logging.getLogger(__name__)

try:
    url = st.secrets["supabase"]["https://nfedehusqmkaqcrktqor.supabase.co"]
    key = st.secrets["supabase"]["sb_publishable_zXZiO5TiilG5-0Ni831iww_LzXg2Lu8"]
    supabase = create_client(url, key)
    res = supabase.table("audit_logs").select("*").limit(1).execute()
except Exception as e:
    logger.warning("Test DB connection: %s", e)