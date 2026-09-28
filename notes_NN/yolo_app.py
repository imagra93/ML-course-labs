"""A small object-detection web app around a trained YOLO model (notes_NN/07_object_detection_yolo.ipynb).

Usage, from the notes_NN folder:
    python yolo_app.py --weights runs/wildlife/weights/best.pt
    python yolo_app.py --weights runs/wildlife/weights/best.pt --share    # temporary public link
"""
import argparse
from collections import Counter
from pathlib import Path

import gradio as gr
from ultralytics import YOLO


def make_detector(model):
    # wraps a YOLO model into detect(image, conf, iou) -> (annotated RGB image, [[class, count], ...])
    def detect(image, conf=0.4, iou=0.7):
        if image is None:
            return None, []
        result = model.predict(image, conf=conf, iou=iou, verbose=False)[0]   # PIL images are read as RGB
        annotated = result.plot()[:, :, ::-1]                                  # plot() draws in BGR; Gradio wants RGB
        counts = Counter(result.names[int(c)] for c in result.boxes.cls)
        return annotated, [[name, counts[name]] for name in result.names.values()]
    return detect


def build_demo(weights, examples=None):
    model = YOLO(weights)
    detect = make_detector(model)
    with gr.Blocks(title="Object detector") as demo:
        gr.Markdown(f"## Object detector\nDetects: {', '.join(model.names.values())}. "
                    "Upload a photo or use the webcam, then adjust the thresholds.")
        with gr.Row():
            with gr.Column():
                image = gr.Image(type="pil", label="Input image", sources=["upload", "webcam", "clipboard"])
                conf = gr.Slider(0.05, 0.95, value=0.4, step=0.05, label="Confidence threshold")
                iou = gr.Slider(0.1, 0.95, value=0.7, step=0.05, label="NMS IoU threshold")
                button = gr.Button("Detect", variant="primary")
            with gr.Column():
                output = gr.Image(label="Detections")
                counts = gr.Dataframe(headers=["class", "count"], label="Objects found")
        if examples:
            gr.Examples(examples, inputs=image)
        gr.on([button.click, image.change, conf.release, iou.release], detect, [image, conf, iou], [output, counts])
    return demo


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Object-detection web app")
    parser.add_argument("--weights", default="runs/wildlife/weights/best.pt")
    parser.add_argument("--examples", default="data/african-wildlife/images/test", help="folder with example images")
    parser.add_argument("--share", action="store_true", help="create a temporary public gradio.live link")
    args = parser.parse_args()
    folder = Path(args.examples)
    examples = sorted(str(p) for p in folder.iterdir() if p.suffix.lower() in (".jpg", ".jpeg", ".png"))[:8] if folder.is_dir() else None
    build_demo(args.weights, examples).launch(share=args.share)
