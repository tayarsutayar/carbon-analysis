import shutil
import cv2
import torch
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor
import os
import supervision as sv
from PIL import Image
import numpy as np
import math
import locale

locale.setlocale(locale.LC_ALL, 'en_US')

DEVICE = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
MODEL_TYPE = "vit_h"
HOME = os.getcwd()
CHECKPOINT_PATH = "analyzer/weights/sam_vit_h_4b8939.pth"

def calculate_scale(zoom, latitude):
  return 156543.03392 * math.cos(latitude * math.pi / 180) / math.pow(2, zoom)

def calculate_pixel_counts(image_path):
  image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
  white_pixels = np.sum(image == 255)
  black_pixels = np.sum(image == 0)
  return white_pixels, black_pixels

def segmentImage(filename, zoom, latitude):
  INPUT_PATH = 'temp/input/'+filename
  OUTPUT_PATH = 'temp/output/final-'+filename
  BW_PATH = 'temp/output/bw-'+filename
  SEGMENT_PATH = 'temp/output/segment-'+filename
  
  sam = sam_model_registry[MODEL_TYPE](checkpoint=CHECKPOINT_PATH).to(device=DEVICE)
  mask_generator = SamAutomaticMaskGenerator(sam)

  image_bgr = cv2.imread(INPUT_PATH)
  image_rgb = cv2.cvtColor(image_bgr, cv2.COLOR_BGR2RGB)
  sam_result = mask_generator.generate(image_rgb)

  mask_annotator = sv.MaskAnnotator(color_lookup=sv.ColorLookup.INDEX)
  detections = sv.Detections.from_sam(sam_result=sam_result)
  annotated_image = mask_annotator.annotate(scene=image_bgr.copy(), detections=detections)
  cv2.imwrite(SEGMENT_PATH, annotated_image)

  im_gray = cv2.imread(SEGMENT_PATH, cv2.IMREAD_GRAYSCALE)
  thresh = 127
  im_bw = cv2.threshold(im_gray, thresh, 255, cv2.THRESH_BINARY)[1]
  cv2.imwrite(BW_PATH, im_bw)

  #calculate
  img = Image.open(BW_PATH)
  width, height = img.size
  dpi = img.info.get('dpi', (96, 96))
  print(f"Image size: {width}x{height} pixels")
  print(f"Image DPI: {dpi[0]}x{dpi[1]}")
  width_cm = width / dpi[0] * 2.54
  height_cm = height / dpi[1] * 2.54
  skala = calculate_scale(zoom=zoom, latitude=latitude)
  luas_gambar = width_cm*height_cm*skala
  print('luas = ', luas_gambar, 'm2')

  white_count, black_count = calculate_pixel_counts(BW_PATH)
  print(f"White pixels: {white_count}")
  print(f"Black pixels: {black_count}")
  # ngambil dari masknya (hitam putih)
  persentase_segmentasi = white_count/(black_count+white_count)*100
  print(f"Persentase segmentasi: {white_count/(black_count+white_count)*100} %")

  # persentase segmentasi didapat tinggal dikali luas gambar
  luas_segmentasi = persentase_segmentasi * luas_gambar

  #nilai karbon
  karbon_bawah = luas_segmentasi * 0.25 ## nilai dari paper terkait
  karbon_atas = luas_segmentasi * 0.49 ## nilai dari paper terkait
  harga_karbon = float("{:.2f}".format(karbon_bawah+karbon_atas * 58800))

  response = {
    'jenis': 'Hutan Mangrove',
    'karbon_atas': float("{:.2f}".format(karbon_atas)),
    'karbon_bawah': float("{:.2f}".format(karbon_bawah)),
    'harga_karbon': 'Rp. '+str(f'{harga_karbon:,}'),
    'output_path': SEGMENT_PATH
  }

  return response