import logging
from django.shortcuts import render
from pprint import pprint

logger = logging.getLogger(__name__)

def life(request):
    #logger.warning(vars(request))
    return render(request, 'life/life.html')
