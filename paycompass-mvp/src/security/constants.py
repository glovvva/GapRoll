# -*- coding: utf-8 -*-
"""
Security Constants Module
=========================
Stałe bezpieczeństwa (max sizes, allowed types, RODO thresholds).
"""

# File Upload Limits (OWASP)
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
MAX_ROWS = 100000  # Max CSV rows
ALLOWED_EXTENSIONS = ['.csv', '.txt']
ALLOWED_MIME_TYPES = ['text/csv', 'text/plain', 'application/vnd.ms-excel']

# RODO (Art.16)
RODO_GROUP_THRESHOLD = 10  # Min employees per group for anonymization

# CSV Injection Patterns
CSV_INJECTION_PREFIXES = ['=', '+', '-', '@', '\t', '\r']
