import sys
import os
from faster_whisper import WhisperModel

def main():
    if len(sys.argv) < 4:
        print("Usage: python whisper.py <audio_path> <language> <output_dir>")
        sys.exit(1)

    audio_path = sys.argv[1]
    language = sys.argv[2]
    output_dir = sys.argv[3]

    model = WhisperModel("small")  # bạn có thể thay model nếu muốn

    segments, info = model.transcribe(audio_path, language=language)

    srt_filename = os.path.splitext(os.path.basename(audio_path))[0] + ".srt"
    srt_path = os.path.join(output_dir, srt_filename)

    with open(srt_path, "w", encoding="utf-8") as f:
        for i, segment in enumerate(segments, start=1):
            start = segment.start
            end = segment.end
            text = segment.text.strip()
            f.write(f"{i}\n")
            f.write(f"{format_timestamp(start)} --> {format_timestamp(end)}\n")
            f.write(f"{text}\n\n")

    print(f"✅ Đã tạo phụ đề: {srt_path}")

def format_timestamp(seconds):
    h = int(seconds // 3600)
    m = int((seconds % 3600) // 60)
    s = int(seconds % 60)
    ms = int((seconds - int(seconds)) * 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"

if __name__ == "__main__":
    main()
