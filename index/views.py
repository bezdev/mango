from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login

from . import serializers as index_serializers

def index(request):
    return render(request, 'index/index.html')

@api_view(['POST'])
def user_login(request):
    serializer = index_serializers.UserLoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(request, username=serializer.validated_data['username'], password=serializer.validated_data['password'])

        if user is not None:
            login(request, user)
            return Response(status=200)

    return Response(status=400)
