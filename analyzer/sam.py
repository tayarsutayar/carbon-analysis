import shutil
import cv2
import torch
from segment_anything import sam_model_registry, SamAutomaticMaskGenerator, SamPredictor
import os
import supervision as sv

DEVICE = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')
MODEL_TYPE = "vit_h"
HOME = os.getcwd()
CHECKPOINT_PATH = "analyzer/weights/sam_vit_h_4b8939.pth"

def segmentImage(filename):
  INPUT_PATH = 'temp/input/'+filename
  OUTPUT_PATH = 'temp/output/final-'+filename
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
  cv2.imwrite(OUTPUT_PATH, im_bw)

  response = {
    'jenis': 'Hutan Mangrove',
    'karbon_atas': 123.45,
    'karbon_bawah': 678.90,
    'harga_karbon': 'Rp. xxx.xxx.xxx',
    'output_path': SEGMENT_PATH
  }

  return response