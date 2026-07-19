from app.parser.image_parser import text_from_image

content = text_from_image("data/invoice.png")

print(content)