from io import BytesIO

from PIL import Image
import pytesseract


def text_from_image(file_obj):
    file_obj.seek(0)
    image_data = file_obj.read()
    image = Image.open(BytesIO(image_data))
    return pytesseract.image_to_string(image)

