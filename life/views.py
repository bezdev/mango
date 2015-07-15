from django.shortcuts import render

def life(request):
    return render(request, 'life/life.html')
