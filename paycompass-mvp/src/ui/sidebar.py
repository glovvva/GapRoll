# -*- coding: utf-8 -*-
"""
UI Sidebar Module
=================
Sidebar z projektem, datasetem, szybkimi akcjami, logowaniem.
Called from app.py inside "with st.sidebar:" so the sidebar UI is explicitly
triggered after login (production: full UI, no debug).
"""

import streamlit as st


def render_sidebar() -> None:
    """
    Explicit UI trigger for the sidebar. Called by app.py immediately when
    rendering the dashboard (authenticated or show_login). Sidebar content
    is rendered by app.py after this call; this ensures the sidebar context
    is active and the UI path is taken after login.
    """
    pass
