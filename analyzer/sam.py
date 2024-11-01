import shutil
import cv2

def segmentImage(filename):
  output_file = 'temp/output/'+filename

  #change this code with segmentetation process
  im_gray = cv2.imread('temp/input/'+filename, cv2.IMREAD_GRAYSCALE)
  thresh = 127
  im_bw = cv2.threshold(im_gray, thresh, 255, cv2.THRESH_BINARY)[1]
  cv2.imwrite(output_file, im_bw)

  return output_file