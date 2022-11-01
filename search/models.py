from django.db import models

SEARCH_RESULT_CACHE = {}

def setSearchResuls(key, results):
    SEARCH_RESULT_CACHE[key] = results
