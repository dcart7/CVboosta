from PIL import Image

def remove_white_background(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    
    datas = img.getdata()
    
    newData = []
    for item in datas:
        # If the pixel is white or very close to white, make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    remove_white_background(
        "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/frontend/public/logo.png",
        "/Users/denys/CV AI Optimizer/CV-AI-Optimizer/frontend/public/logo.png"
    )
