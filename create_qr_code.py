import sys
import qrcode

def create_qr_code(data, output_file='qrcode.png'):
    """
    Generate a QR code from the provided data and save it as an image file.
    Args:
        data (str): The data to encode in the QR code.
        output_file (str): The filename for the output image (default: 'qrcode.png').
    """
    img = qrcode.make(data)
    img.save(output_file)
    print(f"QR code saved to {output_file}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python create_qr_code.py <data> [output_file]")
        sys.exit(1)
    data = sys.argv[1]
    output_file = sys.argv[2] if len(sys.argv) > 2 else 'qrcode.png'
    create_qr_code(data, output_file)
