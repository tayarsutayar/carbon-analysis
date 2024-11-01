# api/views.py

from django.http import HttpResponse
import json
import requests
import uuid
from analyzer.sam import segmentImage
from django.http import JsonResponse

def analyze(request):
  image_url = request.GET["url"]
  img_data = requests.get(image_url).content
  filename = str(uuid.uuid4())+".jpg"
  with open("temp/input/"+filename, 'wb') as handler:
    handler.write(img_data)
  
  response = segmentImage(filename)

  return JsonResponse(response)
  
def get_image(request):
  image_path = request.GET["path"]
  
  with open(image_path, "rb") as f:
    return HttpResponse(f.read(), content_type="image/jpeg")
