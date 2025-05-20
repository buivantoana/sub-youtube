import os
import subprocess
import sys
import glob

video_url = 'https://www.youtube.com/watch?v=UTTFvKUnITw'
output_dir = os.getcwd()
language = 'vi'  # ví dụ: 'en', 'vi', 'ja'

def run_command(command):
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode != 0:
            raise subprocess.CalledProcessError(result.returncode, command, output=result.stdout, stderr=result.stderr)
        return result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        raise RuntimeError(f"Lỗi khi chạy lệnh: {e.cmd}\nSTDERR: {e.stderr}") from e

def download_or_generate_subtitles():
    try:
        print(f'🟡 Kiểm tra và tải phụ đề ngôn ngữ "{language}" từ video...')

        yt_dlp_command = f'yt-dlp --write-sub --sub-lang {language} --convert-subs srt --skip-download -o "{os.path.join(output_dir, "%(title)s.%(ext)s")}" "{video_url}"'
        stdout, stderr = run_command(yt_dlp_command)
        print(stdout)
        if stderr:
            print(f'⚠️ {stderr}', file=sys.stderr)

        # Kiểm tra file phụ đề
        srt_files = glob.glob(os.path.join(output_dir, f'*{language}.srt'))
        if srt_files:
            print(f'✅ Đã tải phụ đề: {", ".join(srt_files)}')
            return

        # Tải audio nếu không có phụ đề
        print(f'🔵 Không có phụ đề "{language}". Đang tải audio...')
        audio_file = os.path.join(output_dir, 'temp_audio.mp3')
        audio_command = f'yt-dlp -x --audio-format mp3 -o "{audio_file}" "{video_url}"'
        run_command(audio_command)
        print(f'✅ Đã tải audio vào: {audio_file}')

        # Tạo phụ đề bằng faster-whisper
        print(f'🔵 Đang tạo phụ đề tự động với faster-whisper (ngôn ngữ: {language})...')
        whisper_command = f'python3 whisper.py "{audio_file}" {language} "{output_dir}"'
        whisper_out, whisper_err = run_command(whisper_command)
        print(whisper_out)
        if whisper_err:
            print(f'⚠️ {whisper_err}', file=sys.stderr)

        whisper_srt = os.path.join(output_dir, 'temp_audio.srt')
        if os.path.exists(whisper_srt):
            print(f'✅ faster-whisper đã tạo phụ đề: {whisper_srt}')
            os.remove(audio_file)
            print('🗑️ Đã xóa file âm thanh tạm thời.')
        else:
            raise FileNotFoundError('Không thể tạo phụ đề tự động bằng faster-whisper.')

    except Exception as e:
        print(f'❌ Lỗi: {e}', file=sys.stderr)
        print('🧩 Gợi ý:')
        print('  - Kiểm tra video có phụ đề thật không')
        print('  - Đảm bảo đã cài Python, ffmpeg, yt-dlp, faster-whisper')

if __name__ == '__main__':
    download_or_generate_subtitles()
