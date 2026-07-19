import pdfplumber


def parse_transactions(file_obj):
    try:
        file_obj.seek(0)
        with pdfplumber.open(file_obj) as pdf:
            text_blocks = [page.extract_text() or "" for page in pdf.pages]
            return "\n".join(text_blocks)
    except Exception:
        return ""
    


